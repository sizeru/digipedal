use std::convert::Infallible;
use std::net::SocketAddr;
use http_body_util::Full;
use hyper::body::Bytes;
use hyper::server::conn::http1;
use hyper::service::service_fn;
use hyper::{Request, Response};
use hyper_util::rt::TokioIo;
use tokio::net::TcpListener;
use std::sync::Arc;

// Respond to the request
async fn process_req(req: Request<hyper::body::Incoming>) -> Result<Response<Full<Bytes>>, Infallible> {
	Ok(Response::new(Full::new(Bytes::from("Ok"))))
}

fn read_config() {

}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
	// TODO: Make this be read from the config
	let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
	let listener = TcpListener::bind(addr).await?;

	loop {
		let (stream, _) = listener.accept().await?;
		let io = TokioIo::new(stream); // tokio to hyper trait adapter

		tokio::task::spawn(async move {
			if let Err(err) = http1::Builder::new()
				.serve_connection(io, service_fn(process_req))
				.await
			{
				eprintln!("Error serving connection: {:?}", err);
			}
		});
	}
}