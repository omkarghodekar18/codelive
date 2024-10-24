import React from 'react';

const PrettifyText = ({ text }) => {
  // Helper function to prettify single-line code
  const prettifyCode = (inputText) => {
    // Replace specific symbols and keywords with new lines and formatting
    return inputText
      .replace(/#include/g, '\n#include')                  // New line before #include
      .replace(/</g, '\n<')                                // New line before <
      .replace(/>/g, '>\n')                                // New line after >
      .replace(/int main/g, '\nint main')                  // New line before main function
      .replace(/{/g, '\n{')                                // New line before opening bracket
      .replace(/}/g, '\n}')                                // New line after closing bracket
      .replace(/std::cout/g, '\nstd::cout')                // New line before std::cout
      .replace(/<< /g, '\n<< ')                            // New line before <<
      .replace(/"([^"]*)"/g, '\n"$1"\n')                   // New line for each string literal
      .replace(/std::endl/g, '\nstd::endl')                // New line before std::endl
      .replace(/return/g, '\nreturn')                      // New line before return
      .replace(/;/g, ';\n');                               // New line after ;
  };

  // Apply prettification to the input text
  const prettifiedText = prettifyCode(text);

  // Split the prettified text by new lines and render each line
  const lines = prettifiedText.split('\n').map((line, index) => {
    if (line.trim().startsWith('std::')) {
      return <code key={index} className="bg-gray-100 text-red-500 px-2 py-1 rounded-md block">{line}</code>;
    } else if (line.trim().startsWith('#include')) {
      return <code key={index} className="text-blue-500 block">{line}</code>;
    } else if (line.trim() === '{' || line.trim() === '}') {
      return <code key={index} className="font-bold text-gray-700 block">{line}</code>;
    } else if (line.trim().startsWith('return')) {
      return <code key={index} className="text-green-600 block">{line}</code>;
    } else if (line.trim().length === 0) {
      return <br key={index} />;  // Keep line breaks
    } else {
      return <div key={index}>{line}</div>;  // Regular text
    }
  });

  return <div className="font-sans leading-relaxed">{lines}</div>;
};

export default PrettifyText;
