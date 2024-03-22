import './App.css';
import Navbar from './components/Navbar.js';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle'; 

import { useState, useEffect } from 'react';

const boards = [
  {
    "id": 1,
    "name" : "Create New",
    "image": "create-new.png"
  },
  {
    "id" : 2,
    "name" : "My Super Board!!",
    "image": "super-board.png"
  },
  {
    "id" : 3,
    "name" : "Pedals of Fury",
    "image": "pedals-of-fury.png"
  },
  {
    "id": 4,
    "name" : "Default Board",
    "image": "default-board.png"
  }, 
  {
    "id": 5,
    "name" : "Board with long name",
    "image": "longname.png"
  }, 
  {
    "id" : 6,
    "name" : "Board-demic",
    "image": "board-demic.png"
  }, 
  {
    "id" : 7,
    "name" : "Board of the Rings",
    "image": "board-of-the-rings.png"
  },
  {
    "id" : 8,
    "name" : "Brown v Board",
    "image": "brown-v-board.png"
  } 
];
function App() {
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
  return (
      <div className="container-fluid">
      <Navbar page={isLoading ? "Loading..." : page}/>
        <div>
          <div className="col-12">
            <div className="row board-margins">
              {boards.map((board) => (
                <div className="col-12 col-md-6 col-lg-4 col-xl-3" key={board.id}>
                  <div className="card">
                    <img src={board.image} className="card-img-top" alt={board.name}/>
                    <div className="card-body">
                      <Button className="board-title" onClick={selectPage}> {board.name} </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}

export default App;
