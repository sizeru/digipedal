import { Container, Row, Col, Modal, Button, InputGroup, Form } from 'react-bootstrap';
import { getPedalById } from '../firebaseOperations';
import { useState, useEffect } from 'react';
import InfoModal  from './InfoModal';

function GenericInterfaceModal( {pedal_id, pedal_idx, show, handleClose, pedalInfoMap, setPedalInfoMap, handleInterfaceSave, prevParams} ) {
    const [pedalVals, setPedalVals] = useState(null);
    const [newPedalVals, setNewPedalVals] = useState(null);
    const [pedalParams, setPedalParams] = useState(null);
    const [pedalName, setPedalName] = useState("");
    const [loaded, setLoaded] = useState(false);
    const [infoShow, setInfoShow] = useState(false);

    const handleInfoShow = () => setInfoShow(true);
    // useEffect(() => {
    //     const getResponse = async () => {
    //         if (pedal_id == null) {
    //             setLoaded(false);
    //             return null;
    //         }
    //         return await getPedalById(pedal_id.toString());
    //     };
    //     getResponse().then( (response) => {
    //         setPedalName(response.name);
    //         setPedalParams(response.parameters);
    //         return response.parameters;
    //     }).then( (response) => {
    //         let pedalVals = {};
    //         response.forEach(param => {
    //             if (!param.hide) pedalVals[param.name] = param.default
    //         });
    //         setPedalVals(pedalVals);
    //         setNewPedalVals(pedalVals);
    //         setLoaded(true);
    //     }).catch((error) => {
    //         console.log(error + " in getPedalById");
    //     });
    // }, [pedal_id]);
    useEffect(() => {
        const getResponse = async () => {
            if (pedal_id == null) {
                setLoaded(false);
                return null;
            }
            return await getPedalById(pedal_id.toString());
        };
        getResponse().then( (response) => {
            setPedalName(response.name);
            setPedalParams(response.parameters);
            return response.parameters;
        }).then( (response) => {
            let pedalVals = {};
            response.forEach(param => {
                if (prevParams != null && prevParams[param.name] != null && prevParams[param.name] != NaN) pedalVals[param.name] = prevParams[param.name];
                else if (!param.hide) pedalVals[param.name] = param.default
            });
            setPedalVals(pedalVals);
            setNewPedalVals(pedalVals);
            console.log("Pedal Vals:", pedalVals);
            setLoaded(true);
        }).catch((error) => {
            console.log(error + " in getPedalById");
        });
    }, [pedal_id]);

    const changePedalVal = (param, value, index) => {
        let editingPedalVals = {...newPedalVals};
        // console.log("pedalParams:", pedalParams);
        if (value > pedalParams[index].maximum) value = pedalParams[index].maximum;
        if (value < pedalParams[index].minimum) value = pedalParams[index].minimum;
        editingPedalVals[param] = parseFloat(Number(value).toPrecision(3));
        setNewPedalVals(editingPedalVals);
        console.log("New Pedal Vals:", newPedalVals);
    };

    const calculateStep = (param) => {
        if (param.step === "log") {
            return (Math.log(param.maximum) - Math.log(param.minimum)) / (param.maximum - param.minimum);
        } else {
            return (param.maximum - param.minimum) / 15;
        }
    }

    function convertUnit(unit) {
        if (unit == "coef") return "%";
        else if (unit == "degree") return "°";
        // else if (unit === "none" || unit === undefined) return "";
        else return unit;
    }

    const adjuster = () => {
        return <Row>
        {
            pedalParams.map((param, index) => {
                if (param.hide) return null;
                const inputGroupContent = param.unit === "dropdown" ? (
                    <div>
                        <Form.Label> {param.name} </Form.Label>
                        <Form.Select 
                            defaultValue={param.options[pedalVals[param.name]]} 
                            onChange={(e) => changePedalVal(param.name, e.target.value, index)}>
                        { param.options.map((option, index) => {
                            return <option key={index} value={option}> {option} </option>;
                        })}
                        </Form.Select>
                    </div>
                ) : param.unit === "toggle" ? (
                    <div>
                        <Form.Label> {param.name} </Form.Label>
                        <InputGroup.Checkbox 
                            id={param.name} 
                            defaultChecked={pedalVals[param.name]} 
                            onClick={(e) => changePedalVal(param.name, !e.target.value, index)} />
                    </div>
                ) : (
                    <div className="slider-con">
                        <Form.Label> {param.unit == "none" || param.unit == undefined ? param.name : `${param.name} (${convertUnit(param.unit)})`} </Form.Label>
                        <Row>
                            <Col md={8}>
                                <Form.Range 
                                    id={param.name +"Slider"} 
                                    min={param.minimum} 
                                    max={param.maximum} 
                                    value={newPedalVals[param.name]}
                                    step={calculateStep(param)} onChange={(e) => changePedalVal(param.name, e.target.value, index)} />
                            </Col>
                            <Col md={4}>
                                <Form.Control type="number" value={newPedalVals[param.name]} 
                                onChange={(e) => {
                                    changePedalVal(param.name, e.target.value, index)
                                }}
                                />
                            </Col>
                        </Row>
                    </div>
                );
            return (
                <Col md={6} key={index}>
                    <InputGroup className="params">
                        {inputGroupContent}
                    </InputGroup>
                </Col>
                );
            })
        }
        </Row>
    };

    const handleSave = () => {
        setPedalVals(newPedalVals);
        handleClose();
        handleInterfaceSave(newPedalVals, pedal_idx);
        console.log("Current Pedal:", newPedalVals);
    };

    const interfaceModal = () => {
        return (
            <div>
                <Modal  show={show && loaded} 
                        onHide={() => {handleClose(); setNewPedalVals(pedalVals);}} 
                        aria-labelledby="contained-modal-title-vcenter"
                        size="xl"
                        className="modal-container"
                        centered>
                    <Modal.Header closeButton> 
                        <Button className="help-btn" onClick={handleInfoShow}> <text className="help-txt"> ? </text> </Button>
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
                        <Button className="default-btn" variant="secondary" 
                                onClick={() => {
                                    setNewPedalVals(pedalVals);
                                    handleClose(); 
                                }}>
                            Close
                        </Button>
                        <Button className="default-btn" variant="primary" 
                                onClick={() => {handleSave(); handleClose();}}>
                            Save
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }

    const infoModal = (id) => {
        console.log("id:", id);
        if (id == null) {
            setInfoShow(false);
            return;
        }
        let pedalInfo = pedalInfoMap.get(id);
        console.log(pedalInfo)
        if(pedalInfo == null){
            // we need to get the info about it and set it to showing
            const setNewPedalInfo = async () => {
                let newPedalInfo = await getPedalById(`${id}`);
                console.log(newPedalInfo)
                let newPedalInfoMap = new Map(pedalInfoMap);
                newPedalInfoMap.set(id, newPedalInfo)
                setPedalInfoMap(newPedalInfoMap)
                console.log(newPedalInfoMap)
            }
            setNewPedalInfo().then(() => {
                console.log(pedalInfoMap.get(id));
                return (<InfoModal  showing={infoShow} 
                            handleClose={() => infoModal(null)} 
                            pedalInfo={pedalInfoMap.get(id)}/>);
            });
        } else {
            console.log(pedalInfoMap.get(id));
            return (<InfoModal  showing={infoShow} 
                        handleBack={() => infoModal(null)} 
                        handleClose={() => {infoModal(null); handleClose();}}
                        pedalInfo={pedalInfoMap.get(id)}/>);
        }
    }

    return (
        <div>
            {infoShow ? 
            infoModal(pedal_id) :
            interfaceModal()}
        </div>
    );
}

export default GenericInterfaceModal;