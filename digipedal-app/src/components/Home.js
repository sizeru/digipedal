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

function Home() {
  return (
    <div>
      <h1>Welcome to Digipedal!</h1>
      <p>Let's get started by creating a new user account.</p>
    </div>
  );
}

export default Home;