import React, { useEffect } from 'react'
import { useState } from 'react';
import { MoonLoader } from 'react-spinners';
function InputOutput({ socketRef, roomId, codeRef }) {
  const [outputText, setOutputText] = useState('');
  const [text, setText] = useState('');
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on('textUpdated', ({ newText, roomId }) => {
        // console.log('Client received update:', newText, 'for room:', roomId);
        setText(newText);
      });

      if (socketRef.current) {
        socketRef.current.on('outputUpdated', ({ ans, roomId }) => {
          // console.log('Client received outputUpdated for room:', roomId, 'with output:', ans);
          setOutputText(ans);
        });
      }
    }
  }, [socketRef.current])

  // async function sendPost(code) {
  //   // if(roomId && code && socketRef.current) {
  //     const data = {
  //       socketId: socketRef.current ? socketRef.current.id : null, // Only send necessary serializable properties
  //       roomId,
  //       code
  //     };
  //     try {
  //       const response = await fetch('http://localhost:5000/submit', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify(data), // Send serializable data
  //       });

  //     } catch (err) {
  //       console.error(err);
  //     }
  //   // }
  // }
  async function compileHandler() {

    setLoader(true);
    
    // 93 js   100 py   91 java   54 c++
    const code = codeRef.current;
    const input = text;
    const url = 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=false&fields=*';
    const options = {
      method: 'POST',
      headers: {
        'x-rapidapi-key': '68e03894e1msh945193b6a44ca21p1b0d52jsn458ce2e48191',
        'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        language_id: 54,
        source_code: btoa(code),
        stdin: btoa(input)
      })
    };

    try {

      const response = await fetch(url, options);
      const result = await response.json();
      const tokenId = result.token;

      var statusCode = 2;
      var getR;

      const checkStatus = async () => {
        try {
          getR = await getSubmission(tokenId);
          statusCode = getR.status_id; // Assuming the status code comes from getR, not result

          // If statusCode is still 2 or 0, keep checking every 2 seconds
          if (statusCode === 2 || statusCode === 0) {
            setTimeout(checkStatus, 2000); // Recursive call with a delay
          }
          else {
            // Process the result when status code changes
            const output = getR.stdout;
            if (output === null) {
              let status = getR.status.description;
              let compOutput = atob(getR.compile_output);
              let ans = status + "\n" + compOutput;
              setOutputText(ans);
              // console.log(ans);
              if (socketRef.current) {
                socketRef.current.emit('outputUpdate', { ans, roomId });
              }
              setLoader(false);
            }
            else {
              let ans = atob(output);
              setOutputText(ans);

              if (socketRef.current) {
                socketRef.current.emit('outputUpdate', { ans, roomId });
              }
              setLoader(false);
            }

            return;

          }
        } catch (error) {
          // console.error(error);
        }
      };

      setTimeout(checkStatus, 1000);
    }
    catch (error) {
      // console.error("error at compile : " + error);
    }

    // sendPost(code);
  }

  async function getSubmission(tokenId) {

    const url = `https://judge0-ce.p.rapidapi.com/submissions/${tokenId}?base64_encoded=true&fields=*`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '68e03894e1msh945193b6a44ca21p1b0d52jsn458ce2e48191',
        'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      return result;

    } catch (error) {
      console.error("error at getsubmission : " + error);
    }

  }

  const handleChange = (event) => {
    event.preventDefault();
    const newText = event.target.value;

    setText(newText);
    console.log("change handler");
    if (socketRef.current) socketRef.current.emit('textUpdate', { newText, roomId }); // Emit the change to the server

  };

  return (
    <div className='w-[35vw] bg-[#161616] flex flex-col justify-between items-center overflow-hidden border-[#161616] border-l-[2px]'>
      <div className='flex justify-between items-center h-[60px] top-0 absolute left-1/2 transform -translate-x-1/2'>
        <button className='bg-[#2F8D46] text-white p-1 px-6 text-lg font-normal rounded-lg' onClick={compileHandler}>
          Compile & Run
        </button>
      </div>
      <div className='input bg-white h-[50%] w-full flex flex-col relative'>
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
          {
            loader ? (<MoonLoader color="#cecece" />) : (<div />)
          }
        </div>
        
        <div className='bg-[#181919] flex justify-between items-end'>
        <h4 className='font-semibold text-2xl h-[50px]  p-2 text-white' >Input:</h4>
        <h1 className='text-green-600 p-2'>Enter the Inputs first according to program</h1>
        </div>

        <textarea className='w-full resize-none p-2 border-none outline-none focus:outline-none text-white bg-[#222222] h-[calc(100%-50px)] text-lg' placeholder='' value={text} onChange={handleChange} />
      </div>
      <div className='input bg-white h-[50%] w-[100%] overflow-hidden'>
        <h4 className='font-semibold text-2xl h-[50px] bg-[#181919] p-2 text-white'>Output:</h4>
        <textarea className='w-[100%] resize-none p-2 whitespace-pre-wrap border-none outline-none focus:outline-none text-white bg-[#222222] h-[calc(100%-50px)] text-lg' value={outputText} disabled>
        </textarea>
      </div>
    </div>
  )
}

export default InputOutput