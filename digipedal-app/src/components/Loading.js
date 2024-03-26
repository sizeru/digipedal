import "./Loading.css";

function Loading() {
    return (
        <>
            <div className="navbar loading-nav">
                <div className="navbar-nav">
                    <a className="bungee-regular"> Loading... </a>
                </div>
            </div>
            <div className="loading">
                <img src="/logo.png" alt="Loading" className="loading-logo" />
            </div>
        </>
    );
}

export default Loading;