import React, { useState } from 'react';

function LanguageDropdown() {
  const languages = ["JavaScript", "Python", "C++"];
  const [selectedLanguage, setSelectedLanguage] = useState("JavaScript"); // Default language
  const [isOpen, setIsOpen] = useState(false); // Toggle for dropdown

  const handleDropdownClick = () => {
    setIsOpen(!isOpen);
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setIsOpen(false); // Close dropdown after selecting
  };

  return (
    <div>
      <div style={{ cursor: 'pointer', border: '1px solid #ccc', padding: '10px', width: '150px' }} onClick={handleDropdownClick}>
        {selectedLanguage} ▼
      </div>

      {isOpen && (
        <ul style={{ listStyleType: 'none', margin: '0', padding: '0', border: '1px solid #ccc', width: '150px' }}>
          {languages.map((language, index) => (
            <li
              key={index}
              onClick={() => handleLanguageSelect(language)}
              style={{ padding: '10px', cursor: 'pointer', backgroundColor: selectedLanguage === language ? '#ddd' : '#fff' }}
            >
              {language}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LanguageDropdown;
    