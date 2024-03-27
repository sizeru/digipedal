import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import './InfoModal.css';
import { useState, useEffect } from 'react';

function InfoModal( {showing, handleClose, pedals, pedalId} ) {
    const [pedalInfo, setPedalInfo] = useState(null);

    useEffect(() => {
        setPedalInfo(pedals.find((pedal) => pedal.id == pedalId));
    }, [pedals, pedalId]);
    
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
                                    <img src={pedalInfo ? "/pedals" + pedalInfo.image : ""} alt={pedalInfo ? pedalInfo.name : ""} className="pedal-image"/>
                                </div>
                            </Col>
                            <Col md={6}>
                                <Row key="Description">
                                    <Col className="headers" md={3}>
                                        <h4> Info </h4> 
                                    </Col>
                                    <Col md={9}>
                                        <p> {pedalInfo ? pedalInfo.description : ""} </p>
                                    </Col>
                                    {pedalInfo ? 
                                    pedalInfo.effects.map( (effect, index) => (
                                    <Row key={"Effect " + index}>
                                        <Col className="headers" md={3}>
                                            <h4> {effect.effect_name} </h4> 
                                        </Col>
                                        <Col md={9}>
                                            <p> {effect.effect_description} </p>
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