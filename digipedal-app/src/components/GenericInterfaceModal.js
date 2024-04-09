import { Container, Row, Col, Modal, Button, InputGroup, Form } from 'react-bootstrap';
import { getPedalById } from '../firebaseOperations';
import { useState, useEffect } from 'react';
import { Slider } from '@mui/material';

function GenericInterfaceModal( {pedal_id, show, handleClose} ) {
    const basePath = process.env.PUBLIC_URL;
    const [pedalVals, setPedalVals] = useState(null);
    const [newPedalVals, setNewPedalVals] = useState(null);
    const [pedalParams, setPedalParams] = useState(null);
    const [pedalName, setPedalName] = useState("");

    useEffect(() => {
        const getResponse = async () => {
            return await getPedalById(pedal_id.toString());
        };
        getResponse().then( (response) => {
            setPedalName(response.name);
            setPedalParams(response.parameters);
            return response.parameters;
        }).then( (response) => {
            let pedalVals = {};
            response.forEach(param => {
                pedalVals[param.name] = param.default
            });
            setPedalVals(pedalVals);
            setNewPedalVals(pedalVals);
        });
    }, []);

    const changePedalVal = (param, value) => {
        console.log(param + " : " + value);
        let editingPedalVals = {...newPedalVals};
        editingPedalVals[param] = value;
        setNewPedalVals(editingPedalVals);
    };

    const adjuster = () => {
        return (
            <Row>
                { pedalParams.map((param) => {
                    return (
                        <InputGroup>
                            {param.unit === "dropdown" ? (
                                <div>
                                    <Form.Label> {param.name} </Form.Label>
                                    <Form.Select defaultValue={pedalVals[param.name]} onChange={(e) => changePedalVal(param.name, e.target.value)}>
                                        {(() => {
                                            let options = [];
                                            for (let i = param.minimum; i < param.maximum; i++) {
                                                options.push(<option value={i}> {i} </option>);
                                            }
                                            return options;
                                        })()}
                                    </Form.Select>
                                </div>
                            ) : param.unit === "toggle" ? (
                                <div>
                                    <Form.Label> {param.name} </Form.Label>
                                    <InputGroup.Checkbox id={param.name} defaultChecked={pedalVals[param.name]} onClick={(e) => changePedalVal(param.name, !e.target.value)} />
                                </div>
                            ) : (
                                <div className="slider-con">
                                    <Form.Label> {param.name} </Form.Label>
                                    <Col md={12}></Col>
                                    <Slider id={param.name +"Slider"} min={param.minimum} max={param.maximum} defaultValue={pedalVals[param.name]} valueLabelDisplay="auto" step={(param.maximum-param.minimum)/50} onChange={(e) => changePedalVal(param.name, e.target.value)}/>
                                </div>
                            )}
                        </InputGroup>
                    );
                })}
            </Row>
        );
    };

    const handleSave = () => {
        setPedalVals(newPedalVals);
    };

    return (
        <div>
            <Modal  show={show} 
                    onHide={() => {handleClose(); setNewPedalVals(pedalVals);}} 
                    aria-labelledby="contained-modal-title-vcenter"
                    className="modal-container"
                    centered>
                <Modal.Header closeButton> 
                    <Modal.Title className="modal-title-centered"> {pedalName ? (pedalName) : "Pedal Settings"} </Modal.Title>
                </Modal.Header>
                <Modal.Body className="grid">
                    {pedalParams ? 
                        <Container>
                            { adjuster() }
                        </Container> :
                        <div></div>
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" 
                            onClick={() => {
                                setNewPedalVals(pedalVals);
                                handleClose(); 
                            }}>
                        Close
                    </Button>
                    <Button variant="primary" 
                            onClick={() => {handleSave(); handleClose();}}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default GenericInterfaceModal;