import {Button, Modal, Row, Col} from 'react-bootstrap';

import {findPedal} from './pedal_components/PedalFinder'

function PresetsBrowser({presetsTypeMap, addPedal, handleShow, handleClose, show}) {
  
  return (
    <>

      { <Button className="default-btn" id="PedalPresetsButton" variant="primary" onClick={handleShow}>
        Presets
      </Button> }

      

      {/* <ul>
        {pedals.map(pedal => (
          <li key={pedal.id}>
            {pedal.id} - {pedal.name}
          </li>
        ))}
      </ul> */}

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add preset</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            {Array.from(presetsTypeMap).map((pedalEntry, idx) => {
              let [pedalId, pedalType] = pedalEntry
              let PedalElement = findPedal(pedalType);

              return ( PedalElement &&
                  <Col className="browser-col" md={4}>
                    <button key={`pedal browser button ${idx} `} onClick={(event) => addPedal(event, pedalId)}>
                        <PedalElement width={140} height={200} isStatic={true}/>
                    <text className="browser-text"> {pedalType} </text>
                    </button>
                  </Col>
              );
            })}
            </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button className="default-btn" variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default PresetsBrowser;