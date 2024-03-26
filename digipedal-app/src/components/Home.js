import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle'; 
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'
import Button from 'react-bootstrap/Button';
import './Navbar.css';
import Loading from './Loading';
import Navbar from './Navbar.js';

function Home( {boards} ) {
  const [isLoading, setLoading] = useState(true);
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
  };

  return (
    isLoading ? 
    <Loading /> :
    <div>
      <div className="navbar sticky-top d-flex justify-content-between align-items-center">
          <a className="navbar-brand logo-container" href="/">
              <img src="/logo.png" className="d-inline-block align-top logo-container" alt="Digipedal Logo"/>
          </a>
          <div className="navbar-nav">
              <a className="bungee-regular"> Digipedal </a>
          </div>
          <div className="logo-container">  </div> {/* Empty div to balance the logo */}
      </div>
      <div className="container-fluid">
        <div>
          <div className="col-12">
            <div className="row board-margins">
              {boards.map((board) => (
                <div className="col-12 col-md-6 col-lg-4 col-xl-3" key={"bootstrap card:" + board.id}>
                  <div className="card">
                    <img src={board.image} className="card-img-top" alt={board.name} key={board.name}/>
                    <div className="card-body">
                      <Button className="board-title" as={Link} to={"/board/"+ board.id}> {board.name} </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;