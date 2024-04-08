import { useParams } from "react-router-dom";
import { useEffect, useState, useRef} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle'; 

import './Navbar.css';
import "./Board.css";
import Loading from './Loading';
import {Row, Col, Button} from 'react-bootstrap';
import InfoModal from './InfoModal';

// drag and drop stuff
import {DndContext, DragOverlay} from '@dnd-kit/core';
import Draggable from './dnd/Draggable';
import Droppable from './dnd/Droppable';
import {restrictToParentElement} from '@dnd-kit/modifiers';

// pedal browser stuff
import PedalBrowser from './PedalBrowser';

// pedals
import AmpPedal from './pedal_components/AmpPedal';

// attaching to front end
import {getBoardById, getPedals, getPedalById} from '../firebaseOperations';
import {findPedal} from './pedal_components/PedalFinder'

function Board( {boards, pedalTypeMap} ) {
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

    const defaultPedalWidth = 140;
    const defaultPedalHeight = 200;

    // all the cloning shadow stuff
    const [cloneElement, setCloneElement] = useState(null);
    const pedalBoardRef = useRef(null); 
    useEffect(() => {
        let pedalBoardContainer = pedalBoardRef.current
        // pretty much making it so that I can add it as a child 
        if (cloneElement && pedalBoardContainer) {
            pedalBoardContainer.appendChild(cloneElement);
        } else if (pedalBoardContainer) {
            //removing it if cloneElement is now null and the last elemtent is the clone
            let lastChild = pedalBoardContainer.lastElementChild;
            if(lastChild && lastChild.id === 'clone'){
                pedalBoardContainer.removeChild(lastChild);
            }
        }
    }, [cloneElement]);
  
    // pedal browser stuff
    const [showPedalBrowser, setShowPedalBrowser] = useState(false);
  
    const handleClosePedalBrowser = () => setShowPedalBrowser(false);
    const handleShowPedalBrowser = () => setShowPedalBrowser(true);

    // setting up loading effect
    useEffect(() => {
        setLoading(currBoard == null);
    }, [currBoard])

    // trying to get the board when
    useEffect( () => {
        const tryGetBoard = async () => {
            console.log("trying to getBoardById: ");
            let boardRes = await getBoardById(id);
            console.log("getBoardById results: ");
            console.log(boardRes)
            setCurrBoard(boardRes)
            // console.log("getPedals results: ");
            // res = await getPedals(id);
            // console.log(res)
        }
        tryGetBoard()
    }, [id]);
    
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

    function getPedalXY(pedal){
        console.log(pedal)
        if(pedal.x && pedal.y && pedal.height && pedal.width){
            console.log('getPedalXY: already have x and y and height and width')
        } else {
            console.log('getPedalXY: need x or y or height or width')
            const currElem = document.getElementById(`${pedal.boardId}d`);
            if(currElem){
                const currElemRect = currElem.getBoundingClientRect();
                pedal.x = currElemRect.x;
                pedal.y = currElemRect.y;
                pedal.width = currElemRect.width;
                pedal.height = currElemRect.height;
                console.log("getPedalXY pedal:")
                console.log(pedal)
            }
        }
        return [pedal.x, pedal.y];
    }
    function drawLine(ctx, prevX, prevY, currX, currY){
        
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
        

        // make it so it draws a from start to first pedal
        let prevX = 0
        let prevY = window.innerHeight *.5;
        pedalsMap.forEach((pedal) => {  
            let [currX, currY] = getPedalXY(pedal);
            currX += Math.round(pedal.width / 2) || 0;
            currY += Math.round(pedal.height / 2) || 0;
            drawLine(ctx, prevX, prevY, currX, currY)
            prevX = currX;
            prevY = currY;
        });
        // drawing a line from last pedal to the end
        drawLine(ctx, prevX, prevY, window.innerWidth, window.innerHeight *.5)
    }

    // whenever the currboard is changed, we need to remake the pedal map
    useEffect(() => {
        if(currBoard == null){
            console.log("currBoard not loaded need to try again");
            return;
        }
        let tempPedalMaxId = pedalMaxId;
        let tempPedals = new Map();
        console.log("trying to load pedals with these pedals:")
        console.log(currBoard.pedals)
        if(currBoard && currBoard.pedals){
            currBoard.pedals.forEach((pedal) => {
                // setting the id  for this board
                pedal.boardId = tempPedalMaxId++;
                // updating the xPercent and yPercent to a real x and y
                if(pedal.xPercent){
                    pedal.x = pedal.xPercent / 100 * window.innerWidth;
                }else{
                    pedal.x = null;
                }
                if(pedal.yPercent){
                    pedal.y = pedal.yPercent / 100 * window.innerHeight;
                }else{
                    pedal.y = null;
                }
                // finding the function to generate the pedal
                pedal.pedal = findPedal(pedalTypeMap.get(pedal.pedal_id))
                tempPedals.set(pedal.boardId, pedal);
            });
        }
        console.log("pedalsMap: ")
        console.log(tempPedals)
        setPedalMaxId(tempPedalMaxId);
        setPedalsMap(tempPedals);
    }, [currBoard]);

    useEffect(() => {
        drawLines();
    },[pedalsMap])

    function addPedal(event, pedalId){
        // remaking the pedal with the x, y corridnates 
        const defaultPercent = 50
        let newPedal = {
            'pedal_id': pedalId,
            'xPercent': defaultPercent,
            'yPercent': defaultPercent,
            'x': defaultPercent / 100 * window.innerWidth,
            'y': defaultPercent / 100 * window.innerHeight,
            'width': defaultPedalWidth,
            'height': defaultPedalHeight,
            'boardId': pedalMaxId + 1,
            'toggled': true,
            'pedal': findPedal(pedalTypeMap.get(pedalId)),
            'param_vals': {}
        };
        
        console.log("addPedal newPedal:")
        console.log(newPedal)

        // making the new map
        setPedalMaxId(newPedal.boardId);
        setPedalsMap(prev => new Map(prev).set(newPedal.boardId, newPedal));
        console.log(pedalsMap)
    };

    function deletePedal(pedalId){
        console.log("deletePedal: " + pedalId);
        const activePedal = pedalsMap.get(pedalId);
        
        let newMap = new Map(pedalsMap);
        newMap.delete(activePedal.boardId)
        setPedalMaxId(pedalMaxId - 1);
        setPedalsMap(newMap);
        console.log(pedalsMap)
    }

    function togglePedal(boardId){
        console.log("togglePedal: " + boardId);
        const activePedal = pedalsMap.get(boardId);
        activePedal.toggled = activePedal.toggled ? false : true;
        let newMap = new Map(pedalsMap);
        newMap.set(boardId, activePedal)
        setPedalsMap(newMap);
        console.log(newMap)
    }

    let [pedalInfoMap, setPedalInfoMap] = useState(new Map())
    let [shownPedalId, setShownPedalId] = useState(null)
    function showInfoModal(pedal_id){
        // checking that we actually have the info about the pedal
        console.log("showInfoModal for pedal " + pedal_id);
        // we are resetting it back so just set it to null
        if(pedal_id == null){
            setShownPedalId(pedal_id);
            return;
        }
        let pedalInfo = pedalInfoMap.get(pedal_id);
        console.log(pedalInfo)
        if(pedalInfo){
            // all we need to do is update which modal is showing 
            setShownPedalId(pedal_id);
        } else {
            // we need to get the info about it and set it to showing
            const setNewPedalInfo = async () => {
                let newPedalInfo = await getPedalById(`${pedal_id}`);
                console.log(newPedalInfo)
                let newPedalInfoMap = new Map(pedalInfoMap);
                newPedalInfoMap.set(pedal_id, newPedalInfo)
                setPedalInfoMap(newPedalInfoMap)
                setShownPedalId(pedal_id);
                console.log(newPedalInfoMap)
            }
            setNewPedalInfo()
        }

    }


    return (
        isLoading ? 
        <Loading /> :
        <>
            <div className="navbar board-nav">
                <div className="left-side icon-container">
                    <a className="navbar-brand" href={basePath}>
                        <img src={`${basePath}/logo.png`} className="logo-container" alt="Digipedal Logo"/>
                    </a>
                    <button className="nav-btn" onClick={undo}> <img src="../navbar_icons/undo.png" className="undo" alt="Undo" /> </button>
                    <button className="nav-btn" onClick={redo}> <img src="../navbar_icons/undo.png" className="redo" alt="Redo"/> </button>
                </div>
                <a className="bungee-regular"> {
                currBoard.name.name.length > 12 ? currBoard.name.name.substring(0,10) + '...' : currBoard.name.name 
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
                <PedalBrowser pedalTypeMap={pedalTypeMap} addPedal={addPedal} handleShow={handleShowPedalBrowser} handleClose={handleClosePedalBrowser} show={showPedalBrowser}/>
            </Row>
            {shownPedalId ? <InfoModal showing={true} handleClose={() => showInfoModal(null)} pedalInfo={pedalInfoMap.get(shownPedalId)} /> : null}

            <canvas id="overlayCanvas" />
            
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} modifiers={[restrictToParentElement]}>
                <Droppable className="w-100" modifiers={[restrictToParentElement]} style={{height: `${100 - 17}vh`}}>
                    <div ref={pedalBoardRef}/>
                    {[...pedalsMap.values()].map((pedal) => {
                        let PedalElement = pedal.pedal;
                        return (
                        <Draggable id={pedal.boardId} x={pedal.x} y={pedal.y}>
                            <PedalElement width={defaultPedalWidth * (pedal.boardId % 2 + 1)} height={defaultPedalHeight * (pedal.boardId % 2 + 1)} toggled={pedal.toggled} param_vals={pedal.param_vals} 
                            deletePedal={() => deletePedal(pedal.boardId)}
                            togglePedal={() => togglePedal(pedal.boardId)}
                            showInfoModal={() => showInfoModal(pedal.pedal_id)}/>
                        </Draggable>);
                    })}
                </Droppable>
            </DndContext>
        </>
    );
    
    
    function handleDragStart(event) {
        console.log("Drag Start: ")
        console.log(event)
        const draggedElement = document.getElementById(`${event.active.id}d`);
        console.log(draggedElement)
        
        // making a clone of it with lower opacity and diff id
        const clone = draggedElement.cloneNode(true);
        clone.style.opacity = '0.5';
        clone.id = "clone";
        
        setCloneElement(clone);
    }
    
    // dealing with the ending of drag events
    function handleDragEnd(event) {
        setCloneElement(null);
        console.log("handleDragEnd")
        console.log(event)
        
        if(Math.abs(event.delta.x) < 1 && Math.abs(event.delta.y) < 1){
            console.log("Probably a click!")
            // checking if the thing they are trying to click on has an onclick function
            let onClick = Object.values(event.activatorEvent.srcElement)[1].onClick
            console.log(event.activatorEvent.srcElement)
            if(onClick){
                console.log("Clicking on the underlying thing:")
                console.log(event.activatorEvent.srcElement)
                onClick()
            }
            return;
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
            setPedalsMap(prev => new Map(prev).set(activePedal.boardId, updatedPedal));
        }
    }
};


export default Board;