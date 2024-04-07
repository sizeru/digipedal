import React, { useState, useEffect, useRef } from 'react';

function ShareDropDown() {
  const [isActive, setIsActive] = useState(false);
  const dropdownRef = useRef(null);

  // Options for the dropdown
  const options = ['Rename', 'Delete'];

  // Function to handle selection
  const handleSelect = (option) => {
    console.log(`You selected: ${option}`);
    setIsActive(false); // Close the dropdown
  };

  // Event handler for closing dropdown if clicked outside
  useEffect(() => {
    const pageClickEvent = (e) => {
      // If active and click is outside dropdown, close it
      if (dropdownRef.current !== null && !dropdownRef.current.contains(e.target)) {
        setIsActive(!isActive);
      }
    };

    // If the dropdown is active, listen for clicks on the page
    if (isActive) {
      window.addEventListener('click', pageClickEvent);
    }

    return () => {
      window.removeEventListener('click', pageClickEvent);
    };
  }, [isActive]);

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      <button onClick={() => setIsActive(!isActive)}>Select Option</button>

      {isActive && (
        <ul className="dropdown">
          {options.map((option, index) => (
            <li key={index} onClick={() => handleSelect(option)}>
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ShareDropDown;