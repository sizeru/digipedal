import './App.css';
import Home from './components/Home.js';
import Board from './components/Board.js';
import boardData from './boards.json';

import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import { useState, useEffect, useRef } from 'react';


function App() {

  const boardsRef = useRef(boardData.map((board) => board));
  const [boards, setBoards] = useState(boardsRef.current);



  return (
      <Router>
        <Routes>
            <Route exact path="/" 
                   element={<Home boards={boards}/>} />
            <Route exact path="/board" 
                   element={<Board boards={boards} />} />
              <Route path="/board/:id"
                    element={<Board boards={boards} />} /> 
        </Routes>
      </Router>
  );
}

export default App;
