import './App.css';
import Navbar from './components/Navbar.js';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle'; 

import { useState } from 'react';

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
  const [page, setPage] = useState('home');

  return (
      <div className="container-fluid">
      <Navbar page={page}/>
        <div>
          <div className="col-12">
            <div className="row">
              {boards.map((board) => (
                <div className="col-12 col-md-6 col-lg-4 col-xl-3" key={board.id}>
                  <div className="card">
                    <img src={board.image} className="card-img-top" alt={board.name}/>
                    <div className="card-body">
                      <button className="btn"href="#">{board.name}</button>
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
