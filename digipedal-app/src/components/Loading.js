import "./Loading.css";

function Loading() {
    return (
        <div className="loading">
            <h1 className="bungee-regular"> Loading... </h1>
            <img src="/logo.png" alt="Loading" className="loading-logo" />
        </div>
    );
}

export default Loading;