use std::{env, fs, io, net::SocketAddr, path::PathBuf, process::exit};

#[derive(Debug)]
enum Error {
    // During what operation did the error happen
    FlagParse(char),
    ArgParse(String),
    ConfigRead(io::Error),
    ConfigParse(usize),
}

#[derive(Debug)]
struct Flags {
    config_file: String,
    debug: bool,
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
                        'd' => flags.debug = true,
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

struct Config {
    access_log: PathBuf,
    error_log: PathBuf,
    plugin_dir: PathBuf,
    addr: SocketAddr,
}

impl std::default::Default for Config {
    fn default() -> Self {
        Self {
            access_log: PathBuf::from("/var/log/pdb/access.log"),
            error_log: PathBuf::from("/var/log/pdb/error.log"),
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
                    "access_log" => config.access_log = value.parse().unwrap(),
                    "error_log" => config.error_log = value.parse().unwrap(),
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
            debug: false,
            dry_run: false,
            verbose: false,
        }
    }
}

fn main() -> Result<(), Error> {
    let flags = Flags::parse_from_args()?;
    let config = Config::parse_from(&flags.config_file)?;
    return Ok(());
}

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
