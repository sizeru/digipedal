import { useParams } from "react-router-dom";
import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle'; 

import './Navbar.css';
import Loading from './Loading';

function Board( {boards} ) {
    const { id }  = useParams();
    const [currBoard, setCurrBoard] = useState(null);
    const [isLoading, setLoading] = useState(true);


    useEffect( () => {
        function simulateNetworkRequest() {
            return new Promise((resolve) => setTimeout(resolve, 2000));
        }
    
        if (isLoading) {
            simulateNetworkRequest().then(() => {
            setLoading(false);
            });
        }
        setCurrBoard(boards.find((board) => board.id == id))
    }, [id, boards, isLoading]);
    
    return (
        isLoading ? 
        <Loading /> :
        <div>
            <div className="navbar sticky-top d-flex justify-content-between align-items-center">
                <a className="navbar-brand logo-container" href="/">
                    <img src="../logo.png" className="d-inline-block align-top logo-container" alt="Digipedal Logo"/>
                </a>
                <div className="navbar-nav">
                    <a className="bungee-regular"> {currBoard.name} </a>
                </div>
                <div className="logo-container">  
                </div>
        </div>
            <div className="container-fluid">
            </div>
        </div>
    );
};


export default Board;