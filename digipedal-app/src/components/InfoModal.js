import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import './InfoModal.css';
import {findPedal} from './pedal_components/PedalFinder'

function InfoModal( {showing, handleClose, handleBack, pedalInfo} ) {

    let PedalElement = findPedal(pedalInfo.name);
    return ( 
        <div>  
            <Modal  show={showing} 
                    onHide={handleClose} 
                    size="xl"
                    aria-labelledby="contained-modal-title-vcenter"
                    className="modal-container"
                    centered>
                <Modal.Header closeButton> 
                    <Button className="help-btn" onClick={handleBack}> <text className="help-txt"> {"<"} </text> </Button>

                    <Modal.Title className="modal-title-centered"> {pedalInfo ? (pedalInfo.name + ": " + pedalInfo.type) : 0} </Modal.Title>
                </Modal.Header>
                <Modal.Body className="grid">
                    <Container>
                        <Row>
                            <Col md={6}>
                                <div className="item-container">
                                    <PedalElement width={window.innerWidth * .3} height={window.innerHeight * .5} isStatic={true}/>
                                </div>
                            </Col>
                            <Col md={6}>
                                <Row key="Description">
                                    <Col className="headers" md={12}>
                                        <h2> Effect Descriptions </h2> 
                                    </Col>
                                    <Col md={8}>
                                        <p> {pedalInfo ? pedalInfo.description : ""} </p>
                                    </Col>
                                    {pedalInfo ? 
                                    pedalInfo.parameters.map( (parameter, index) => (
                                        !parameter.hide ?
                                    <Row key={"Parameter " + index}>
                                        <Col className="headers" md={4}>
                                            <h4> {parameter.name} </h4> 
                                        </Col>
                                        <Col md={8}>
                                                <p> {parameter.description} </p>
                                        </Col>
                                    </Row> :
                                    <></>
                                    )) : ""}
                                </Row>
                            </Col>
                        </Row>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="info-btn" variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default InfoModal;