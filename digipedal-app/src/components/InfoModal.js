import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import './InfoModal.css';
import { useState, useEffect } from 'react';
import { getPedalById } from '../firebaseOperations';

function InfoModal( {showing, handleClose, pedalId} ) {
    const [pedalInfo, setPedalInfo] = useState(null);
    // const [isLoading, setIsLoading] = useState(true);
    const basePath = process.env.PUBLIC_URL;

    useEffect(() => {
        async function getPedalInfo() {
            setPedalInfo(await getPedalById(pedalId.toString()));
        }
        getPedalInfo().then(() => {
            // setIsLoading(false);
        });
        // setPedalInfo(pedals.find((pedal) => pedal.id == pedalId));
    }, [pedalId]);
    
    return ( 
        <div>  
            <Modal  show={showing} 
                    onHide={handleClose} 
                    size="xl"
                    aria-labelledby="contained-modal-title-vcenter"
                    className="modal-container"
                    centered>
                <Modal.Header closeButton> 
                    <Modal.Title className="modal-title-centered"> {pedalInfo ? (pedalInfo.name + ": " + pedalInfo.type) : 0} </Modal.Title>
                </Modal.Header>
                <Modal.Body className="grid">
                    <Container>
                        <Row>
                            <Col md={6}>
                                <div className="item-container">
                                    <img src={pedalInfo ? basePath + "/pedals" + pedalInfo.image : ""} alt={pedalInfo ? pedalInfo.name : ""} className="pedal-image"/>
                                </div>
                            </Col>
                            <Col md={6}>
                                <Row key="Description">
                                    <Col className="headers" md={3}>
                                        <h3> Info </h3> 
                                    </Col>
                                    <Col md={9}>
                                        <p> {pedalInfo ? pedalInfo.description : ""} </p>
                                    </Col>
                                    {pedalInfo ? 
                                    pedalInfo.parameters.map( (param, index) => (
                                    <Row key={"param " + index}>
                                        <Col className="headers" md={4}>
                                            <h4> {param.name} </h4> 
                                        </Col>
                                        <Col md={8}>
                                            <p> {param.description} </p>
                                        </Col>
                                    </Row>
                                    )) : ""}
                                </Row>
                            </Col>
                        </Row>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleClose}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default InfoModal;