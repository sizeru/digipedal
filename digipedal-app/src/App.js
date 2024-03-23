import './App.css';
import Navbar from './components/Navbar.js';
import Home from './components/Home.js';
// import Board from './components/Board.js';

import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
// import Button from 'react-bootstrap/Button';

// import { useState, useEffect } from 'react';


function App() {
  /*
  const [isLoading, setLoading] = useState(false);
  const [page, setPage] = useState('Digipedal');

  useEffect(() => {
    function simulateNetworkRequest() {
      return new Promise((resolve) => setTimeout(resolve, 2000));
    }

    if (isLoading) {
      simulateNetworkRequest().then(() => {
        setLoading(false);
      });
    }
  }, [isLoading]);

  const selectPage = (event) => {
    setLoading(true);
    let title = event.target.innerText;
    if (title === 'Create New') { title = 'Digipedal'; }
    setPage(title);
  };
  */
  
  return (
      <Router>
        <Navbar page="Digipedal" />
        <Routes>
            <Route exact path="/" element={<Home />} />
            {/* <Route exact path="/board" element={<Board />} />
              <Route path="/board/:id"> </Route> */}
        </Routes>
      </Router>
      // <div className="container-fluid">
      // <Navbar page={isLoading ? "Loading..." : page}/>
      //   <div>
      //     <div className="col-12">
      //       <div className="row board-margins">
      //         {boards.map((board) => (
      //           <div className="col-12 col-md-6 col-lg-4 col-xl-3" key={board.id}>
      //             <div className="card">
      //               <img src={board.image} className="card-img-top" alt={board.name}/>
      //               <div className="card-body">
      //                 <Button className="board-title" onClick={selectPage}> {board.name} </Button>
      //               </div>
      //             </div>
      //           </div>
      //         ))}
      //       </div>
      //     </div>
      //   </div>
      // </div>
  );
}

export default App;
