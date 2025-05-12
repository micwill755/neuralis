import React, { useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import './Notebook.css';

// Function to clean ANSI color codes from output
const cleanAnsiCodes = (text) => {
  if (!text) return '';
  // Remove ANSI color codes and other terminal formatting
  try {
    return text.replace(/\x1b\[\d+(;\d+)*m/g, '')  // Standard ANSI escape
             .replace(/\[\d+(;\d+)*m/g, '')       // ANSI without escape char
             .replace(/\\u001b\[\d+(;\d+)*m/g, '') // Escaped unicode
             .replace(/\\033\[\d+(;\d+)*m/g, '');  // Octal escaped
  } catch (e) {
    console.error('Error cleaning ANSI codes:', e);
    return text; // Return original text if regex fails
  }
};

const Cell = ({ id, type, content, isActive, onChange, onFocus, output, onRunCell }) => {
  const editorRef = useRef(null);
  
  const handleEditorChange = (value) => {
    onChange(id, value);
  };
  
  // Clean output text from ANSI codes
  const cleanedOutput = output?.output ? cleanAnsiCodes(output.output) : '';
  
  // Handle keyboard shortcuts
  const handleKeyDown = (event) => {
    // Check for Shift+Enter to run cell
    if (event.key === 'Enter' && event.shiftKey && type === 'code') {
      event.preventDefault();
      onRunCell && onRunCell(id);
    }
  };
  
  // Function to handle editor mounting
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Adjust editor height based on content
    const updateEditorHeight = () => {
      const lineCount = editor.getModel().getLineCount();
      const lineHeight = 19; // Default line height in pixels
      const minHeight = 100; // Minimum height
      const paddingHeight = 10; // Additional padding
      
      // Calculate height based on content (number of lines)
      const contentHeight = Math.max(minHeight, lineCount * lineHeight + paddingHeight);
      
      // Set the container height
      const container = editor.getDomNode().parentElement;
      if (container) {
        container.style.height = `${contentHeight}px`;
      }
      
      // Force editor to update layout
      editor.layout();
    };
    
    // Update height initially
    updateEditorHeight();
    
    // Update height when content changes
    editor.onDidChangeModelContent(() => {
      updateEditorHeight();
    });
  };
  
  return (
    <div 
      className={`cell-container ${isActive ? 'active' : ''}`} 
      onClick={() => onFocus(id)}
      onKeyDown={handleKeyDown}
    >
      <div className="cell-prompt-area">
        <div className={`cell-prompt ${type === 'markdown' ? 'markdown' : ''}`}>
          {type === 'code' ? 
            (output?.executionCount ? `[${output.executionCount}]:` : 'In [ ]:') : 
            ''}
        </div>
        <div className={`cell-content-area ${isActive ? 'active' : ''}`}>
          <div className="cell-content">
            {type === 'code' ? (
              <MonacoEditor
                height="100px"
                language="python"
                value={content}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: 'off',
                  glyphMargin: false,
                  folding: true,
                  lineDecorationsWidth: 0,
                  lineNumbersMinChars: 0,
                  automaticLayout: true,
                  scrollbar: {
                    vertical: 'auto',
                    horizontal: 'auto'
                  }
                }}
              />
            ) : (
              isActive ? (
                <MonacoEditor
                  height="100px"
                  language="markdown"
                  value={content}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    lineNumbers: 'off',
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 0,
                    lineNumbersMinChars: 0,
                    automaticLayout: true,
                    scrollbar: {
                      vertical: 'auto',
                      horizontal: 'auto'
                    }
                  }}
                />
              ) : (
                <div className="markdown-content">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              )
            )}
          </div>
        </div>
      </div>
      
      {/* Display cell output if available */}
      {type === 'code' && output && (
        <div className={`cell-output ${output.status === 'error' ? 'error' : ''}`}>
          {cleanedOutput}
          
          {/* Display image if available */}
          {output.imageData && (
            <img 
              className="output-image"
              src={`data:${output.imageData.type};base64,${output.imageData.data}`} 
              alt="Output visualization" 
            />
          )}
          
          {/* Display HTML content if available */}
          {output.contentType === 'html' && (
            <div 
              className="html-output"
              dangerouslySetInnerHTML={{ __html: cleanedOutput }} 
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Cell;
