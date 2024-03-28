import "./Loading.css";

const basePath = process.env.PUBLIC_URL;

function Loading() {
    return (
        <div className="loading">
            <h1 className="bungee-regular"> Loading... </h1>
            <img src={`${basePath}/logo.png`} alt="Loading" className="loading-logo" />
        </div>
    );
}

export default Loading;