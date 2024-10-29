import React, { useState, useEffect, useRef } from 'react'
import { FaRegPaste } from "react-icons/fa6";
import { IoMdSend } from "react-icons/io";
import axios from 'axios';
import { SyncLoader } from 'react-spinners';
import { RxCross2 } from "react-icons/rx";
import './chat.css'
import MarkdownMessage from './MarkdownMessage';
import logo from './file.png'
import {
    useMutation,
} from 'react-query'


function Chatbot({ setBotOn, codeRef }) {
    const [isFocused, setIsFocused] = useState(false);
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatContainerRef = useRef(null);

    const [conversation, setConversations] = useState([{ role: 'model', parts: [{ text: 'Hello! How can I assist you today' }] },]);
    useEffect(() => {
        // Scroll to the bottom whenever a new message is added
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [conversation, isTyping]); // Update when conversation or isTyping changes

    const sendMessageAPI = async () => {
        const res = await axios.post(process.env.REACT_APP_GEMINI, {
            userMessage: message,
            history: conversation,
        });
        // console.log(res.data);
        return (res.data);
    }

    const mutation = useMutation({
        mutationFn: sendMessageAPI,
        mutationKey: ['chatbot'],
        onSuccess: (data) => {
            console.log(data);
            setIsTyping(false);
            setConversations((prevConversation) => [...prevConversation, { role: 'model', parts: [{ text: data }] }])
        },
    });

    const handleSubmit = () => {
        const currentMessage = message.trim();

        if (!currentMessage) {
            alert('Please enter a message');
            return;
        }
        setConversations((prevConversation) => [...prevConversation, { role: 'user', parts: [{ text: message }] }])
        setIsTyping(true);
        mutation.mutate(currentMessage);
        setMessage('');
    }


    return (
        // mr-[60%] mt-[50px]
        <div className='absolute bottom-0 right-0 mr-[20px] mb-[20px] text-black bg-[#131314] h-[600px] w-[700px] z-30 rounded-2xl'>

            <div className='rounded-t-2xl h-[30px] bg-[#0a0b0b] w-full flex items-center justify-between p-5 px-5 text-zinc-500 '>
                <h5 className='pl-5'>Chat with AI</h5>
                <button onClick={() => setBotOn(false)} >
                    <RxCross2 />
                </button>
            </div>
            <div className='chat-container h-[79%] w-full text-white overflow-y-scroll rounded px-7 pt-[60%]' ref={chatContainerRef}>
                {
                    conversation.map((entry, index) => (
                        <div className={`message ${entry.role} text-white flex`} key={index}>
                            {console.log(entry.role)}
                            <div className='flex'>
                                {
                                    entry.role === 'model' ?
                                        (
                                            <img src='https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg' alt="AI Logo" className="w-7 h-7 mr-2" />
                                        )
                                        :
                                        (<div></div>)
                                }

                                <div>
                                <MarkdownMessage text={entry.parts[0].text} />
                                    {/* {entry.parts[0].text} */}
                                </div>
                            </div>
                        </div>
                    ))
                }
                {
                    isTyping && (
                        <div className='message assistant'>
                            <SyncLoader color="#2F2F2F" size={10} />
                        </div>
                    )
                }
            </div>

            <div className='py-5 px-7'>
                <div className={`px-5 flex justify-between items-center w-full bg-[#1E1F20] text-[#BDC1C6] ${isFocused ? 'bg-[#292a2d]' : 'bg-[#1E1F20]'}  rounded-full`}>

                    <input type='text' className='bg-transparent text w-full p-3 rounded-full focus:bg-[#292a2d] focus:outline-none' value={message} placeholder='Ask question'
                        onChange={(e) => setMessage(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)} />
                    <div className='flex gap-3 items-center justify-between text-xl'>
                        <button className='p-1 hover:text-white' onClick={() => {
                            setMessage(codeRef.current);
                        }}>
                            <FaRegPaste />
                        </button>
                        <button onClick={handleSubmit} className='p-1 hover:text-white'>
                            <IoMdSend />
                        </button>

                    </div>
                </div>
            </div>

        </div>
    )
}

export default Chatbot