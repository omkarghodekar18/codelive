import React, { useState } from 'react'
import { FaRegPaste } from "react-icons/fa6";
import { IoMdSend } from "react-icons/io";
import axios from 'axios';
import { SyncLoader } from 'react-spinners';
import { RxCross2 } from "react-icons/rx";
import './chat.css'
import PrettifyText from './PreetifyText';
import {
    useMutation,
} from 'react-query'



function Chatbot({ setBotOn, codeRef }) {
    const [isFocused, setIsFocused] = useState(false);
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [conversation, setConversations] = useState([{ role: 'assistant', content: 'Hello! How can I assist you today' },]);

    const sendMessageAPI = async () => {
        const res = await axios.post(`http://localhost:5000/ask`, {
            userMessage: message,
        });
        console.log(res.data);
        return(res.data);
    }

    const mutation = useMutation({
        mutationFn: sendMessageAPI,
        mutationKey: ['chatbot'],
        onSuccess: (data) => {
            setIsTyping(false);
            setConversations((prevConversation) => [...prevConversation, { role: 'assistant', content: data }])
        },
    });

    const handleSubmit = () => {
        const currentMessage = message.trim();
        if (!currentMessage) {
            alert('Please enter a message');
            return;
        }
        setConversations((prevConversation) => [...prevConversation, { role: 'user', content: currentMessage }])
        setIsTyping(true);
        mutation.mutate(currentMessage);
        setMessage('');
    }


    return (
        // mr-[60%] mt-[50px]
        <div className='absolute bottom-0 right-0 mr-[20px] mb-[20px] text-black bg-[#131314] h-[600px] w-[700px] z-30 rounded-2xl'>

            <div className='rounded-t-2xl h-[30px] bg-[#0a0b0b] w-full flex items-center justify-between p-3 px-5 text-zinc-500 '>
                <h5 className='pl-5'>Chat with AI</h5>
                <button onClick={() => setBotOn(false)} >
                    <RxCross2 />
                </button>
            </div>
            <div className='chat-container h-[79%] w-full text-white overflow-y-scroll rounded px-7'>
                {
                    conversation.map((entry, index) => (
                        <div className={`message ${entry.role} text-white flex`} key={index}>
                            {/* <strong className=''>
                                {entry.role === 'user' ? '' : 'AI'} <br />
                            </strong> */}
                            {
                                // entry.role !== 'user' ? (<div className='text-white'>AI</div>) : (<div></div>) 
                            }
                            {entry.content} 
                        </div>
                    ))
                }
                {
                    isTyping && (
                        <div className='message assistant'>
                            <SyncLoader color="#2F2F2F"  size={10}/>
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
                        <button className='p-1 hover:text-white' onClick={ ()=>{
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