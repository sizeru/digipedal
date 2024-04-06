
import {Button, Modal} from 'react-bootstrap';
import { getPedals, editPedal } from '../firebaseOperations';
import { useEffect, useState } from 'react';
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
      const pedalsList = await getPedals();
      setPedals(pedalsList);

      const newPedal = {
        id: 3,
        x: 0,
        y: 0,
        toggled: false,
        param_vals: {
          "Amplification": 2
        }
      }
      editPedal("1", "3", newPedal);
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
                    <img  className="pedal" src={basePath + pedal.image} key={pedal.id}/>
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