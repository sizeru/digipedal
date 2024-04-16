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

// attaching front end and back end
import {getPedals} from './firebaseOperations'


function App() {

  // const boardsRef = useRef(boardData.map((board) => board));
  // const [boards, setBoards] = useState(boardsRef.current);
  const [pedalTypeMap, setPedalTypeMap] = useState(null)
  const [pedalDataMap, setpedalDataMap] = useState(null)

  useEffect(() => {
    const getPedalTypeMap = async () => {
      console.log("trying to getPedals");
      let pedalArray = await getPedals()

      console.log("getPedals result: ")
      console.log(pedalArray)

      console.log("turning getPedals result into an actual map")
      let pedalMap = new Map()
      let pedalDataMap = new Map()
      pedalArray.forEach((pedal) =>{
        pedalMap.set(pedal.id, pedal.name)
        pedalDataMap.set(pedal.id, {
          "mfr": pedal.mfr,
          "pedal_uri": pedal.pedal_uri,
          "manifest_uri": pedal.manifest_uri,
          "parameters": pedal.parameters,
          "type": pedal.type
        })
      })

      console.log("resulting pedalMap: ")
      console.log(pedalMap)
      console.log(pedalDataMap)
      setPedalTypeMap(pedalMap)
      setpedalDataMap(pedalDataMap)
    }
    getPedalTypeMap()
  }, [])

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

  const basePath = process.env.PUBLIC_URL;

  return (
      <Router basename={`/${basePath}`}>
        {console.log(basePath)}
        <Routes>
            <Route exact path="/" 
                   element={<Home />} />
            <Route exact path="/board" 
                   element={<Board pedalTypeMap={pedalTypeMap} pedalDataMap={pedalDataMap}/>} />
              <Route path="/board/:id"
                    element={<Board pedalTypeMap={pedalTypeMap} pedalDataMap={pedalDataMap}/>} /> 
        </Routes>
      </Router>
  );
}

export default App;
