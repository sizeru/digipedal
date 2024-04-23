import { useParams } from "react-router-dom";
import { useEffect, useState, useRef} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle'; 
import {Row, Toast} from 'react-bootstrap';

import './Navbar.css';
import "./Board.css";
import Loading from './Loading';
import InfoModal from './InfoModal';
import GenericInterfaceModal from "./GenericInterfaceModal";
import ShareModal from './ShareModal';

// drag and drop stuff
import {DndContext} from '@dnd-kit/core';
import Draggable from './dnd/Draggable';
import Droppable from './dnd/Droppable';
import {restrictToParentElement} from '@dnd-kit/modifiers';

// pedal browser stuff
import PedalBrowser from './PedalBrowser';


// attaching to front end
import {getBoardById, getPedalById, saveAllToBoard} from '../firebaseOperations';
import {findPedal} from './pedal_components/PedalFinder'
import DeleteAllPedals from "./DeleteAllPedals";

import { addJACKPedal, deleteJACKPedalfromBoard, changeJACKPedal } from '../jackOperations';

function Board( {pedalTypeMap, pedalDataMap} ) {
    const { id }  = useParams();
    const [currBoard, setCurrBoard] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [interfaceLoading, setInterfaceLoading] = useState(false);
    const [helpShow, setHelpShow] = useState(false);
    const [genericId, setGenericId] = useState(null);
    const [genericIdx, setGenericIdx] = useState(null);
    const [genericParamsMap, setGenericParamsMap] = useState(new Map());
    const [saveState, setSaveState] = useState("saved");
    const [addedPedal, setAddedPedal] = useState(null);

    const [showDeletePedalsModal, setShowDeletingPedalModal] = useState(false);

    const [sharing, setSharing] = useState(false);
    
    const handleShareClose = () => { setSharing(false); setShowBrowserButton(true); }
  
    const closeDeletingPedalsModal = () => setShowDeletingPedalModal(false);
    const openDeletingPedalsModal = () => setShowDeletingPedalModal(true);

    const handleClose = (pedal_vals) => { 
        setHelpShow(false); 
        setShowBrowserButton(true); 
        if (pedal_vals) { 
            setGenericId(null); 
            setGenericIdx(null);
        } else {
            setGenericId(null);
            setGenericIdx(null);
        }
    }
    const handleShow = (id, idx) => { 
        setGenericId(id); 
        setGenericIdx(idx); 
        // setGenericParams(pedalsMap.get(idx).param_vals);
        // console.log("PARMETERS:", pedalsMap.get(idx).param_vals)
    }
    useEffect(() => {
        if (genericId !== null) {  
            setHelpShow(true);
            setShowBrowserButton(false);
        }
    }, [genericId]);
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
            //removing it if cloneElement is now null and the last element is the clone
            let lastChild = pedalBoardContainer.lastElementChild;
            if(lastChild && lastChild.id === 'clone'){
                pedalBoardContainer.removeChild(lastChild);
            }
        }
    }, [cloneElement]);
  
    // pedal browser stuff
    const [showPedalBrowser, setShowPedalBrowser] = useState(false);
    const [showBrowserButton, setShowBrowserButton] = useState(true);
  
    const handleClosePedalBrowser = () => setShowPedalBrowser(false);
    const handleShowPedalBrowser = () => setShowPedalBrowser(true);

    // setting up loading effect
    useEffect(() => {  setLoading(currBoard == null) }, [currBoard])

    // trying to get the board when
    useEffect( () => {
        const tryGetBoard = async () => {
            console.log("trying to getBoardById: ");
            let boardRes = await getBoardById(id);
            console.log("getBoardById results: ");
            console.log(boardRes)
            setCurrBoard(boardRes)

            let pedals = boardRes.pedals;
            console.log(pedals);
            let map = new Map();
            pedals.forEach((pedal, idx) => {
                map[idx] = {
                    boardId: id,
                    pedal_id: pedal.pedal_id,
                    xPercent: pedal.xPercent,
                    x: pedal.x,
                    width: pedal.width,
                    yPercent: pedal.yPercent,
                    y: pedal.y,
                    height: pedal.height,
                    toggled: pedal.toggled,
                };
            });
            setPedalsMap(map);
            setSaveState("saved");
        }
        tryGetBoard()
    }, [id]);

    const handleDeleteAll = () => {
        setCurrBoard({...currBoard, pedals:[]});
        closeDeletingPedalsModal();
    }

    function updatePedalXY(pedal){
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
        return;
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
        ctx.moveTo(currX + 1, currY - 1);
        // moving to the bottom 
        ctx.lineTo(currX - length * Math.cos(angle - Math.PI / 6) , currY - length * Math.sin(angle - Math.PI / 6));
        // moving to the top
        ctx.lineTo(currX - length * Math.cos(angle + Math.PI / 6), currY - length * Math.sin(angle + Math.PI / 6));
        ctx.lineTo(currX + 1, currY + 1);
    
        ctx.strokeStyle = '#006400';
        ctx.fillStyle = '#006400';
        ctx.stroke();
        ctx.fill();
    }

    function drawLines(){
        setSaveState("unsaved");
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
            updatePedalXY(pedal)
            let [currX, currY, currWidth, currHeight] = [pedal.x, pedal.y, pedal.width, pedal.height];
            currY += Math.round(currHeight / 2) || 0;
            drawnLines.push({prevX: prevX, prevY: prevY, currX: currX, currY:currY})
            drawLine(ctx, prevX, prevY, currX, currY)
            prevX = currX + currWidth;
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
                
                // comment this in if we want to default the positions of the pedals

                /*
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
                */
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

    const handleInterfaceSave = (pedal_vals, pedal_id) => {
        console.log("Interface Save");
        console.log(pedal_vals); // name: value
        let newPedal = pedalsMap.get(pedal_id+1);

        let updatedMap = new Map(genericParamsMap);
        updatedMap.set(genericIdx, pedal_vals);
        setGenericParamsMap(updatedMap);
        
        console.log("Pre:", newPedal);
        let paramInfo = pedalDataMap.get(newPedal.pedal_id).parameters;
        console.log("datamap:", paramInfo);
        
        let newPedalVals = new Map();
        paramInfo.map((key,value) => {
            newPedalVals.set(key.symbol, parseFloat(pedal_vals[key.name]));
        });

        console.log(newPedalVals); // symbol : value
        setInterfaceLoading(true);
        setTimeout(() => {

            Object.keys(newPedal.param_vals).forEach((key) => { 
                console.log(key);
                console.log(newPedal.param_vals);
                console.log("getting:", newPedalVals.get(key));
                newPedal.param_vals[key] = newPedalVals.get(key); 
            });
            console.log("Post:", newPedal);
            setTimeout(() => {
                // handleSave();
                setInterfaceLoading(false);
            }, 10);
        }, 2000);
    //     console.log(pedal_id);
    //     console.log(pedalsMap);  
    //    console.log(Object.keys(newPedal.param_vals));
    }

    async function addPedal(event, pedalId){
        setSaveState("unsaved");
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
        let pedalData = pedalDataMap.get(pedalId);

        // if (pedalData != null) {
        try {
            setAddedPedal(newPedal.pedal.name);
            handleClosePedalBrowser();
            console.log("started...");
            setTimeout(() => {
                setAddedPedal(null);
                console.log("...ended");
            }, 5000);
        } catch (error) {
            console.error("An error occurred:", error);
        }
        // }
        // addJACKPedal(0, pedalId, pedalDataMap[pedalData.pedal_name].pedal_uri, "in_l", "out_l", null);
    };

    function deletePedal(boardId){
        setSaveState("unsaved");
        console.log("deletePedal: " + boardId);
        const activePedal = pedalsMap.get(boardId);
        
        console.log(pedalsMap)
        let newMap = new Map(pedalsMap);
        newMap.delete(activePedal.boardId)
        setPedalsMap(newMap);
        console.log(newMap);

        // deleteJACKPedalfromBoard(0, activePedal.pedal_id);
    }

    function togglePedal(boardId){
        setSaveState("unsaved");
        console.log("togglePedal: " + boardId);
        const activePedal = pedalsMap.get(boardId);
        activePedal.toggled = activePedal.toggled ? false : true;
        let newMap = new Map(pedalsMap);
        newMap.set(boardId, activePedal)
        setPedalsMap(newMap);
        console.log(newMap);

    }

    let [pedalInfoMap, setPedalInfoMap] = useState(new Map())
    let [shownPedalId, setShownPedalId] = useState(null)

    function showInfoModal(pedal_id){
        // checking that we actually have the info about the pedal
        console.log("showInfoModal for pedal " + pedal_id);
        // we are resetting it back so just set it to null
        if(pedal_id == null){
            setShownPedalId(pedal_id);
            setShowBrowserButton(true);
            return;
        }
        setShowBrowserButton(false);
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

    const handleSave = async () => {
        setSaveState("saving");
        let saveObj = [];
        let decrement = null;
        pedalsMap.forEach((pedal, key) => {
            if (decrement == null) decrement = key;
            saveObj[key - decrement] = {
                pedal_id: pedal.pedal_id,
                toggled: pedal.toggled,
                xPercent: pedal.x / window.innerWidth,
                yPercent: pedal.y / window.innerHeight,
                x: pedal.x,
                y: pedal.y,
                width: pedal.width,
                height: pedal.height,
                param_vals: pedal.param_vals
            };
        });
        await saveAllToBoard(id, saveObj).then(() => {setSaveState("saved")});
    }


    function updatePedal(boardId, pedalUpdateFunction){
        setSaveState("unsaved");
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

        // changeJACKPedal(0, updatedPedal.pedal_id, pedalDataMap[updatedPedal.pedal_name].param_vals);
    }


    return (
        isLoading ? 
        <Loading /> :
        <>
            <div className="navbar board-nav">
                <div className="left-side icon-container">
                    <a className="navbar-brand" href={basePath} onClick={handleSave}>
                        <img src={`${basePath}/logo.png`} className="logo-container" alt="Digipedal Logo"/>
                    </a>
                </div>
                <a className="bungee-regular"> {
                currBoard.name.name.length > 12 ? currBoard.name.name.substring(0,10) + '...' : currBoard.name.name 
                } </a>
                <div className="right-side icon-container-right"> 
                    

                    {saveState ? 
                        <button className="save-btn" onClick={handleSave}> 
                            <img src={`../navbar_icons/save/${saveState}.png`} className="save" alt="Save"></img>
                        </button> 
                        : 
                        <></>
                    }
{/*                     
                    <button className="nav-btn" onClick={playPauseToggle}> 
                    {isPlaying ? <img src="../navbar_icons/play.png" className="play" alt="Play"/> : <img src="../navbar_icons/pause.png" className="pause" alt="Pause"/>} </button> */}
{/* 
                    <button className="nav-btn" onClick={handleShare}> <img src="../navbar_icons/share.png" className="share" alt="Share"/> </button> */}
 
                    <div style={{"opacity": 0}}>|||||||</div>
                </div>
            </div>  
            <Row>        
                <PedalBrowser pedalTypeMap={pedalTypeMap} addPedal={addPedal} handleShow={handleShowPedalBrowser} handleClose={handleClosePedalBrowser} show={showPedalBrowser}/>
            </Row>


            <PedalBrowser pedalTypeMap={pedalTypeMap} addPedal={addPedal} handleShow={handleShowPedalBrowser} handleClose={handleClosePedalBrowser} buttonShow={showBrowserButton} show={showPedalBrowser}/>
            {shownPedalId ? <InfoModal showing={true} handleClose={() => showInfoModal(null)} pedalInfo={pedalInfoMap.get(shownPedalId)}/> : null}
            <ShareModal sharing={sharing} handleShareClose={handleShareClose}/>
            <DeleteAllPedals showDeletePedalsModal={showDeletePedalsModal} closeDeletingPedalsModal={closeDeletingPedalsModal} openDeletingPedalsModal={openDeletingPedalsModal} handleDeleteAll={handleDeleteAll}/>
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
                            // showInfoModal={() => showInfoModal(pedal.pedal_id)}
                            showInfoModal={() => handleShow(pedal.pedal_id, index)}
                            updatePedal={(pedalUpdateFunction) => updatePedal(pedal.boardId, pedalUpdateFunction)}
                            index={index}/>
                        </Draggable>);
                    })}
                </Droppable>
            </DndContext>
            <GenericInterfaceModal pedal_id={genericId} pedal_idx={genericIdx} prevParams={genericParamsMap.get(genericIdx)} show={helpShow} handleClose={handleClose} handleInterfaceSave={handleInterfaceSave} pedalInfoMap={pedalInfoMap} setPedalInfoMap={setPedalInfoMap}/>
            <Toast show={addedPedal != null} animation={true}>
                <Toast.Body> {addedPedal} added successfully! </Toast.Body>
            </Toast>
            <Toast show={interfaceLoading} animation={true}>
                <Toast.Body> Editing Pedal Settings... </Toast.Body>
            </Toast>
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