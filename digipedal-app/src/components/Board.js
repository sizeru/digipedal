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

    const [pedalsMap, setPedalsMap] = useState(new Map());

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
                        return <Draggable id={pedal.id} x={pedal.x} y={pedal.y}><img className="pedal" src={pedal.image} key={pedal.id}/></Draggable>;
                    })}
                </Droppable>
            </DndContext>
        </>
    );
    
    
    function handleDragEnd(event) {
        console.log(event)
        const activePedal = pedalsMap.get(event.active.id);
        const draggedElement = document.getElementById(`${event.active.id}d`);
        console.log(draggedElement)
        const draggedElementRect = draggedElement.getBoundingClientRect();
        console.log(draggedElementRect)
        if (activePedal) {
            const updatedPedal = {
                ...activePedal,
                x: draggedElementRect.x,
                y: draggedElementRect.y,
            };
            setPedalsMap(prev => new Map(prev).set(activePedal.id, updatedPedal));
        }
    }
};


export default Board;