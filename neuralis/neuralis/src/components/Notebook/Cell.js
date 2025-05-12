import React, { useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';

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

const Cell = ({ 
  id, 
  type, 
  content, 
  isActive, 
  isRunning,
  onChange, 
  onFocus, 
  output, 
  onDelete,
  onMoveUp,
  onMoveDown,
  onRun
}) => {
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
      onRun && onRun();
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
        container.style.overflow = 'visible';
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
      className={`jp-cell ${isActive ? 'jp-mod-active' : ''} ${isRunning ? 'jp-mod-running' : ''}`}
      onClick={() => onFocus(id)}
      onKeyDown={handleKeyDown}
    >
      <div className={`jp-cell-prompt ${type === 'markdown' ? 'jp-mod-markdown' : ''}`}>
        {type === 'code' ? 
          (output?.executionCount ? `[${output.executionCount}]:` : 'In [ ]:') : 
          ''}
      </div>
      
      <div className="jp-cell-input">
        <div className="jp-cell-editor" style={{ minHeight: '24px', height: 'auto', overflow: 'visible' }}>
          {type === 'code' ? (
            <MonacoEditor
              height="auto"
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
                wordWrap: 'on',
                scrollbar: {
                  vertical: 'auto',
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
              <div className="jp-markdown-rendered">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            )
          )}
        </div>
      </div>
      
      {/* Cell toolbar */}
      <div className="jp-cell-toolbar">
        <button 
          className="jp-cell-toolbar-button" 
          onClick={(e) => { e.stopPropagation(); onRun && onRun(); }}
          title="Run Cell"
        >
          ▶
        </button>
        <button 
          className="jp-cell-toolbar-button" 
          onClick={(e) => { e.stopPropagation(); onMoveUp && onMoveUp(); }}
          title="Move Up"
        >
          ↑
        </button>
        <button 
          className="jp-cell-toolbar-button" 
          onClick={(e) => { e.stopPropagation(); onMoveDown && onMoveDown(); }}
          title="Move Down"
        >
          ↓
        </button>
        <button 
          className="jp-cell-toolbar-button" 
          onClick={(e) => { e.stopPropagation(); onDelete && onDelete(); }}
          title="Delete Cell"
        >
          🗑
        </button>
      </div>
      
      {/* Display cell output if available */}
      {type === 'code' && output && (
        <div className={`jp-cell-output ${output.status === 'error' ? 'jp-cell-output-error' : ''}`} style={{ maxHeight: 'none', overflowY: 'visible' }}>
          <div className="jp-cell-output-text" style={{ whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
            {cleanedOutput}
          </div>
          
          {/* Display image if available */}
          {output.imageData && (
            <img 
              className="output-image"
              src={`data:${output.imageData.type};base64,${output.imageData.data}`} 
              alt="Output visualization" 
              style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
            />
          )}
          
          {/* Display HTML content if available */}
          {output.contentType === 'html' && (
            <div 
              className="html-output"
              dangerouslySetInnerHTML={{ __html: cleanedOutput }} 
              style={{ overflow: 'auto', maxHeight: 'none' }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Cell;
