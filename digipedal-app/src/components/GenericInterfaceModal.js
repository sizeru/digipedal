import { Container, Row, Col, Modal, Button, InputGroup, Form } from 'react-bootstrap';

function GenericInterfaceModal( {pedal_name, params_list, show, handleClose} ) {
    const basePath = process.env.PUBLIC_URL;
    const [pedalVals, setPedalVals] = useState({});

    useEffect(() => {
        let pedalVals = {};
        params_list.forEach((param) => {
            pedalVals[param.name] = param.default;
        });
        setPedalVals(pedalVals);
    }, []);

    const adjuster = (param, idx) => {
        <InputGroup>
            <InputGroup.Text> {param.name} </InputGroup.Text>
            <InputGroup.Checkbox checked={pedalVals[idx]} id={param.name} />
        </InputGroup>
    };

    return (
        <div>
            <Modal  show={show} 
                    onHide={handleClose} 
                    size="xl"
                    aria-labelledby="contained-modal-title-vcenter"
                    className="modal-container"
                    centered>
                <Modal.Header closeButton> 
                    <Modal.Title className="modal-title-centered"> {pedalName ? (pedalName) : "Pedal Settings"} </Modal.Title>
                </Modal.Header>
                <Modal.Body className="grid">
                    <Container>
                        <Row>
                            {params_list.map((param, idx) => adjuster(param, idx))}
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