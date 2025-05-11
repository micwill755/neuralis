import React from 'react';
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

const Cell = ({ id, type, content, isActive, onChange, onFocus, output }) => {
  const handleEditorChange = (value) => {
    onChange(id, value);
  };
  
  // Clean output text from ANSI codes
  const cleanedOutput = output?.output ? cleanAnsiCodes(output.output) : '';
  
  return (
    <div className={`cell-container ${isActive ? 'active' : ''}`} onClick={() => onFocus(id)}>
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
                height="auto"
                language="python"
                value={content}
                onChange={handleEditorChange}
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
                    vertical: 'hidden',
                    horizontal: 'auto'
                  }
                }}
              />
            ) : (
              isActive ? (
                <MonacoEditor
                  height="auto"
                  language="markdown"
                  value={content}
                  onChange={handleEditorChange}
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
                      vertical: 'hidden',
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
        </div>
      )}
    </div>
  );
};

export default Cell;
