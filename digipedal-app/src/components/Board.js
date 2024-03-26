import { useParams } from "react-router-dom";
import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle'; 

import './Navbar.css';
import "./Board.css";
import Loading from './Loading';

// drag and drop stuff
import {DndContext} from '@dnd-kit/core';
import Draggable from './dnd/Draggable';
import Droppable from './dnd/Droppable';

function Board( {boards} ) {
    const { id }  = useParams();
    const [currBoard, setCurrBoard] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [pedalsMap, setPedalsMap] = useState(new Map());

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
        setCurrBoard(boards.find((board) => board.id == id))
    }, [id, boards, isLoading]);


    // whenever the currboard is changed, we need to remake the pedal map 
    useEffect(() => {
        let tempPedals = new Map();
        let pedalMaxId = 1;
        if(currBoard && currBoard.pedals){
            currBoard.pedals.forEach((pedal) => {
                pedal.id = pedalMaxId++;
                tempPedals.set(pedal.id, pedal);
            });
        }
        setPedalsMap(tempPedals);
    }, [currBoard]);

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
                <div className="navbar-nav">
                    <a className="bungee-regular"> {currBoard.name} </a>
                </div>
                <div className="logo-container">  
                </div>
            </div>
            <DndContext onDragEnd={handleDragEnd}>
                <Droppable className="w-100 h-100">
                    {[...pedalsMap.values()].map((pedal) => {
                        console.log(pedal);
                        return (
                        <Draggable id={pedal.id} x={pedal.x} y={pedal.y}>
                            <img className="pedal" src={pedal.image} key={pedal.id}/>
                        </Draggable>);
                    })}
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