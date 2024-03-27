import './App.css';
import Home from './components/Home.js';
import Board from './components/Board.js';
import boardData from './boards.json';
import pedalData from './pedals.json'

import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import { useState, useEffect, useRef } from 'react';


function App() {

  const boardsRef = useRef(boardData.map((board) => board));
  const [boards, setBoards] = useState(boardsRef.current);

  /* Use with Express Server -- move boards.json outside of src folder 

  const [boards, setBoards] = useState(null);
  useEffect(() => {
    async function fetchData() {
      const response = await fetch('http://localhost:3001/read-json');
      const data = await response.json();
      setBoards(data);
    }
    fetchData();
  }
  , []);

  const newBoard = async () => {
    const newBoard = {
      "id": boards.length + 1,
      "name": "Board" + (boards.length + 1),
      "image": "",
      "pedals" : []
    }
    const updatedBoards = [...boards, newBoard];
    const response = await fetch('http://localhost:3001/write-json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedBoards),
    });
    const data = response.json();
    setBoards(updatedBoards);
  }

  */


  return (
      <Router>
        <Routes>
            <Route exact path="/" 
                   element={<Home boards={boards} /*newBoard={newBoard}*//>} />
            <Route exact path="/board" 
                   element={<Board boards={boards} pedalData={pedalData}/>} />
              <Route path="/board/:id"
                    element={<Board boards={boards} pedalData={pedalData}/>} /> 
        </Routes>
      </Router>
  );
}

export default App;
