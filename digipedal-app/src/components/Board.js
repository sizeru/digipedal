import { useParams } from "react-router-dom";
import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle'; 

import './Navbar.css';
import Loading from './Loading';
import Button from 'react-bootstrap/Button';
import InfoModal from './InfoModal';

function Board( {boards, pedalData} ) {
    const { id }  = useParams();
    const [currBoard, setCurrBoard] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [isPlaying, setPlaying] = useState(false);
    const [helpShow, setHelpShow] = useState(false);

    const handleClose = () => setHelpShow(false);
    const handleShow = () => setHelpShow(true);


    useEffect( () => {
        function simulateNetworkRequest() {
            return new Promise((resolve) => setTimeout(resolve, 2000));
        }
    
        if (isLoading) {
            simulateNetworkRequest().then(() => {
            setLoading(false);
            });
        }
        // if (boards == null) {
        //     const data = await fetch('http://localhost:3001/read-json');
        //     const boards = await data.json(); 
        //     setCurrBoard(boards.find((board) => board.id == id));
        // }
        // else {
        setCurrBoard(boards.find((board) => board.id == id));
    }, [id, boards, isLoading]);
    
    const undo = () => {
        console.log("Undo");
    }

    const redo = () => {
        console.log("Redo");
    }

    const playPauseToggle = () => {
        console.log("Play/Pause");
        setPlaying(!isPlaying);

    }

    const share = () => {
        console.log("Share");
    }

    const more = () => {   
        console.log("More");
    };

    return (
        isLoading ? 
        <Loading /> :
        <div>
            <div className="navbar board-nav">
                <div className="left-side icon-container">
                    <a className="navbar-brand" href="/">
                        <img src="../logo.png" className="logo-container" alt="Digipedal Logo"/>
                    </a>
                    <button className="nav-btn" onClick={undo}> <img src="../navbar_icons/undo.png" className="undo" alt="Undo" /> </button>
                    <button className="nav-btn" onClick={redo}> <img src="../navbar_icons/undo.png" className="redo" alt="Redo"/> </button>
                </div>
                <a className="bungee-regular"> {
                currBoard.name.length > 12 ? currBoard.name.substring(0,10) + '...' : currBoard.name 
                } </a>
                <div className="right-side icon-container-right"> 
                    <button className="nav-btn" onClick={playPauseToggle}> 
                    {isPlaying ? <img src="../navbar_icons/play.png" className="play" alt="Play"/> : <img src="../navbar_icons/pause.png" className="pause" alt="Pause"/>} </button>
                    <button className="nav-btn" onClick={share}> <img src="../navbar_icons/share.png" className="share" alt="Share"/> </button>
                    <button className="nav-btn" onClick={more}> <img src="../navbar_icons/three_dots.png" className="three-dots" alt="More"/> </button>
                </div>
            </div>
            <div className="container-fluid">
                <div>                 
                    <Button className="modal-DELETE" onClick={handleShow}> Modal Tester </Button>
                </div>
            </div>
            <InfoModal showing={helpShow} handleClose={handleClose} pedals={pedalData} pedalId={1} />
        </div>
    );
};


export default Board;