import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle'; 
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'
import Button from 'react-bootstrap/Button';
import './Navbar.css';
import Loading from './Loading';

function Home( {boards, /*newBoard*/} ) {
  const [isLoading, setLoading] = useState(true);

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


  return (
    isLoading ? 
    <Loading /> :
    <div>
      <div className="navbar">
          <a className="navbar-brand" href="/">
              <img src="/logo.png" className="logo-container" alt="Digipedal Logo"/>
          </a>
          <div className="navbar-nav">
              <a className="bungee-regular"> Digipedal </a>
          </div>
          <div className="logo-container">  </div> 
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
                      {board.id != 1 ? 
                      <Button className="board-title btn-full" as={Link} to={"/board/"+ board.id}> {board.name} </Button> : 
                      <Button className="board-title btn-full" /*onClick={newBoard}*/> {board.name} </Button>}
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