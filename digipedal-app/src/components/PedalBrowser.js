
import {Button, Modal} from 'react-bootstrap';

import {findPedal} from './pedal_components/PedalFinder'

function PedalBrowser({pedalTypeMap, addPedal, handleShow, handleClose, show}) {
  
  return (
    <>
      <Button id="PedalBrowserButton" variant="primary" onClick={handleShow}>
        +
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
            {Array.from(pedalTypeMap).map((pedalEntry, idx) => {
              let [pedalId, pedalType] = pedalEntry
              // console.log("pedalType")
              // console.log(pedalType)
              // console.log("pedalId")
              // console.log(pedalId)
              let PedalElement = findPedal(pedalType);
              // console.log(PedalElement)
              return (
              <button key={`pedal browser button ${idx} `} onClick={(event) => addPedal(event, pedalId)}>
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