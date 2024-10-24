import React from 'react'
import Client from "../components/Client"
import Chatbot from '../components/Chatbot';
import { useState, useRef, useEffect } from 'react'
import ACTIONS from '../Actions';
import { initSocket } from '../socket';
import { json, useLocation } from 'react-router-dom'
import { createAvatar } from '@dicebear/core';
import { funEmoji } from '@dicebear/collection';
import { useNavigate, Navigate } from 'react-router-dom';
import '../components/avatar.css';
import toast from 'react-hot-toast';
import InputOutput from '../components/InputOutput';
import Editor from '../components/Editor';
import imageL from '../imageB.png';

const names = ["Wyatt", "Alexander", "Emery", "Easton", "Luis", "Andrea", "Sawyer", "Mason", "Chase", "Maria", "Leo", "Aiden", "Vivian", "Kingston", "Liliana", "Caleb", "Sarah", "Eliza", "Eden", "Christian"];
let visited = new Set();


function create() {
    if (visited.size === names.length) {
        // Reset the visited set if all names are used
        visited.clear();
    }

    let uniqueIndex;

    // Find an index that hasn't been visited yet
    do {
        uniqueIndex = Math.floor(Math.random() * names.length);
    } while (visited.has(uniqueIndex));

    // Mark the selected name as visited
    visited.add(uniqueIndex);

    const s = createAvatar(funEmoji, {
        radius: 10,
        seed: names[uniqueIndex],
        backgroundType: ["solid"],
        mouth: ["cute", "lilSmile", "smileTeeth", "smileLol", "wideSmile"],
        eyes: ["glasses"],
    });

    const svg = s.toString();
    const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    return svgDataUrl;
}



function EditorPage() {
    const socketRef = useRef(null);
    const location = useLocation(null);
    const codeRef = useRef(null);
    const reactNavigator = useNavigate(null);
    const [clients, setClient] = useState([])
    const [botOn, setBotOn] = useState(false);
    const [mute, setMute] = useState(false);

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();

            // Error handling for connection issues
            socketRef.current.on('connect-error', handleErrors);
            socketRef.current.on('connect-failed', handleErrors);

            function handleErrors(err) {
                console.error('Socket error:', err);
                toast.error('Socket connection failed, try again later');
                reactNavigator('/');
            }


            // Emit JOIN event to the server with roomId and userName
            socketRef.current.emit(ACTIONS.JOIN, {
                roomId: location.state.roomId,
                userName: location.state.userName,
            });


            // Listener for the JOINED event
            const handleJoined = ({ clients, userName, socketId }) => {
                // Display the toast only for other users joining
                if (userName !== location.state.userName) {
                    toast.success(`${userName} joined the ROOM`);
                    console.log(`${userName} joined the ROOM`);
                }
                setClient(clients);
            };

            // Add listener for the JOINED action
            let flg = false;
            socketRef.current.on(
                ACTIONS.JOINED,
                ({ clients, userName, socketId }) => {
                    if (userName !== location.state?.userName && flg !== true) {
                        toast.success(`${userName} joined the room.`);
                        console.log(`${userName} joined`);
                        flg = true;
                    }
                    setClient(clients);
                    socketRef.current.emit(ACTIONS.SYNC_CODE, {
                        code: codeRef.current,
                        socketId,
                    });
                }
            );

            // socketRef.current.emit(ACTIONS.SYNC_CODE, {});

            socketRef.current.on(ACTIONS.DISCONNECTED, ({ clients, userName, socketId }) => {
                setClient(clients || []);// Update state with the new clients list
            });
            let lflg = false;
            socketRef.current.on(ACTIONS.LEAVE, ({ userName, socketId, clients }) => {
                setClient(clients || []); // Update state with the new clients list
                if (lflg === false) {
                    toast.error(`${userName} left the room.`);
                    lflg = true;
                }
            });
            // Cleanup function to remove the listener and disconnect socket
            return () => {
                if (socketRef.current) {
                    socketRef.current.off(ACTIONS.DISCONNECTED);
                    socketRef.current.off(ACTIONS.JOINED, handleJoined); // Remove specific listener
                    socketRef.current.disconnect(); // Disconnect socket to avoid memory leaks
                }
            };
        };

        init();
    }, [reactNavigator, location.state.roomId, location.state.userName]);


    if (!location.state) {
        return <Navigate to='/' />
    }

    function handleCopy() {
        navigator.clipboard.writeText(location.state.roomId);
        toast.success('Room ID copied to clipboard');
    }

    function handleLeave() {
        reactNavigator('/')
        window.location.reload();
    }

    function chatHandler() {
        setBotOn(!botOn);
    }


    return (

        <div className='min-h-screen w-screen '>
            {/* nav  */}
            <div className='w-screen h-[60px] bg-[#161616] flex justify-between items-center border-b-[1px] border-black'>

                <img src={imageL} className='h-[100%]' />
                <div className='flex justify-evenly'>
                    <button onClick={chatHandler} className='text-white bg-zinc-600 mr-4 py-2 px-3'>Chat with AI</button>
                    {
                        botOn ? (<Chatbot color="#cecece" setBotOn={setBotOn} codeRef={codeRef} />) : (<div />)
                    }
                    <button className='bg-white py-1 text-base rounded-lg font-medium focus:outline-none px-4 mr-2' onClick={handleCopy}>Copy ROOM ID</button>
                    <button className='bg-green-500 text-green-950  text-base font-medium hover:bg-green-700 rounded-lg py-1 px-8 mr-2' onClick={handleLeave}>Leave</button>
                </div>

            </div>

            <div className='w-screen h-[calc(100vh-60px)] flex bg-black'>
                <div className='leftAside flex flex-col w-[150px] h-[100%] gap-2 bg-[#181919] relative border-r-[1px] border-black'>

                    <h3 className="text-white text-md text-center ">Connected</h3>

                    <div className='clientList flex flex-shrink-0 flex-wrap item-start'>
                        {
                            clients.map(client => {
                                const avatar = create();
                                return <Client key={client.socketId} userName={client.userName} avatar={avatar} />
                            })
                        }
                    </div>

                    <div className='overflow-hidden absolute w-full bottom-0 p-5'>
                        <button className="text-white px-2 py-1 bg-blue-500 w-full rounded-sm">
                            Mute
                        </button>
                    </div>

                </div>

                <div className='w-[calc(65vw-150px)] h-[100%] flex-grow'>
                    <Editor socketRef={socketRef} roomId={location.state.roomId} onCodeChange={(code) => { codeRef.current = code }} />
                </div>
                {/* input output  */}
                <InputOutput socketRef={socketRef} codeRef={codeRef} roomId={location.state.roomId} />
            </div>
        </div>
    )
}

export default EditorPage