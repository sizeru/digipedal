import React, { useState, useEffect, useRef } from 'react';
import { SplitButton, Dropdown } from 'react-bootstrap';
import { deleteBoard, getBoardById } from '../firebaseOperations';
import 'bootstrap/dist/css/bootstrap.min.css';


function SplitDropDown(id, setLoading) {
  const [selectedItem, setSelectedItem] = useState('...');
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');

  // Options for the dropdown
  const options = ['Rename', 'Delete'];

  // Function to handle selection
  const handleSelect = async (option) => {
    setSelectedItem(option);
    console.log(`You selected: ${option}`);
    if (option == 'Delete') {
      setLoading(true)
      await deleteBoard(id.toString());
      setLoading(true);
    }
    if (option == 'Rename') {
        setIsRenaming(true);
    } else {
        setSelectedItem(option);
        setIsRenaming(false);
    }
      
    
       
      

  };

  const handleRename = (e) => {
    if (e.key === 'Enter') {
      setSelectedItem(newName);
      //
      setIsRenaming(false);
      setNewName(''); // Reset the input field
    }
  };

  return (
    <div>
    <SplitButton
      id="dropdown-split-basic"
      title={selectedItem}
      variant="success"
      onSelect={handleSelect}
    >
      {options.map((option, index) => (
        <Dropdown.Item key={index} eventKey={option}>
          {option}
        </Dropdown.Item>
      ))}
    </SplitButton>

    {isRenaming && (
        <input
          type="text"
          placeholder="New name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleRename}
          autoFocus
        />
      )}
    </div>
  );
}

export default SplitDropDown;
