import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// CSS Styling (optional)
const messageStyle = {
    lineHeight: '2',
   color : '#BDC1C6'
};

// Custom theme overrides for SyntaxHighlighter
const customStyle = {
    ...dark,
    'code[class*="language-"]': {
        ...dark['code[class*="language-"]'],
        background: '#343537', // zinc-like gray background (custom)
        border: 'none', // remove border
        borderRadius: '6px', // rounded corners if desired
        boxShadow: 'none', // remove shadow
        padding: '10px', // padding inside the code block
        color : '#BDC1C6'
    },
    'pre[class*="language-"]': {
        ...dark['pre[class*="language-"]'],
        background: '#343537', // same zinc-like background
        border: 'none', // remove border
        boxShadow: 'none', // remove shadow
color : '#BDC1C6',
        borderRadius: '6px', // optional rounded corners
        padding: '10px', // consistent padding for pre tag as well
    },
};

const MarkdownMessage = ({ text }) => {
    return (
        <div style={messageStyle} className='text-[#BDC1C6]'>
            <ReactMarkdown
                components={{
                    code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                            <SyntaxHighlighter style={customStyle} language={match[1]} PreTag="div" {...props}>
                                {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                        ) : (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    }
                }}
            >
                {text}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownMessage;
