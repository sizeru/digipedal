use std::{
    borrow::BorrowMut, collections::{HashMap, LinkedList}, convert::Infallible, env, fs, io, net::SocketAddr, path::{Path, PathBuf}, process::ExitStatus, str::Utf8Error, sync::OnceLock
};
use http_body_util::{BodyExt, Full};
use hyper::{
    body::Bytes,
    server::conn::http1,
    service::service_fn,
    Method,
    Request,
    Response
};
use hyper_util::rt::TokioIo;
// use jack::jack_sys::{jack_client_open, jack_connect};
use json::JsonValue;
use log::{info, error};
use daemonize::Daemonize;
use tokio::{
    net::TcpListener,
    process::{Child, Command},
    sync::RwLock,
    io::AsyncWriteExt
};
use turtle_syntax::Parse;

static SET: OnceLock<RwLock<SetList>> = OnceLock::new();
fn set() -> &'static RwLock<SetList> {
    SET.get_or_init(|| RwLock::new(SetList::default()))
}

static CONFIG: OnceLock<RwLock<Config>> = OnceLock::new();
fn set_config(config: Config) -> &'static RwLock<Config> {
    CONFIG.get_or_init(|| RwLock::new(config))
}
fn get_config() -> &'static RwLock<Config> {
    CONFIG.get().unwrap()
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
    BoardIndexOOB(usize),
    JsonUnexpectedKey(String),
    JsonNoBoardIndex,
    JsonNoPedalIndex,
    JsonNoPedalUri,
    JsonNoPedalInput,
    JsonNoPedalOutput,
    JsonParamNotString,
    JalvCannotStart(io::Error),
    PedalsMissing,
    PedalChildless,
    WalkDirError(walkdir::Error),
    ManifestRead(io::Error),
    TtfParse,
    Unimplemented,
    Command(io::Error),
    CommandExitFailure(ExitStatus),
    CommmandResponseNotUtf8(Utf8Error),
    CommandStdInFailure,
    PedalOOB(usize),
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
    audio_in: String,
    audio_out: String,
    data_dir: PathBuf,
}

impl std::default::Default for Config {
    fn default() -> Self {
        // TODO: Add system audio_in and audio_out to config
        Self {
            log_file: PathBuf::from("/var/log/pdb.log"),
            pid_file: PathBuf::from("/var/run/pdb.pid"),
            plugin_dir: PathBuf::from("/usr/lib/lv2"),
            addr: "127.0.0.1:3444".parse().unwrap(),
            audio_in: String::from("system:capture_1"),
            audio_out: String::from("system:output_1"),
            data_dir: PathBuf::from("/var/lib/pdb"),
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
                    "audio_in" => config.audio_in = value.to_owned(),
                    "audio_out" => config.audio_out = value.to_owned(),
                    "data_dir" => config.data_dir = value.parse().unwrap(),
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

struct JackClient {
    name: String,
    process: Option<Child>,
    input_port: String,
    output_port: String,
}
// TODO: To update the controls of a client, I need to write to the stdin of the child process. <param> = <value>

impl JackClient {
    fn bind<A, B, C>(client_name: A, input_port: B, output_port: C) -> Self 
        where A: ToString, B: ToString, C: ToString
    {
        Self {
            name: client_name.to_string(),
            process: None,
            input_port: input_port.to_string(),
            output_port: output_port.to_string(),
        }
    }

    async fn launch_plugin(lv2_dir: &Path, pedal_uri: &str) -> Result<Self, Error> {
        for entry in walkdir::WalkDir::new(lv2_dir) { // TODO: BLOCKING CODE HERE.
            let entry = entry.map_err(|e| Error::WalkDirError(e))?;
            let file_name = entry.file_name();
            if file_name == "manifest.ttl" {
                let contents = tokio::fs::read_to_string(file_name).await.map_err(|e| Error::ManifestRead(e))?;
                let doc = turtle_syntax::Document::parse_str(&contents, |span| span)
                    .map_err(|e| Error::TtfParse)?;
                for statement in &doc.statements {
                    info!("Statement: {statement:#?}");
                }
            }
        }
        /*
         * 1. Search for lv2 plugin
         * 2. Parse manifest and bind
         * 3. 
         *  */
        // launch in jalv
        // read input and output ports
        return Err(Error::Unimplemented);
    }

    fn kill(mut self) {

    }
}

struct Board {
    pedals: LinkedList<JackClient>
}

impl Board {
    // fn init(input_port: &str, output_port: &str) -> Self {
    //     let pedals = LinkedList::new();

    //     Self {
    //     }
    // }

    async fn new() -> Self {
        let config = CONFIG.get().unwrap().read().await;
        let mut pedals = LinkedList::new();
        pedals.push_back(JackClient {
            name: "system".to_owned(),
            process: None,
            input_port: "dummy".to_owned(),
            output_port: config.audio_in.to_string(),
        });
        pedals.push_back(JackClient {
            name: "system".to_owned(),
            process: None,
            input_port: config.audio_out.to_string(),
            output_port: "dummy".to_owned(),
        });
        return Board {
            pedals
        }
    }
}

// a SetList is a combination of several pedal boards
struct SetList {
    active: usize,
    system_audio: JackClient, // assuming mono audio for rn
    boards: Vec<Board>
}

impl Default for SetList {
    fn default() -> Self {
        Self {
            active: 0,
            system_audio: JackClient::bind("system", "capture_1", "output_1"),
            boards: Vec::new(),
        }
    }
}

// Run the jack server. This function will often never return
#[tokio::main]
async fn run_server(config: Config) -> Result<(), Error> {
    info!("Launching server...");
    let listener = TcpListener::bind(config.addr).await.map_err(|e| Error::TcpBind(e))?;
    set_config(config);
    info!("Bound to address: {}", get_config().read().await.addr);
    let output = Command::new("aj-snapshot")
        .arg("-jx")
        .output().await
        .map_err(|e| Error::Command(e))?;
    if !output.status.success() {
        info!(
            "(aj-snapshot -jx) {}",
            std::str::from_utf8(output.stderr.as_slice()).map_err(|e| Error::CommmandResponseNotUtf8(e))?
        );
        return Err(Error::CommandExitFailure(output.status))
    }
    info!(
        "(aj-snapshot -jx) {}",
        std::str::from_utf8(output.stdout.as_slice()).map_err(|e| Error::CommmandResponseNotUtf8(e))?
    );
    let output = Command::new("jack_connect")
        .args(&[&get_config().read().await.audio_in, &get_config().read().await.audio_out])
        .output().await
        .map_err(|e| Error::Command(e))?;
    if !output.status.success() {
        info!(
            "(jack_connect {} {}) {}",
            get_config().read().await.audio_in,
            get_config().read().await.audio_out,
            std::str::from_utf8(output.stderr.as_slice()).map_err(|e| Error::CommmandResponseNotUtf8(e))?
        );
        return Err(Error::CommandExitFailure(output.status))
    }
    info!(
        "(jack_connect {} {}) {}",
        get_config().read().await.audio_in,
        get_config().read().await.audio_out,
        std::str::from_utf8(output.stdout.as_slice()).map_err(|e| Error::CommmandResponseNotUtf8(e))?
    );
    info!("...Server launched!");

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
        (&Method::GET, "/board/active") => get_active_board().await,
        (&Method::PUT, "/board/active") => set_active_board(req).await,
        (&Method::POST, "/board/pedal") => add_pedal(req).await,
        (&Method::PUT, "/board/pedal") => update_pedal(req).await,
        (&Method::DELETE, "/board/pedal") => delete_pedal(req).await,
        (&Method::GET, "/pedal") => async_unimplemented().await,
        (_, _) => not_supported().await,
    };
    // TODO: Unwrap is dangerous. Need to provide an error response if any of these api calls fail.
    return Ok(response.unwrap());
    // return Ok(Response::new(Full::new(Bytes::from(response))));
}

async fn async_unimplemented() -> Result<Response<Full<Bytes>>, Error> {
    return Ok(Response::new(Full::from("Unimplemented")));
}

async fn not_supported() -> Result<Response<Full<Bytes>>, Error> {
    return Ok(Response::new(Full::from("This uri is not supported")));
}

async fn delete_pedal(req: Request<hyper::body::Incoming>) -> Result<Response<Full<Bytes>>, Error> {
    let queries = get_queries(&req);
    let board_index = get_query_usize(&queries, "board_index")?;
    let pedal_index = get_query_usize(&queries, "pedal_index")? + 1;
    
    // Delete this pedal
    let boards = &mut set().write().await.boards;
    let board = match boards.get_mut(board_index) {
        Some(board) => Ok(board),
        None => if board_index == boards.len() + 1 {
            boards.push(Board::new().await);
            Ok(boards.get_mut(board_index).unwrap())
        } else {
            Err(Error::BoardIndexOOB(board_index))
        }
    }?;

    let mut after = board.pedals.split_off(pedal_index);
    let before = board.pedals.borrow_mut();
    let target_pedal = after.pop_front().ok_or(Error::PedalsMissing)?; // TODO: This error names are shitty
    let pedal_after = after.front().ok_or(Error::PedalsMissing)?;
    let pedal_before = before.back().ok_or(Error::PedalsMissing)?;
    let disconnect_first = Command::new("jack_disconnect")
        .args(&[&target_pedal.input_port, &pedal_before.output_port])
        .output().await
        .map_err(|e| Error::Command(e))?;
    let disconnect_second = Command::new("jack_disconnect")
        .args(&[&target_pedal.output_port, &pedal_after.input_port])
        .output().await
        .map_err(|e| Error::Command(e))?;
    let connect_first = Command::new("jack_connect")
        .args(&[&pedal_before.output_port, &pedal_after.input_port])
        .output().await
        .map_err(|e| Error::Command(e))?;
    before.append(&mut after);
    target_pedal.process.unwrap().kill();
    Ok(Response::new(Full::new(Bytes::new())))
}

async fn update_pedal(req: Request<hyper::body::Incoming>) -> Result<Response<Full<Bytes>>, Error> {
    // Read values from JSON
    let json = get_json_from_body(req.into_body()).await?;
    let mut board_index = None;
    let mut pedal_index = None;
    let mut param_updates: Vec<(String, String)> = Vec::new();
    for (key, value) in json.entries() {
        match key {
            "board_index" => board_index = value.as_usize(),
            "pedal_index" => pedal_index = value.as_usize(),
            "param_vals" => {
                for (param_name, param_val) in value.entries() {
                    param_updates.push((
                        param_name.to_owned(), 
                        param_val.as_str()
                            .map(|string| string.to_owned())
                            .ok_or(Error::JsonParamNotString)?
                        ));
                }
            },
            _ => return Err(Error::JsonUnexpectedKey(key.to_owned())),
        }
    }
    if board_index.is_none() { return Err(Error::JsonNoBoardIndex); }
    let board_index = board_index.unwrap();
    if pedal_index.is_none() { return Err(Error::JsonNoPedalIndex); }
    let pedal_index = pedal_index.unwrap();

    // Update the controls of a pedal
    let mut set = set()
        .write().await;
    let board = set
        .boards
        .get_mut(board_index)
        .ok_or(Error::BoardIndexOOB(board_index))?;

    let mut i = 0;
    let mut pedal_iter = board.pedals.iter_mut();
    while i < (pedal_index + 1) { // Add one because dummy pedal
        let _curr_pedal = pedal_iter.next();
        i += 1;
    }
    let mut target_pedal = pedal_iter.next().ok_or(Error::PedalOOB(pedal_index))?;
    let mut process_stdin = target_pedal
        .process.as_mut()
        .ok_or(Error::PedalChildless)?
        .stdin.as_mut()
        .ok_or(Error::CommandStdInFailure)?;
    for (param_name, param_value) in param_updates {
        let control_string = format!("{param_name}={param_value}\n");
        info!("Writing to {}: \"{}\"", &target_pedal.name, &control_string);
        process_stdin
            .write_all(control_string.as_bytes()).await
            .map_err(|e| Error::Command(e))?;
    }
    Ok(Response::new(Full::new(Bytes::new())))
}

// Adds a pedal to the board.
async fn add_pedal(req: Request<hyper::body::Incoming>) -> Result<Response<Full<Bytes>>, Error> {
    // Read values from JSON
    let json = get_json_from_body(req.into_body()).await?;
    let mut board_index = None;
    let mut pedal_index = None;
    let mut pedal_uri = None;
    let mut tarball = None;
    let mut audio_in = None;
    let mut audio_out = None;
    for (key, value) in json.entries() {
        match key {
            "board_index" => board_index = value.as_usize(),
            "pedal_index" => pedal_index = value.as_usize(),
            "pedal_uri" => pedal_uri = value.as_str(),
            "tarball" => tarball = value.as_str(),
            "audio_in" => audio_in = value.as_str(),
            "audio_out" => audio_out = value.as_str(),
            _ => return Err(Error::JsonUnexpectedKey(key.to_owned())),
        }
    }
    if board_index.is_none() { return Err(Error::JsonNoBoardIndex); }
    let board_index = board_index.unwrap();
    if pedal_index.is_none() { return Err(Error::JsonNoPedalIndex); }
    let pedal_index = pedal_index.unwrap();
    if pedal_uri.is_none() { return Err(Error::JsonNoPedalUri); }
    let pedal_uri = pedal_uri.unwrap();
    if audio_in.is_none() { return Err(Error::JsonNoPedalInput); }
    let audio_in = audio_in.unwrap();
    if audio_out.is_none() { return Err(Error::JsonNoPedalOutput); }
    let audio_out = audio_out.unwrap();

    let boards = &mut set().write().await.boards;
    let board = match boards.get_mut(board_index) {
        Some(board) => Ok(board),
        None => if board_index == boards.len() {
            boards.push(Board::new().await);
            Ok(boards.get_mut(board_index).unwrap())
        } else {
            Err(Error::BoardIndexOOB(board_index))
        }
    }?;

    let mut client = JackClient {
        name: "digi0".to_owned(), // TODO: We do not care about name. Only name of ports, which is assigned.
        process: None,
        input_port: audio_in.to_owned(),
        output_port: audio_out.to_owned(),
    };
    // Instantiate pedal. Insert into list. Add to JACK. Update metadata.
    let child = Command::new("jalv")
        .args(&["-x", "-n", &client.name, &pedal_uri])
        .stdin(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| Error::JalvCannotStart(e))?;
    client.process = Some(child);
    client.input_port = format!("{}:{}", &client.name, &client.input_port);
    client.output_port = format!("{}:{}", &client.name, &client.output_port);
    info!("Spawned a child succesfully");

    // Reconnect surrounding pedals
    let pedal_index = pedal_index + 1; // Shift pedal index to account for dummy pedals
    let mut after = board.pedals.split_off(pedal_index);
    let pedal_after = after.front().ok_or(Error::PedalOOB(pedal_index))?;
    let before = board.pedals.borrow_mut();
    let pedal_before = before.back().ok_or(Error::PedalOOB(pedal_index))?;

    let disconnect_output = Command::new("jack_disconnect")
        .args(&[&pedal_before.output_port, &pedal_after.input_port])
        .output().await
        .map_err(|e| Error::Command(e))?;
    if disconnect_output.status.success() {
        let output= std::str::from_utf8(disconnect_output.stdout.as_slice()).map_err(|e| Error::CommmandResponseNotUtf8(e))?;
        info!("(jack_disconnect {} {}) {output}", &pedal_before.output_port, &pedal_after.input_port);
    } else {
        let output= std::str::from_utf8(disconnect_output.stderr.as_slice()).map_err(|e| Error::CommmandResponseNotUtf8(e))?;
        info!("(jack_disconnect {} {}) {output}", &pedal_before.output_port, &pedal_after.input_port);
    }

    let _sleep = tokio::time::sleep(tokio::time::Duration::from_millis(500)); // TODO: RACE CONDITION WHAT
    let connect_first = Command::new("jack_connect")
        .args(&[&pedal_before.output_port, &client.input_port])
        .output().await
        .map_err(|e| Error::Command(e))?;
    if connect_first.status.success() {
        let output= std::str::from_utf8(connect_first.stdout.as_slice()).map_err(|e| Error::CommmandResponseNotUtf8(e))?;
        info!("(jack_connect {} {}) {output}", &pedal_before.output_port, &client.input_port);
    } else {
        let output= std::str::from_utf8(connect_first.stderr.as_slice()).map_err(|e| Error::CommmandResponseNotUtf8(e))?;
        info!("(jack_connect {} {}) {output}", &pedal_before.output_port, &client.input_port);
    }

    let connect_second = Command::new("jack_connect")
        .args(&[&client.output_port, &pedal_after.input_port])
        .output().await
        .map_err(|e| Error::Command(e))?;
    if connect_second.status.success() {
        let output= std::str::from_utf8(connect_second.stdout.as_slice()).map_err(|e| Error::CommmandResponseNotUtf8(e))?;
        info!("(jack_connect {} {}) {output}", &client.output_port, &pedal_after.input_port);
    } else {
        let output= std::str::from_utf8(connect_second.stderr.as_slice()).map_err(|e| Error::CommmandResponseNotUtf8(e))?;
        info!("(jack_connect {} {}) {output}", &client.output_port, &pedal_after.input_port);

    }

    before.push_back(client);
    before.append(&mut after);
    Ok(Response::new(Full::new(Bytes::new())))
}

// fn insert_at(l: &mut LinkedList<JackClient>, idx: usize, val: JackClient) {
//     let mut tail = l.split_off(idx);
//     l.push_back(val);
//     l.append(&mut tail);
// }

async fn get_active_board() -> Result<Response<Full<Bytes>>, Error> {
    let active_index = set().read().await.active;
    Ok(Response::new(Full::new(Bytes::from(active_index.to_string()))))
}

async fn set_active_board(req: Request<hyper::body::Incoming>) -> Result<Response<Full<Bytes>>, Error> {
    let json = get_json_from_body(req.into_body()).await?;
    let mut board_index = None;
    for (key, value) in json.entries() {
        if key == "board_index" {
            board_index = value.as_usize();
        }
    }
    if board_index.is_none() { return Err(Error::JsonNoBoardIndex); }

    set().write().await.active = board_index.unwrap();
    Ok(Response::new(Full::new(Bytes::new())))
}

// Delete all pedals from a specified board
async fn delete_pedals(req: Request<hyper::body::Incoming>) -> Result<Response<Full<Bytes>>, Error> {
    let queries = get_queries(&req);
    let board_index = get_query_usize(&queries, "board_index")?;
    // Remove all boards
    let mut set = set()
        .write()
        .await;
    let board = set.boards.get_mut(board_index as usize).unwrap();
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
    pedals.clear();
    pedals.append(&mut ll);

    return Ok(Response::new(Full::new(Bytes::from(""))));
}

fn get_query_usize(queries: &HashMap<String, String>, key: &str) -> Result<usize, Error> {
    let board_index = queries
        .get(key)
        .map(|b_idx| b_idx.parse().unwrap_or(-1))
        .unwrap_or(-1);
    return if board_index == -1 {
        Err(Error::BoardIndexOOB(board_index as usize))
    } else {
        Ok(board_index as usize)
    };
}

fn get_queries(req: &Request<hyper::body::Incoming>) -> HashMap<String, String> {
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
        .map_err(|_e| Error::BodyUnreadable)?
        .to_bytes();
    let contents = std::str::from_utf8(body.as_ref())
        .map_err(|e| Error::BodyNotUtf8(e))?;
    json::parse(contents).map_err(|_e| Error::BodynotJSON)
}

/*
 * ADD:
 *  - Server creation / daemonization
 *  - Jack routing based on server arguments
 */
