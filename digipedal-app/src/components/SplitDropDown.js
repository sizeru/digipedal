import React, { useState } from 'react';
import { Dropdown, Button, Container, ButtonGroup, InputGroup, Form } from 'react-bootstrap';
import { deleteBoard, renameBoard } from '../firebaseOperations';
import { useNavigate } from 'react-router-dom';
import WarningModal from './WarningModal';
import '../App.css';

import 'bootstrap/dist/css/bootstrap.min.css';


function SplitDropDown({id, name}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState("");
  const [showModal, setShowModal] = useState(false); 

  const navigate = useNavigate();

  // Options for the dropdown
  // Function to handle selection
  const handleDelete = () => {
    setShowModal(true); 
  };

  const handleConfirmDelete = async () => {
    await deleteBoard(id.toString());
    navigate(0);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleRename = (e) => {
    setIsRenaming(true);
  };
  

  const cancelRename = () => {
    setIsRenaming(false);
  }

  const confirmRename = async () => {
    await renameBoard(id.toString(), newName);
    navigate(0);
  }

  const handleKeyDown = async (e) => {
    if (e.key == 'Enter') {
      await renameBoard(id.toString(), newName);
      navigate(0);
    } else if (e.key == 'Escape') {
      setIsRenaming(false);
    }
  }

  return (
    <Container className="custom-button-container">
      <Dropdown className="w-100 custom-button-group" as={ButtonGroup}>
        {isRenaming ?
        <InputGroup> 
          <Form.Control className="rename-field" autoFocus placeholder={name} onChange={(e) => {
            setNewName(e.target.value); 
          }} onKeyDown={handleKeyDown}>
          </Form.Control>
        </InputGroup>
        : 
        <Button className="board-title" variant="success" onClick={() => {navigate(`/board/${id}`)}}>{name}</Button>
        }
        <Dropdown.Toggle split variant="default" className="custom-toggle default-btn" id="dropdown-split-basic" />

        <Dropdown.Menu>
          {isRenaming ?
          <div>
            <Dropdown.Item onClick={confirmRename}> Confirm </Dropdown.Item>
            <Dropdown.Item onClick={cancelRename}> Cancel </Dropdown.Item>
          </div>
          :
          <div>
            <Dropdown.Item onClick={handleRename}>Rename</Dropdown.Item>
            <Dropdown.Item onClick={handleDelete}>Delete</Dropdown.Item>
          </div>
          }
        </Dropdown.Menu>
      </Dropdown>
      <WarningModal showModal={showModal} handleClose={handleCloseModal} handleDelete={handleConfirmDelete} />
    </Container>);
}

export default SplitDropDown;
