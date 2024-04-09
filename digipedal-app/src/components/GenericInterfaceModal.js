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
        // console.log(param + " : " + value);
        let editingPedalVals = {...newPedalVals};
        editingPedalVals[param] = value;
        setNewPedalVals(editingPedalVals);
    };

    const calculateStep = (param) => {
        if (param.step === "log") {
            let step = (Math.log(param.maximum) - Math.log(param.minimum)) / (param.maximum - param.minimum);
            console.log("step: " + step);
            return step;
        } else {
            return (param.maximum - param.minimum) / 100;
        }
    }

    function valueLabelFormat(value, unit) {
        if (unit == "coef") return value * 100 + "%";
        else if (unit == "degree") return value + "°";
        else if (unit === "none" || unit === undefined) return value;
        return `${value} ${unit}`;
    }

    const adjuster = () => {
        return (
            <Row>
                { pedalParams.map((param) => {
                    return (
                        <InputGroup className="params">
                            {param.unit === "dropdown" ? (
                                <div>
                                    <Form.Label> {param.name} </Form.Label>
                                    <Form.Select 
                                        defaultValue={param.options[pedalVals[param.name]]} 
                                        onChange={(e) => changePedalVal(param.name, e.target.value)}>
                                    { param.options.map((option, index) => {
                                        return <option key={index} value={option}> {option} </option>;
                                    })}
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
                                    <Row>
                                        <Col md={8}>
                                            <Slider 
                                                id={param.name +"Slider"} 
                                                min={param.minimum} 
                                                max={param.maximum} 
                                                defaultValue={pedalVals[param.name]} valueLabelDisplay="auto" 
                                                valueLabelFormat={value => {return valueLabelFormat(value, param.unit)}}
                                                step={calculateStep(param)} onChange={(e) => changePedalVal(param.name, e.target.value)}/>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Control type="number" value={newPedalVals[param.name]} onChange={(e) => changePedalVal(param.name, e.target.value)} />
                                        </Col>
                                    </Row>
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