import { useParams } from "react-router-dom";
import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle'; 

import './Navbar.css';
import "./Board.css";
import Loading from './Loading';
import {Row, Col, Button} from 'react-bootstrap';
import InfoModal from './InfoModal';

// drag and drop stuff
import {DndContext} from '@dnd-kit/core';
import Draggable from './dnd/Draggable';
import Droppable from './dnd/Droppable';
import {restrictToParentElement} from '@dnd-kit/modifiers';

// pedal browser stuff
import PedalBrowser from './PedalBrowser';

function Board( {boards, pedalData} ) {
    const { id }  = useParams();
    const [currBoard, setCurrBoard] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [isPlaying, setPlaying] = useState(false);
    const [helpShow, setHelpShow] = useState(false);

    const handleClose = () => setHelpShow(false);
    const handleShow = () => setHelpShow(true);
    const basePath = process.env.PUBLIC_URL;
    const [pedalsMap, setPedalsMap] = useState(new Map());
    const [pedalMaxId, setPedalMaxId] = useState(1);

    // pedal browser stuff
    const [showPedalBrowser, setShowPedalBrowser] = useState(false);
  
    const handleClosePedalBrowser = () => setShowPedalBrowser(false);
    const handleShowPedalBrowser = () => setShowPedalBrowser(true);

    // setting up loading effect
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

    
    // holding delete detection
    const [isDeleteHeld, setIsDeleteHeld] = useState(false);

    // detecting if the delete key is held down
    const handleKeyDown = (event) => {
        if (event.key === 'Delete') {
        setIsDeleteHeld(true);
        }
    };

    // dealing with if they release the key
    const handleKeyUp = (event) => {
        if (event.key === 'Delete') {
            setIsDeleteHeld(false);
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

    }, []);

    function getPedalXY(pedal){
        console.log(pedal)
        if(pedal.x && pedal.y && pedal.height && pedal.width){
            console.log('already have x and y')
        } else {
            console.log('need x or y')
            const currElem = document.getElementById(`${pedal.id}d`);
            if(currElem){
                const currElemRect = currElem.getBoundingClientRect();
                pedal.x = currElemRect.x;
                pedal.y = currElemRect.y;
                pedal.width = currElemRect.width;
                pedal.height = currElemRect.height;
                console.log(pedal)
            }
        }
        return [pedal.x, pedal.y];
    }

    function drawLines(){
        console.log('drawLines');
        const canvas = document.getElementById('overlayCanvas');
        if(canvas == null){
            console.log('canvas is null');
            return ;
        }
        // making it fill the screen
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let ctx = canvas.getContext('2d');
        

        let prevX = null
        let prevY = null;
        console.log(pedalsMap)
        pedalsMap.forEach((pedal) => {  
            let [currX, currY] = getPedalXY(pedal);
            currX += Math.round(pedal.width / 2) || 0;
            currY += Math.round(pedal.height / 2) || 0;
            console.log([currX, currY])
            if(prevX != null){
                ctx.beginPath();
                // https://stackoverflow.com/questions/61122649/how-to-add-gradient-to-strokestyle-canvas-in-javascript#:~:text=You%20can%20create%20a%20CanvasGradient%20by%20calling%20the,it%20by%20calling%20the%20method%20addColorStop%20%28offset%2C%20color%29.
                const gradient = ctx.createLinearGradient(prevX, prevY, currX, currY);
                gradient.addColorStop(0, '#ff6347');
                gradient.addColorStop(1, '#006400');
                ctx.strokeStyle = gradient;

                ctx.lineWidth = 5;
                ctx.moveTo(prevX, prevY);
                ctx.lineTo(currX, currY);
                ctx.stroke(); // Render the path
                console.log(`Tried to draw line from (${prevX}, ${prevY}) to (${currX}, ${currY})`)
            }
            prevX = currX;
            prevY = currY;
        });

    }

    // whenever the currboard is changed, we need to remake the pedal map
    useEffect(() => {
        let tempPedalMaxId = pedalMaxId;
        let tempPedals = new Map();
        
        if(currBoard && currBoard.pedals){
            currBoard.pedals.forEach((pedal) => {
                pedal.id = tempPedalMaxId++;
                tempPedals.set(pedal.id, pedal);
            });
        }
        setPedalMaxId(tempPedalMaxId);
        setPedalsMap(tempPedals);
    }, [currBoard]);

    useEffect(() => {
        drawLines();
    },[pedalsMap])

    function addPedal(event, pedal){
        console.log(pedal)
        console.log(event);
        const activePedal = pedal;
        // remaking the pedal with the x, y corridnates 
        let newPedal = {
            ...activePedal,
        };
        newPedal.x = null;
        newPedal.y = null;
        newPedal.id = pedalMaxId + 1;
        // making the new map
        setPedalMaxId(pedalMaxId + 1);
        setPedalsMap(prev => new Map(prev).set(newPedal.id, newPedal));
        console.log(pedalsMap)
    };

    function deletePedal(event){
        console.log(`deletePedal:` )
        console.log(event)

        const activePedal = pedalsMap.get(event.active.id);
        
        let newMap = new Map(pedalsMap);
        newMap.delete(activePedal.id)
        setPedalMaxId(pedalMaxId - 1);
        setPedalsMap(newMap);
        console.log(pedalsMap)
    }

    return (
        isLoading ? 
        <Loading /> :
        <>
            <div className="navbar board-nav">
                <div className="left-side icon-container">
                    <a className="navbar-brand" href={basePath}>
                        {/* { console.log(basePath) } */}
                        <img src={`${basePath}/logo.png`} className="logo-container" alt="Digipedal Logo"/>
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
            <Row>        
                <Button className="modal-DELETE" onClick={handleShow}> Modal Tester </Button>
                <PedalBrowser pedalsMap={pedalsMap} addPedal={addPedal} handleShow={handleShowPedalBrowser} handleClose={handleClosePedalBrowser} show={showPedalBrowser}/>
            </Row>
            <InfoModal showing={helpShow} handleClose={handleClose} pedals={pedalData} pedalId={1} />
            <canvas id="overlayCanvas"></canvas>
            <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToParentElement]}>
                <Droppable className="w-100" modifiers={[restrictToParentElement]} style={{height: `${100 - 17}vh`}}>
                    {[...pedalsMap.values()].map((pedal) => {
                        return (
                        <Draggable id={pedal.id} x={pedal.x} y={pedal.y}>
                            <img className="pedal" src={basePath + pedal.image} key={pedal.id}/>
                        </Draggable>);
                    })}
                </Droppable>
            </DndContext>
        </>
    );
    
    
    
    // dealing with the ending of drag events
    function handleDragEnd(event) {
        if(isDeleteHeld){
            return deletePedal(event)
        }
        // getting info about the drag event
        const activePedal = pedalsMap.get(event.active.id);
        const draggedElement = document.getElementById(`${event.active.id}d`);
        const draggedElementRect = draggedElement.getBoundingClientRect();

        console.log(event)
        console.log(draggedElement)
        console.log(draggedElementRect)

        // checking that the pedal actually exists 
        if (activePedal) {
            // remaking the pedal with the x, y corridnates 
            const updatedPedal = {
                ...activePedal,
                x: Math.round(draggedElementRect.x),
                y: Math.round(draggedElementRect.y),
            };
            // making the new map
            setPedalsMap(prev => new Map(prev).set(activePedal.id, updatedPedal));
        }
    }
};


export default Board;