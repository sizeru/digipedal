import { Modal, Button} from 'react-bootstrap';

import {deletePedalFromBoard} from '../firebaseOperations';

function DeleteAllPedals({ showDeletePedalsModal, closeDeletingPedalsModal, openDeletingPedalsModal, handleDeleteAll}) {
  
  return (
    <div>
      <Button id="DeleteButton" variant="primary" onClick={openDeletingPedalsModal}>
        <img src="../navbar_icons/trash.png" className="trash" alt="Trash"/>
      </Button> 


      <Modal show={showDeletePedalsModal} onHide={closeDeletingPedalsModal}>
              <Modal.Header closeButton>
              <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
              <Modal.Body> Are you sure you want to remove all pedals on the board? </Modal.Body>
              <Modal.Footer>
              <Button variant="secondary" onClick={closeDeletingPedalsModal}>
                  Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteAll}>
                  Confirm
              </Button>
              </Modal.Footer>
        </Modal>
  </div>
  );
}

export default DeleteAllPedals;