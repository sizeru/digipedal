import { useParams } from "react-router-dom";
import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle'; 

import './Navbar.css';
import Loading from './Loading';
import Button from 'react-bootstrap/Button';

function Board( {boards} ) {
    const { id }  = useParams();
    const [currBoard, setCurrBoard] = useState(null);
    const [isLoading, setLoading] = useState(true);


    useEffect( () => {
        function simulateNetworkRequest() {
            return new Promise((resolve) => setTimeout(resolve, 2));
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
            <div className="navbar board-nav">
                <div className="left-side icon-container">
                    <a className="navbar-brand" href="/">
                        <img src="../logo.png" className="logo-container" alt="Digipedal Logo"/>
                    </a>
                    <img src="../navbar_icons/undo.png" className="undo" alt="Undo"/>
                    <img src="../navbar_icons/undo.png" className="redo" alt="Redo"/>
                </div>
                <a className="bungee-regular"> {
                currBoard.name.length > 12 ? currBoard.name.substring(0,10) + '...' : currBoard.name 
                } </a>
                <div className="right-side icon-container-right"> 
                    <img src="../navbar_icons/play.png" className="play" alt="Play"/>
                    <img src="../navbar_icons/share.png" className="share" alt="Share"/>
                    <img src="../navbar_icons/three_dots.png" className="three-dots" alt="More"/>
                </div>
        </div>
            <div className="container-fluid">
                <div>                 
                    <Button> Click Me! </Button>
                </div>
            </div>
        </div>
    );
};


export default Board;