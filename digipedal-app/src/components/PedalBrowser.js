
import {Button, Modal} from 'react-bootstrap';
function PedalBrowser(props) {

  let pedalsMap =  props.pedalsMap;
  let addPedal = props.addPedal;
  let handleShow = props.handleShow;
  let handleClose = props.handleClose;
  let show = props.show;

  return (
    <>
      <Button id="PedalBrowserButton" variant="primary" onClick={handleShow}>
        Add Pedal!
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add pedal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {[...pedalsMap.values()].map((pedal) => {
                return (
                <button onClick={(event) => addPedal(event, pedal)}>
                    {pedal.name}
                    <img  className="pedal" src={pedal.image} key={pedal.id}/>
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