import React from 'react'
import logo from "../logo.png"
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';


function Home() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');

  function createNewRoom(event) {
    event.preventDefault()
    const roomId = uuidv4().substring(0,4);
    setRoomId(roomId);
    console.log(roomId);
    toast.success('Room created successfully!');
  }

  const handleEnter = (event) => {
    if (event.key === 'Enter') {
      joinRoom();
    }
  }

  function joinRoom() {
    if (!roomId || !userName) {
      toast.error('Please enter room ID and username!');
      return;
    }

    
    navigate(`/editor/${roomId}`, {
      state: {
        userName,
        roomId,
      },
    });
  }

  return (
    <div className='homePageWrapper flex justify-center items-center w-screen h-screen bg-[rgb(10,21,35)]'>
      <div className='formWrapper bg-[#1e2d40] h-[400px] w-[500px] flex flex-col justify-between rounded-xl'>

        <div className="flex p-4">
          <img src={logo} alt="code-sync-logo" className='w-[80px]' />
          <div className='bg-white w-[1.5px] h-full mr-3'></div>

          <div className='text-white flex flex-col justify-between'>
            <h2 className='text-4xl font-medium'>CodeLive</h2>
            <h5 className='text-md text-green-400'>Realtime Editor & Compiler</h5>
          </div>
        </div>

        <div className='flex flex-col gap-6 p-7 items-center justify-center'>

          <input
            type="text"
            className="p-2 w-full text-xl focus:outline-none pl-3 rounded-lg font-medium"
            value={roomId}
            onChange={(e) => {
              setRoomId(e.target.value)
            }}
            placeholder='ROOM ID' />

          <input type="text"
            onKeyUp={handleEnter}
            className="p-2 w-full text-xl rounded-lg pl-3 font-medium focus:outline-none" placeholder='USERNAME' onChange={(e) => {
              setUserName(e.target.value)
            }} />

          <button className='bg-green-500 border-green-800 text-green-950  text-xl font-bold px-10 hover:bg-green-700 py-1 right-0 rounded-full p-1 ' onClick={joinRoom}>Join</button>
          <h4 className='text-md text-white font-normal'>If you don't have an invite then create <button className='text-green-500 underline p-1 hover:text-green-700 ' onClick={createNewRoom}>new room</button> </h4>
        </div>

      </div>
    </div>
  )
}

export default Home