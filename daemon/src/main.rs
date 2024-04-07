use std::{
    convert::Infallible, env, fs, io, net::SocketAddr, path::PathBuf
};
use http_body_util::Full;
use hyper::{body::Bytes, server::conn::http1, service::service_fn, Request, Response};
use hyper_util::rt::TokioIo;
use log::{info, error};
use daemonize::Daemonize;
use tokio::net::TcpListener;

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

// Run the jack server. This function will often never return
#[tokio::main]
async fn run_server(config: Config) -> Result<(), Error> {
    info!("Starting server!");
    let listener = TcpListener::bind(config.addr).await.map_err(|e| Error::TcpBind(e))?;
    info!("Bound to address: {}", config.addr);
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
    let response = format!("You requested: {}\n", req.uri());
    return Ok(Response::new(Full::new(Bytes::from(response))));
}

/*
 * ADD:
 *  - Server creation / daemonization
 *  - Jack routing based on server arguments
 */

// use std::convert::Infallible;
// use std::net::SocketAddr;
// use http_body_util::Full;
// use hyper::body::Bytes;
// use hyper::server::conn::http1;
// use hyper::service::service_fn;
// use hyper::{Request, Response};
// use hyper_util::rt::TokioIo;
// use tokio::net::TcpListener;
// use std::sync::Arc;

// // Respond to the request
// async fn process_req(req: Request<hyper::body::Incoming>) -> Result<Response<Full<Bytes>>, Infallible> {
// 	Ok(Response::new(Full::new(Bytes::from("Ok"))))
// }

// #[tokio::main]
// async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
// 	// TODO: Make this be read from the config
// 	let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
// 	let listener = TcpListener::bind(addr).await?;

// 	loop {
// 		let (stream, _) = listener.accept().await?;
// 		let io = TokioIo::new(stream); // tokio to hyper trait adapter

// 		tokio::task::spawn(async move {
// 			if let Err(err) = http1::Builder::new()
// 				.serve_connection(io, service_fn(process_req))
// 				.await
// 			{
// 				eprintln!("Error serving connection: {:?}", err);
// 			}
// 		});
// 	}
// }
