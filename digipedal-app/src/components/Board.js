import { useParams } from "react-router-dom";
import { useEffect, useState, useRef} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle'; 
import {Row, Button} from 'react-bootstrap';

import './Navbar.css';
import "./Board.css";
import Loading from './Loading';
import InfoModal from './InfoModal';
import GenericInterfaceModal from "./GenericInterfaceModal";
import ShareModal from './ShareModal';
import setShowShareModal from './ShareModal';

// drag and drop stuff
import {DndContext} from '@dnd-kit/core';
import Draggable from './dnd/Draggable';
import Droppable from './dnd/Droppable';
import {restrictToParentElement} from '@dnd-kit/modifiers';

// pedal browser stuff
import PedalBrowser from './PedalBrowser';


// attaching to front end
import {getBoardById, getPedalById} from '../firebaseOperations';
import {findPedal} from './pedal_components/PedalFinder'

function Board( {boards, pedalTypeMap} ) {
    const { id }  = useParams();
    const [currBoard, setCurrBoard] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [isPlaying, setPlaying] = useState(false);
    const [helpShow, setHelpShow] = useState(false)


    const [sharing, setSharing] = useState(false);
    
    const handleShareClose = () => setSharing(false);
    const handleShare = () => setSharing(true);

    const handleClose = () => setHelpShow(false);
    const handleShow = () => setHelpShow(true);
    const basePath = process.env.PUBLIC_URL;
    const [pedalsMap, setPedalsMap] = useState(new Map());

    const defaultPedalWidth = window.innerWidth / 10;
    const defaultPedalHeight = defaultPedalWidth * 1.5;

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

    const shareWindow = () => {
        console.log("Share");
        setShowShareModal(true);
        
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


        // drawing the angle
        let angle = Math.atan2(currY - prevY, currX - prevX);
        
        let length = window.innerWidth / 50; 
    
        ctx.beginPath();
        // point of triangle 
        ctx.moveTo(currX, currY);
        // moving to the bottom 
        ctx.lineTo(currX - length * Math.cos(angle - Math.PI / 6), currY - length * Math.sin(angle - Math.PI / 6));
        // moving to the top
        ctx.lineTo(currX - length * Math.cos(angle + Math.PI / 6), currY - length * Math.sin(angle + Math.PI / 6));
        ctx.lineTo(currX, currY);
    
        ctx.strokeStyle = '#006400';
        ctx.fillStyle = '#006400';
        ctx.stroke();
        ctx.fill();
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

        let drawnLines = [];
        const pedalEntries = [...pedalsMap.entries()];
        console.log(pedalEntries)
        // make it so it draws a from start to first pedal
        let prevX = 0
        let prevY = window.innerHeight *.5;
        pedalEntries.forEach((pedalEntry) => {  
            let pedal = pedalEntry[1]
            let [currX, currY] = getPedalXY(pedal);
            currY += Math.round(pedal.height / 2) || 0;
            drawnLines.push({prevX: prevX, prevY: prevY, currX: currX, currY:currY})
            drawLine(ctx, prevX, prevY, currX, currY)
            prevX = currX + pedal.width;
            prevY = currY;
        });
        // drawing a line from last pedal to the end
        drawLine(ctx, prevX, prevY, window.innerWidth, window.innerHeight *.5)
        drawnLines.push({prevX: prevX, prevY: prevY, currX: window.innerWidth, currY:window.innerHeight *.5})

        console.log("drawnLines:")
        console.log(drawnLines)
    }

    // whenever the currboard is changed, we need to remake the pedal map
    useEffect(() => {
        if(currBoard == null){
            console.log("currBoard not loaded need to try again");
            return;
        }
        let tempPedals = new Map();
        console.log("trying to load pedals with these pedals:")
        console.log(currBoard.pedals)
        if(currBoard && currBoard.pedals){
            currBoard.pedals.forEach((pedal) => {
                // setting the id  for this board
                pedal.boardId = tempPedals.size + 1;
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
        setPedalsMap(tempPedals);
    }, [currBoard]);

    useEffect(() => {
        console.log("useEffect [pedalsMap]")
        // is it already sorted (this might be slow with tons of pedals but we will run into other issues first)
        let sortedPedalMapEntries = [...pedalsMap.entries()].sort((a, b) => a[1].x - b[1].x)
        let isNotSorted = sortedPedalMapEntries.some((entry, index) => entry[1].boardId !== index + 1);
        // it is not sorted! we need to sort it
        if(isNotSorted){
            console.log("Sorting pedals")
            let sortedPedalMap = new Map();
            sortedPedalMapEntries.map((entry, index) => {
                console.log("dealing with ", index)
                let updatedPedal = entry[1]
                console.log(updatedPedal)
                updatedPedal.boardId = index + 1; // it needs to be + 1 so that 0 doesnt false out of random things
                console.log(updatedPedal)
                sortedPedalMap.set(updatedPedal.boardId, updatedPedal);
            });
            setPedalsMap(sortedPedalMap);
        }
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
            'boardId': pedalsMap.size + 1,
            'toggled': true,
            'pedal': findPedal(pedalTypeMap.get(pedalId)),
            'param_vals': {}
        };
        
        console.log("addPedal newPedal:")
        console.log(newPedal)

        // making the new map
        setPedalsMap(prev => new Map(prev).set(newPedal.boardId, newPedal));
        console.log(pedalsMap)
    };

    function deletePedal(boardId){
        console.log("deletePedal: " + boardId);
        const activePedal = pedalsMap.get(boardId);
        
        console.log(pedalsMap)
        let newMap = new Map(pedalsMap);
        newMap.delete(activePedal.boardId)
        setPedalsMap(newMap);
        console.log(newMap)
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

    function updatePedal(boardId, pedalUpdateFunction){
        console.log("updatePedal: " + boardId);
        const activePedal = pedalsMap.get(boardId);
        console.log(pedalsMap)
        if(!activePedal){
            console.log("Could not find activePedal")
            return;
        }
        
        console.log(pedalsMap);
        let updatedPedal = pedalUpdateFunction(activePedal);
        if(!updatedPedal){
            console.log("updatedPedal was ", updatedPedal);
            return;
        }
        let newMap = new Map(pedalsMap);
        newMap.set(boardId, updatedPedal);
        
        setPedalsMap(newMap);
        console.log(updatedPedal);
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
                    {/* <button className="nav-btn" onClick={undo}> <img src="../navbar_icons/undo.png" className="undo" alt="Undo" /> </button>
                    <button className="nav-btn" onClick={redo}> <img src="../navbar_icons/undo.png" className="redo" alt="Redo"/> </button> */}
                </div>
                <a className="bungee-regular"> {
                currBoard.name.name.length > 12 ? currBoard.name.name.substring(0,10) + '...' : currBoard.name.name 
                } </a>
                <div className="right-side icon-container-right"> 
                    <button className="nav-btn" onClick={playPauseToggle}> 
                    {isPlaying ? <img src="../navbar_icons/play.png" className="play" alt="Play"/> : <img src="../navbar_icons/pause.png" className="pause" alt="Pause"/>} </button>

                    <button className="nav-btn" onClick={handleShare}> <img src="../navbar_icons/share.png" className="share" alt="Share"/> </button>
                    
                    {/* <button className="nav-btn" onClick={share}> <img src="../navbar_icons/share.png" className="share" alt="Share"/> </button>
                    <button className="nav-btn" onClick={more}> <img src="../navbar_icons/three_dots.png" className="three-dots" alt="More"/> </button> */}
                    <div style={{"opacity": 0}}>||||||||||||</div>
                </div>
            </div>  
            <Row>        
                <Button className="modal-DELETE" onClick={handleShow}> Modal Tester </Button>
                <PedalBrowser pedalTypeMap={pedalTypeMap} addPedal={addPedal} handleShow={handleShowPedalBrowser} handleClose={handleClosePedalBrowser} show={showPedalBrowser}/>
            </Row>
            <GenericInterfaceModal pedal_id={6} show={helpShow} handleClose={handleClose} />

            <PedalBrowser pedalTypeMap={pedalTypeMap} addPedal={addPedal} handleShow={handleShowPedalBrowser} handleClose={handleClosePedalBrowser} show={showPedalBrowser}/>
            {shownPedalId ? <InfoModal showing={true} handleClose={() => showInfoModal(null)} pedalInfo={pedalInfoMap.get(shownPedalId)}/> : null}
            <ShareModal sharing={sharing} handleShareClose={handleShareClose}/>
            <canvas id="overlayCanvas" />
            

            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} modifiers={[restrictToParentElement]}>
                <Droppable className="w-100" modifiers={[restrictToParentElement]} style={{height: `${100 - 17}vh`}}>
                    <div ref={pedalBoardRef}/>
                    {[...pedalsMap.values()].map((pedal, index) => {
                        let PedalElement = pedal.pedal;
                        return (
                        <Draggable id={pedal.boardId} x={pedal.x} y={pedal.y}>
                            <PedalElement width={defaultPedalWidth} height={defaultPedalHeight} toggled={pedal.toggled} param_vals={pedal.param_vals} 
                            deletePedal={() => deletePedal(pedal.boardId)}
                            togglePedal={() => togglePedal(pedal.boardId)}
                            showInfoModal={() => showInfoModal(pedal.pedal_id)}
                            updatePedal={(pedalUpdateFunction) => updatePedal(pedal.boardId, pedalUpdateFunction)}
                            index={index}/>
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
                onClick(event)
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