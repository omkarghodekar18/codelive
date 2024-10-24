import React, { useEffect, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material-darker.css';
// import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/clike/clike';
import 'codemirror/addon/edit/closetag';
import ACTIONS from '../Actions';
import 'codemirror/addon/edit/closebrackets';
import './avatar.css'; // Import your CSS file for styles

function Editor({ socketRef, roomId, onCodeChange }) {
  const editorRef = useRef(null);
  const codeMirrorRef = useRef(null); // Reference to the CodeMirror instance

  useEffect(() => {
    if (editorRef.current) {
      // Initialize CodeMirror only once
      codeMirrorRef.current = Codemirror.fromTextArea(editorRef.current, {
        // mode: { name: 'javascript', json: true },
        mode: { name: 'clike' },
        theme: 'material-darker',
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      });

      // Ensure CodeMirror takes full screen
      codeMirrorRef.current.setSize("100%", "100%");

    }

    codeMirrorRef.current.on('change', (instance, changes) => {
      const { origin } = changes;
      const code = instance.getValue();
      onCodeChange(code); // Update the code in the parent component
      if (origin !== 'setValue' && code !== undefined && code !== null) {
        socketRef.current.emit(ACTIONS.CODE_CHANGE, {
          roomId,
          code,
        })
       
      }
    })
    return () => {
      
      if (codeMirrorRef.current) {
        codeMirrorRef.current.toTextArea(); // Convert back to textarea on unmount
        codeMirrorRef.current = null; // Clear the reference
      }
    };
  }, []);


  useEffect( ()=> {
    if(socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          codeMirrorRef.current.setValue(code);
          setTimeout(() => {
            const totalLines = codeMirrorRef.current.lineCount();
            codeMirrorRef.current.setCursor(totalLines, codeMirrorRef.current.getLine(totalLines - 1).length);
          }, 0); // Adjust delay if necessary
        }
      });
    }
    return () => {
      if(socketRef.current) {
        socketRef.current.off(ACTIONS.CODE_CHANGE);
      }
    }
  },[socketRef.current]);

  return (
    <textarea ref={editorRef} id="realTimeEditor" className="realTimeEditor" />
  );
}

export default Editor;
