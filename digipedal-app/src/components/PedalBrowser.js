
import {Button, Modal} from 'react-bootstrap';
import { getPedals, postPedalToBoard, getBoardById, getPedalById, getBoards } from '../firebaseOperations';
import { useEffect, useState } from 'react';
import AmpPedal from './pedal_components/AmpPedal'
function PedalBrowser(props) {

  let pedalsMap =  props.pedalsMap;
  let addPedal = props.addPedal;
  let handleShow = props.handleShow;
  let handleClose = props.handleClose;
  let show = props.show;
  const basePath = process.env.PUBLIC_URL;

  const [pedals, setPedals] = useState([]);
  useEffect(() => {
    const getAll = async () => {
      // const pedalsList = await getPedals();
      // setPedals(pedalsList);

      // const newPedal = {
      //   id: 3,
      //   x: 20,
      //   y: 20,
      //   toggled: true,
      //   param_vals: {
      //     "Amplification": 1.5
      //   }
      // }
      // editPedal("1", "2", newPedal);

      // const boardData = await getBoardById("1");
      // console.log(boardData);

      // const pedal1 = await getPedalById("3");
      // console.log(pedal1);

      const allBoards = await getPedals();
      console.log(allBoards);
    };
    getAll();
  }, []);

  return (
    <>
      <Button id="PedalBrowserButton" variant="primary" onClick={handleShow}>
        Add Pedal!
      </Button>

      <h2>Pedals</h2>
      <ul>
        {pedals.map(pedal => (
          <li key={pedal.id}>
            {pedal.id} - {pedal.name}
          </li>
        ))}
      </ul>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add pedal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {[...pedalsMap.values()].map((pedal) => {
                return (
                <button onClick={(event) => addPedal(event, pedal)}>
                    {pedal.name}
                    <AmpPedal width={140} height={200} isStatic={true}/>
                </button>);
            })}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default PedalBrowser;