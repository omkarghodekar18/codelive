import React from 'react'
import Client from "../components/Client"
import { useState, useRef, useEffect } from 'react'
import ACTIONS from '../Actions';
import { initSocket } from '../socket';
import { useLocation } from 'react-router-dom'
import { createAvatar } from '@dicebear/core';
import { funEmoji } from '@dicebear/collection';
import { useNavigate, Navigate } from 'react-router-dom';
import '../components/avatar.css';
import toast from 'react-hot-toast';
import InputOutput from '../components/InputOutput';
import Chatbot from '../components/Chatbot';
import Editor from '../components/Editor';
import imageL from '../imageB.png';
import { FaMicrophone } from "react-icons/fa6";
import { IoMdMicOff } from "react-icons/io";


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
    const [mute, setMute] = useState(true);
    const localStreamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

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
                if (userName !== location.state.userName) {
                    toast.success(`${userName} joined the ROOM`);
                    // console.log(`${userName} joined the ROOM`);
                }
                setClient(clients);
            };

            let flg = false;
            socketRef.current.on(ACTIONS.JOINED, ({ clients, userName, socketId }) => {
                if (userName !== location.state?.userName && flg !== true) {
                    toast.success(`${userName} joined the room.`);
                    // console.log(`${userName} joined`);
                    flg = true;
                }
                setClient(clients);
                socketRef.current.emit(ACTIONS.SYNC_CODE, {
                    code: codeRef.current,
                    socketId,
                });
            });

            socketRef.current.on(ACTIONS.DISCONNECTED, ({ clients, userName, socketId }) => {
                setClient(clients || []);
            });

            let lflg = false;
            socketRef.current.on(ACTIONS.LEAVE, ({ userName, socketId, clients }) => {
                setClient(clients || []);
                if (lflg === false) {
                    toast.error(`${userName} left the room.`);
                    lflg = true;
                }
            });

            return () => {
                if (socketRef.current) {
                    socketRef.current.off(ACTIONS.DISCONNECTED);
                    socketRef.current.off(ACTIONS.JOINED, handleJoined);
                    socketRef.current.disconnect();
                }
            };
        };

        init();

    }, [reactNavigator, location.state.roomId, location.state.userName]);

    // useEffect(() => {
    //     const getUserMedia = async () => {
    //         try {
    //             const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    //             localStreamRef.current = stream;

    //             // Emit the audio stream to the server
    //             emitAudioStream(stream);
    //         } catch (error) {
    //             console.error('Error accessing media devices.', error);
    //         }
    //     };

    //     const emitAudioStream = (stream) => {
    //         if (socketRef.current) {
    //             const audioTrack = stream.getAudioTracks()[0]; // Get the audio track

    //             // Convert audio track to Blob
    //             const mediaRecorder = new MediaRecorder(stream);
    //             const audioChunks = [];

    //             mediaRecorder.ondataavailable = (event) => {
    //                 audioChunks.push(event.data);
    //             };

    //             mediaRecorder.onstop = () => {
    //                 const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    //                 const reader = new FileReader();
    //                 reader.onloadend = () => {
    //                     const base64data = reader.result.split(',')[1]; // Get base64 string
    //                     console.log('Emitting audio stream:');
    //                     socketRef.current.emit('audio-stream', {
    //                         roomId: location.state.roomId,
    //                         audio: base64data, // Send base64 audio data
    //                     });
    //                 };
    //                 reader.readAsDataURL(audioBlob);
    //             };

    //             mediaRecorder.start();
    //             setTimeout(() => {
    //                 mediaRecorder.stop(); // Stop after a certain duration (adjust as needed)
    //             }, 3000); // Change the duration as per your requirement
    //         } else {
    //             console.error('Socket is not initialized.');
    //         }
    //     };

    //     // Call getUserMedia to start capturing audio
    //     getUserMedia();

    //     // Set up listener for incoming audio streams
    //     const handleAudioStream = (data) => {
    //             if (data.data.audio) {
    //             console.log('received audio stream')
    //             const byteCharacters = atob(data.data.audio);
    //             const byteNumbers = new Array(byteCharacters.length);
    //             for (let i = 0; i < byteCharacters.length; i++) {
    //                 byteNumbers[i] = byteCharacters.charCodeAt(i);
    //             }
    //             const byteArray = new Uint8Array(byteNumbers);
    //             const audioBlob = new Blob([byteArray], { type: 'audio/wav' });
    //             const audioUrl = URL.createObjectURL(audioBlob);

    //             // Use the Audio object directly
    //             const audio = new Audio(audioUrl);
    //             audio.play().catch((error) => {
    //                 console.error('Error playing audio:', error);
    //             });

    //             // Clean up
    //             audio.onended = () => {
    //                 URL.revokeObjectURL(audioUrl);
    //             };
    //         }
    //     };



    //     if (socketRef.current) {
    //         socketRef.current.on('audio-stream', handleAudioStream);
    //     }

    //     return () => {
    //         if (socketRef.current) {
    //             socketRef.current.off('audio-stream', handleAudioStream);
    //         }
    //     };
    // });

// pushed working
    useEffect(() => {
        // Initialize socket connection
        const getUserMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                localStreamRef.current = stream;

                // Prepare media recorder
                mediaRecorderRef.current = new MediaRecorder(stream);
                mediaRecorderRef.current.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };

                mediaRecorderRef.current.onstop = () => {
                    // console.log('Media recorder stopped'); // Debug check
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });

                    if (audioBlob.size > 0) { // Check if the blob has data
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const base64data = reader.result.split(',')[1]; // Get base64 string

                            // Emit the audio data if socket is connected
                            if (socketRef.current && socketRef.current.connected) {
                                socketRef.current.emit('audio-stream', {
                                    audio: base64data,
                                    roomId: location.state.roomId,
                                });
                                // console.log('Audio data sent to server');
                            } else {
                                console.error('Socket not connected');
                            }
                        };
                        reader.readAsDataURL(audioBlob);
                    } else {
                        console.error('Audio blob is empty');
                    }

                    audioChunksRef.current = []; // Clear audio chunks after sending
                };

            } catch (error) {
                console.error('Error accessing media devices.', error);
            }
        };

        // Call getUserMedia to start capturing audio
        getUserMedia();

        // Set up listener for incoming audio streams

        const handleAudioStream = (data) => {
            // console.log(data)

            if (data.data.audio) {
                // console.log('Received audio stream');
                const byteCharacters = atob(data.data.audio);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const audioBlob = new Blob([byteArray], { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);

                // Use the Audio object directly
                const audio = new Audio(audioUrl);
                audio.play().catch((error) => {
                    console.error('Error playing audio:', error);
                });

                // Clean up
                audio.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                };
            }
        };

        // Set up socket listener
        if (socketRef.current) {
            socketRef.current.on('audio-stream', handleAudioStream);
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.off('audio-stream', handleAudioStream);
                // socketRef.current.disconnect();
            }
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop()); // Stop audio tracks on cleanup
            }
        };
    }, [socketRef.current]);

    const startRecording = () => {

        setMute(prev => !prev);
        // console.log(mute);

        if (mediaRecorderRef.current && localStreamRef.current) {
            audioChunksRef.current = []; // Reset chunks before starting
            mediaRecorderRef.current.start(); // Start recording
            // console.log('Recording started');
        }
    };


    const stopRecording = () => {

        setMute(prev => !prev);
        // console.log(mute);

        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop(); // Stop recording
            // console.log('Recording stopped');
        }
    };


    // testingg
    
    // useEffect(() => {
    //     const startVoiceStream = async () => {
    //         try {
    //             const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    //             localStreamRef.current = stream;
    
    //             // Set up media recorder to continuously record
    //             mediaRecorderRef.current = new MediaRecorder(stream);
    //             mediaRecorderRef.current.ondataavailable = (event) => {
    //                 if (event.data.size > 0) {
    //                     const reader = new FileReader();
    //                     reader.onloadend = () => {
    //                         const base64data = reader.result.split(',')[1];
    
    //                         // Emit each audio chunk to the server in real-time
    //                         if (socketRef.current && socketRef.current.connected) {

    //                             socketRef.current.emit('audio-stream', {
    //                                 audio: base64data,
    //                                 roomId: location.state.roomId,
    //                             });
    //                             console.log('Streaming audio chunk to server');
    //                         }
    //                     };
    //                     reader.readAsDataURL(event.data);
    //                 }
    //             };
    
    //         } catch (error) {
    //             console.error('Error accessing media devices.', error);
    //         }
    //     };

    //     startVoiceStream()
    
    //     const handleAudioStream = (data) => {
    //         if (data.data.audio) {
    //             try {
    //                 // Decode the base64 audio data
    //                 const byteCharacters = atob(data.data.audio);
    //                 const byteNumbers = new Array(byteCharacters.length);
    //                 for (let i = 0; i < byteCharacters.length; i++) {
    //                     byteNumbers[i] = byteCharacters.charCodeAt(i);
    //                 }
    //                 const byteArray = new Uint8Array(byteNumbers);
                    
    //                 // Create a Blob from the byteArray with a supported audio type
    //                 const audioBlob = new Blob([byteArray], { type: 'audio/mpeg' }); // Use 'audio/mp3' if necessary
                    
    //                 // Generate an object URL for the audio data
    //                 const audioUrl = URL.createObjectURL(audioBlob);
                    
    //                 // Create an Audio object
    //                 const audio = new Audio(audioUrl);
                    
    //                 // Play the audio with error handling
    //                 audio.play().then(() => {
    //                     console.log('Audio playing successfully.');
    //                 }).catch((error) => {
    //                     console.error('Error playing audio:', error.message, error.name);
    //                 });
                    
    //                 // Clean up the URL after the audio has finished playing
    //                 audio.onended = () => {
    //                     URL.revokeObjectURL(audioUrl);
    //                     console.log('Audio playback ended and URL revoked.');
    //                 };
    //             } catch (error) {
    //                 console.error('Error processing audio stream:', error.message);
    //             }
    //         } else {
    //             console.error('No audio data received.');
    //         }
    //     };
        
    
    //     if (socketRef.current) {
    //         socketRef.current.on('audio-stream', handleAudioStream);
    //     }
    
    //     return () => {
    //         if (socketRef.current) {
    //             socketRef.current.off('audio-stream', handleAudioStream);
    //         }
    //         if (mediaRecorderRef.current) {
    //             mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    //         }
    //     };
    // }, [socketRef.current]);
    
    // const startRecording = () => {
    //     setMute(prev => !prev);

    //     if (mediaRecorderRef.current && localStreamRef.current) {
    //         console.log('text')
    //         audioChunksRef.current = [];
    //         mediaRecorderRef.current.start(1000); // Start recording with 100ms interval for data chunks
    //         console.log('Voice call started');
    //     }
    // };
    
    // const stopRecording = () => {
    //     setMute(prev => !prev);
    //     if (mediaRecorderRef.current) {
    //         mediaRecorderRef.current.stop(); // Stop recording
    //         mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop()); // Stop media stream
    //         console.log('Voice call ended');
    //     }
    // };
    


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

    function chatHandler(event) {
        event.preventDefault();
        setBotOn(!botOn);
    }

    const toggleRecording = (event) => {
        event.preventDefault();
        if (!mute) {
            stopRecording();
        } else {
            startRecording();
        }
    };


    return (

        <div className='min-h-screen w-screen '>
            {/* nav  */}
            <div className='w-screen h-[60px] bg-[#161616] flex justify-between items-center border-b-[1px] border-black'>

                <img src={imageL} className='h-[100%]' />
                <div className='flex justify-evenly'>
                    
                    <button onClick={chatHandler} className='text-white bg-zinc-600 py-2 px-3 rounded-md mx-2'>Chat with AI</button>
                    {
                        botOn ? (<Chatbot color="#cecece" setBotOn={setBotOn} codeRef={codeRef} />) : (<div />)
                    }
                    <button className='bg-white py-1 text-base rounded-lg font-medium focus:outline-none px-4' onClick={handleCopy}>Copy ROOM ID</button>
                    <button className='bg-green-500 text-green-950  text-base font-medium hover:bg-green-700 rounded-lg py-1 px-8 mr-2 mx-2' onClick={handleLeave}>Leave</button>
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



                    <div className='absolute  bottom-0  w-full flex-col p-7 flex gap-2 items-center justify-center '>
                        <button className='text-xl overflow-hidden' onClick={toggleRecording}>
                        {
                            !mute? <FaMicrophone className='bg-[#d9d9d9] w-full h-full text-black p-5 rounded-full  ' /> : <IoMdMicOff className='bg-[#323439] w-full h-full text-[#d9d9d9] p-5 rounded-full ' />
                        }
                        </button>
                        <div className='text-[#d9d9d9] text-sm h-[20px] w-full text-center tracking-normal'>{ !mute? 'Recording...': ''}</div>
                    </div>

                    {/* <VoiceChatComponent socketRef={socketRef} roomId={location.state.roomId} /> */}
                    {/* <button className="text-white px-2 py-1 bg-blue-500 w-full rounded-sm" onClick={handleMuteUnmute}>
                            {mute ? 'Unmute' : 'Mute'}
                        </button> */}
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