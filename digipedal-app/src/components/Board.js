import { useParams } from "react-router-dom";
import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle'; 

import './Navbar.css';
import "./Board.css";
import Loading from './Loading';
import Button from 'react-bootstrap/Button';

// drag and drop stuff
import {DndContext} from '@dnd-kit/core';
import Draggable from './dnd/Draggable';
import Droppable from './dnd/Droppable';
import {restrictToParentElement} from '@dnd-kit/modifiers';

// pedal browser stuff
import PedalBrowser from './PedalBrowser'

function Board( {boards} ) {
    const { id }  = useParams();
    const [currBoard, setCurrBoard] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [pedalsMap, setPedalsMap] = useState(new Map());
    const [pedalMaxId, setPedalMaxId] = useState(1);

    // pedal browser stuff
    const [showPedalBrowser, setShowPedalBrowser] = useState(false);
  
    const handleClosePedalBrowser = () => setShowPedalBrowser(false);
    const handleShowPedalBrowser = () => setShowPedalBrowser(true);

    // setting up loading effect
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

    function addPedal(event, pedal){
        console.log(pedal)
        console.log(event);
        const activePedal = pedal;
        // remaking the pedal with the x, y corridnates 
        let newPedal = {
            ...activePedal,
        };
        newPedal.id = pedalMaxId + 1;
        // making the new map
        setPedalMaxId(pedalMaxId + 1);
        setPedalsMap(prev => new Map(prev).set(newPedal.id, newPedal));
        console.log(pedalsMap)
    };

    console.log(currBoard)
    console.log(pedalsMap)

    return (
        isLoading ? 
        <Loading /> :
        <>
            <div className="navbar sticky-top d-flex justify-content-between align-items-center">
                <a className="navbar-brand logo-container" href="/">
                    <img src="/logo.png" className="d-inline-block align-top logo-container" alt="Digipedal Logo"/>
                </a>
                <a className="bungee-regular"> {
                currBoard.name.length > 12 ? currBoard.name.substring(0,10) + '...' : currBoard.name 
                } </a>
                <div className="right-side icon-container-right"> 
                    <img src="../navbar_icons/play.png" className="play" alt="Play"/>
                    <img src="../navbar_icons/share.png" className="share" alt="Share"/>
                    <img src="../navbar_icons/three_dots.png" className="three-dots" alt="More"/>
                </div>
            </div>
            <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToParentElement]}>
                <Droppable className="w-100" modifiers={[restrictToParentElement]} style={{height: `${100 - 17}vh`}}>
                    {[...pedalsMap.values()].map((pedal) => {
                        return (
                        <Draggable id={pedal.id} x={pedal.x} y={pedal.y}>
                            <img className="pedal" src={pedal.image} key={pedal.id}/>
                        </Draggable>);
                    })}
                    <PedalBrowser pedalsMap={pedalsMap} addPedal={addPedal} handleShow={handleShowPedalBrowser} handleClose={handleClosePedalBrowser} show={showPedalBrowser}/>
                </Droppable>
            </DndContext>
        </>
    );
    
    
    // dealing with the ending of drag events
    function handleDragEnd(event) {
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