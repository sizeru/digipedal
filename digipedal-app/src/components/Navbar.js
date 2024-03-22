import React from 'react';

import './Navbar.css';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle'; 

const Navbar = () => {
    return (
        <div className="navbar sticky-top d-flex justify-content-between align-items-center">
            <a className="navbar-brand logo-container" href="#">
                <img src="logo.png" className="d-inline-block align-top logo-container" alt="Digipedal Logo"/>
            </a>
            <div className="navbar-nav">
                <p className="bungee-regular"> Digipedal </p>
            </div>
            <div className="logo-container">  </div> {/* Empty div to balance the logo */}
        </div>
    );
}

export default Navbar;