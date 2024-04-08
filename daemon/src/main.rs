use std::{
    borrow::BorrowMut, collections::{HashMap, LinkedList}, convert::Infallible, env, fs, intrinsics::needs_drop, io, net::SocketAddr, path::PathBuf, str::Utf8Error, sync::{Arc, OnceLock}
};
use http_body_util::{BodyExt, Collected, Full};
use hyper::{
    body::Bytes,
    server::conn::http1,
    service::service_fn,
    Method,
    Request,
    Response
};
use hyper_util::rt::TokioIo;
use json::JsonValue;
use log::{info, error};
use daemonize::Daemonize;
use tokio::{
    net::TcpListener, process::Command, sync::{Mutex, RwLock}
};
use serde::ser;

static BOARDS: OnceLock<RwLock<Vec<Board>>> = OnceLock::new();
fn boards() -> &'static RwLock<Vec<Board>> {
    BOARDS.get_or_init(|| RwLock::new(Vec::new()))
}

#[derive(Debug)]
enum Error {
    // During what operation did the error happen
    FlagParse(char),
    ArgParse(String),
    ConfigRead(io::Error),
    ConfigParse(usize),
    DaemonLaunch(daemonize::Error),
    TcpBind(io::Error),
    Tcp(io::Error),
    BodyUnreadable,
    BodyNotUtf8(Utf8Error),
    BodynotJSON,
    QueryNotPresent,
    BoardIndexOOB(i32),
}

#[derive(Debug)]
struct Flags {
    config_file: String,
    daemonize: bool,
    dry_run: bool,
    verbose: bool,
}

impl Flags {
    fn parse_from_args() -> Result<Self, Error> {
        let mut flags = Flags::default();
        let mut set_config = false;
        for arg in env::args().skip(1) {
            if set_config {
                flags.config_file = arg.to_string();
                set_config = false;
            } else if arg.starts_with('-') {
                let input_flags = &arg[1..];
                for char in input_flags.chars() {
                    match char {
                        'd' => flags.daemonize = true,
                        'f' => set_config = true,
                        'n' => flags.dry_run = true,
                        'v' => flags.verbose = true,
                        invalid_char => return Err(Error::FlagParse(invalid_char)),
                    }
                }
            } else {
                return Err(Error::ArgParse(arg));
            }
        }
        return Ok(flags);
    }
}

#[derive(Clone)]
struct Config {
    log_file: PathBuf,
    pid_file: PathBuf, 
    plugin_dir: PathBuf,
    addr: SocketAddr,
}

impl std::default::Default for Config {
    fn default() -> Self {
        Self {
            log_file: PathBuf::from("/var/log/pdb.log"),
            pid_file: PathBuf::from("/var/run/pdb.pid"),
            plugin_dir: PathBuf::from("/usr/lib/lv2"),
            addr: "127.0.0.1:3444".parse().unwrap(),
        }
    }
}

impl Config {
    fn parse_from(path: &str) -> Result<Self, Error>
    {
        let file_contents = fs::read_to_string(path).map_err(|err| Error::ConfigRead(err))?;
        let mut config = Config::default();
        for (line_num, line) in file_contents.lines().enumerate() {
            if line.starts_with("#") {
                continue
            } else if let Some((key, value)) = line.split_once(' ') {
                match key {
                    "log_file" => config.log_file = value.parse().unwrap(),
                    "pid_file" => config.pid_file = value.parse().unwrap(),
                    "plugin_dir" => config.plugin_dir = value.parse().unwrap(),
                    "addr" => config.addr = value.parse().unwrap(),
                    _ => return Err(Error::ConfigParse(line_num)),
                }
            }
        }
        return Ok(config);
    }
}

impl std::default::Default for Flags {
    fn default() -> Self {
        Self {
            config_file: String::from("/etc/pbd.conf"),
            daemonize: false,
            dry_run: false,
            verbose: false,
        }
    }
}

fn configure(flags: &Flags, log_file: PathBuf, pid_file: PathBuf) -> Result<(), Error> {
    if flags.dry_run {
        println!("Config Ok!");
        return Ok(());
    }
    if flags.daemonize {
        let daemonize = Daemonize::new()
            .pid_file(pid_file)
            .chown_pid_file(true)
            .umask(0o002)
            .privileged_action(|| {
                let log = fs::OpenOptions::new()
                    .append(true)
                    .create(true)
                    .open(log_file)
                    .expect("Could not access log file");
                simplelog::WriteLogger::init(
                    simplelog::LevelFilter::Info,
                    simplelog::Config::default(),
                    log,
                ).expect("Could not initialize logger");
            });

        match daemonize.start() {
            Ok(_) => info!("Launched daemon!"),
            Err(e) => {
                return Err(Error::DaemonLaunch(e));
            },
        }
    } else if flags.verbose {
        simplelog::TermLogger::init(
            simplelog::LevelFilter::Info,
            simplelog::Config::default(),
            simplelog::TerminalMode::Mixed,
            simplelog::ColorChoice::Auto
        ).expect("Unable to initialize terminal logger");
    }
    Ok(())
}

fn main() -> Result<(), Error> {
    let flags = Flags::parse_from_args()?;
    let config = Config::parse_from(&flags.config_file)?;
    configure(&flags, config.log_file.clone(), config.pid_file.clone())?;
    run_server(config)?;
    Ok(())
}

struct Pedal {
    uri: String,
    config_values: HashMap<String, String>,
    input_port: String,
    output_port: String,
}

struct Board {
    pedals: LinkedList<Pedal>
}

impl Board {
    fn new() -> Self {
        Self {
            pedals: LinkedList::new(),
        }
    }
}

// Run the jack server. This function will often never return
#[tokio::main]
async fn run_server(config: Config) -> Result<(), Error> {
    info!("Starting server!");
    let listener = TcpListener::bind(config.addr).await.map_err(|e| Error::TcpBind(e))?;
    info!("Bound to address: {}", config.addr);

    // let boards: Arc<Mutex<Vec<Board>>> = Arc::new(Mutex::new(Vec::new()));
    loop {
        let (stream, _) = listener.accept().await.map_err(|e| Error::Tcp(e))?;
        let io = TokioIo::new(stream);

        tokio::task::spawn(async move {
            if let Err(err) = http1::Builder::new()
                .serve_connection(io, service_fn(process_req))
                .await
            {
                error!("Could not serve connction: {}", err);
            }
        });
    }
}

async fn process_req(req: Request<hyper::body::Incoming>) -> Result<Response<Full<Bytes>>, Infallible> {
    info!("Received a request for: {}", req.uri());
    let response = match (req.method(), req.uri().path()) {
        (&Method::DELETE, "/board") => delete_pedals(req).await,
        (&Method::GET, "/board/active") => async_todo().await,
        (&Method::PUT, "/board/active") => async_todo().await,
        (&Method::POST, "/board/pedal") => async_todo().await,
        (&Method::PUT, "/board/pedal") => async_todo().await,
        (&Method::DELETE, "/board/pedal") => async_todo().await,
        (&Method::GET, "/pedal") => async_todo().await,
        (_, _) => not_supported().await,
    };
    return Ok(response.unwrap());
    // return Ok(Response::new(Full::new(Bytes::from(response))));
}

async fn async_todo() -> Result<Response<Full<Bytes>>, Error> {
    return Ok(Response::new(Full::from("TODO")));
}

async fn not_supported() -> Result<Response<Full<Bytes>>, Error> {
    return Ok(Response::new(Full::from("This uri is not supported")));
}

fn insert_at(l: &mut LinkedList<u8>, idx: usize, val: u8) {
    let mut tail = l.split_off(idx);
    l.push_back(val);
    l.append(&mut tail);
}

// Delete all pedals from a specified board
async fn delete_pedals(req: Request<hyper::body::Incoming>) -> Result<Response<Full<Bytes>>, Error> {
    let queries = get_queries(req);
    let board_index = queries
        .get("board_index")
        .map(|b_idx| b_idx.parse().unwrap_or(-1))
        .unwrap_or(-1);
    if board_index == -1 {
        return Err(Error::BoardIndexOOB(board_index));
    } else {
        let mut boards = boards()
            .write()
            .await;
        let board = boards.get_mut(board_index as usize).unwrap();
        let pedals = board.pedals.borrow_mut();
        let mut iter = pedals.iter_mut();
        let mut cur_pedal = iter.next().unwrap();
        let mut next = iter.next();
        loop {
            if next.is_none() { // Break if last
                break;
            }
            let next_pedal = next.unwrap();
            let command = format!("jack_disconnect {} {}", cur_pedal.output_port, next_pedal.input_port);
            Command::new(command);

            // Next iteration
            cur_pedal = next_pedal;
            next = iter.next();
        }

        let input = pedals.pop_front().unwrap();
        let output = pedals.pop_back().unwrap();
        let mut ll = LinkedList::new();
        ll.push_front(input);
        ll.push_back(output);
    }

    // info!("Succesfully parsed json: {json:#?}");
    return Ok(Response::new(Full::new(Bytes::from(""))));
}

fn get_queries(req: Request<hyper::body::Incoming>) -> HashMap<String, String> {
    req.uri()
        .query()
        .map(|v| {
            url::form_urlencoded::parse(v.as_bytes())
                .into_owned()
                .collect()
        }) .unwrap_or_else(HashMap::new)
}

async fn get_json_from_body(body: hyper::body::Incoming) -> Result<JsonValue, Error> {
    let body = body
        .collect()
        .await
        .map_err(|e| Error::BodyUnreadable)?
        .to_bytes();
    let contents = std::str::from_utf8(body.as_ref())
        .map_err(|e| Error::BodyNotUtf8(e))?;
    json::parse(contents).map_err(|e| Error::BodynotJSON)
}

/*
 * ADD:
 *  - Server creation / daemonization
 *  - Jack routing based on server arguments
 */
