import { Modal } from 'react-bootstrap';

function GenericInterfaceModal( {params_map} ) {
    const basePath = process.env.PUBLIC_URL;
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
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default GenericInterfaceModal;