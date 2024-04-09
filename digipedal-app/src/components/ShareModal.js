import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import './InfoModal.css';
import { useState, useEffect } from 'react';

function ShareModal( {sharing, handleShareClose}) {
    const [showShareModal, setShowShareModal] = useState(false); // State for the sharing modal visibility
    const [emailAddress, setEmailAddress] = useState(''); // State for the email address input

    const share = () => {
        console.log("Share");
    }                                            //change onhide = to handleShareClose or some
    
    return ( 
        <div>                                         
             <Modal show={sharing} onHide={handleShareClose}>
                <Modal.Header closeButton>
                  <Modal.Title>Share via Email</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form>
                    <label htmlFor="emailInput">To:</label>
                    <input
                        type="email"
                        id="emailInput"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        className="form-control"
                    />
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowShareModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={share}>
                        Send Email
                    </Button>
                    </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ShareModal;