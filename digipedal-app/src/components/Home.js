import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle'; 
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import { getBoards, createBoard } from '../firebaseOperations';
import Button from 'react-bootstrap/Button';
import './Navbar.css';
import Loading from './Loading';
import SplitDropDown from './SplitDropDown.js';

function Home() {
  const [isLoading, setLoading] = useState(true);
  const basePath = process.env.PUBLIC_URL;
  const [boards, setBoards] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    async function getBoardFromDatabase() {
      setBoards(await getBoards());
    }

    if (isLoading) {
      getBoardFromDatabase().then(() => {
        setLoading(false);
      });
    }
  }, [isLoading]);

  const newBoard = () => {
    setLoading(true);
    createBoard(boards.length.toString()).then(() => {
      navigate(`/board/${boards.length}`);
    });
  };


  return (
    isLoading ? 
    <Loading /> :
    <div>
      <div className="navbar">
          <a className="navbar-brand" href={basePath}>
              <img src={`${basePath}/logo.png`} className="logo-container" alt="Digipedal Logo"/>
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
                  {board.id != 0 ? <SplitDropDown id={board.id} setLoading={setLoading} />: <div></div>}
                    <img  src={`${basePath}/board_previews/${board.image}`}    
                          className="card-img-top" 
                          alt={board.name} 
                          key={board.name} /> 
                    <div className="card-body">
                      {board.id != 0 ? 
                      <div>
                        <Button className="board-title btn-full" as={Link} to={"/board/"+ board.id}> {board.name} </Button>
                      </div>
                       : 
                      <div>
                        <Button className="board-title btn-full" onClick={newBoard}> {board.name} </Button>
                      </div>
                      }
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