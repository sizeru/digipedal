
import {Button, Modal} from 'react-bootstrap';

import {findPedal} from './pedal_components/PedalFinder'

function PedalBrowser(props) {

  let pedalTypeMap =  props.pedalTypeMap;
  let addPedal = props.addPedal;
  let handleShow = props.handleShow;
  let handleClose = props.handleClose;
  let show = props.show;
  
  console.log("PedalBrowser")
  return (
    <>
      <Button id="PedalBrowserButton" variant="primary" onClick={handleShow}>
        Add Pedal!
      </Button>

      {/* <ul>
        {pedals.map(pedal => (
          <li key={pedal.id}>
            {pedal.id} - {pedal.name}
          </li>
        ))}
      </ul> */}

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add pedal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {Array.from(pedalTypeMap).map((pedalEntry) => {
              let [pedalId, pedalType] = pedalEntry
              // console.log("pedalType")
              // console.log(pedalType)
              // console.log("pedalId")
              // console.log(pedalId)
              let PedalElement = findPedal(pedalType);
              console.log(PedalElement)
              return (
              <button onClick={(event) => addPedal(event, pedalId)}>
                  {pedalType}
                  <PedalElement width={140} height={200} isStatic={true}/>
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