import { Modal, Button } from 'react-bootstrap';

function WarningModal({showModal, handleClose, handleDelete,}) {    
    return (
    <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
    </Modal.Header>
        <Modal.Body> Are you sure you want to delete this item? </Modal.Body>
        <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
            Cancel
        </Button>
        <Button variant="danger" onClick={handleDelete}>
            Delete
        </Button>
        </Modal.Footer>
    </Modal>
    );
}
export default WarningModal;