import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import './InfoModal.css';
import { useState} from 'react';

function ShareModal( {sharing, handleShareClose, linkToShare}) {
    
    const [isCopied, setIsCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(linkToShare).then(() => {
            // Alert the user that the action took place.
            setIsCopied(true);
            // Optionally, revert the 'Copied' state back to 'Copy' after few seconds
            setTimeout(() => setIsCopied(false), 3000);
        }, (err) => {
            console.error('Async: Could not copy text: ', err);
        });
    }                                         //change onhide = to handleShareClose or some
    
    return ( 
        <div>                                         
             <Modal show={sharing} onHide={handleShareClose}>
                <Modal.Header closeButton>
                  <Modal.Title>Share your Board URL</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="input-group">
                        <input
                            type="text"
                            value={linkToShare}
                            readOnly
                            className="form-control"
                        />
                        <Button onClick={copyToClipboard}>
                            {isCopied ? <><span className="checkmark">✓</span>Copied</> : 'Copy'}
                        </Button>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleShareClose}>
                        Cancel
                    </Button>
                    </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ShareModal;