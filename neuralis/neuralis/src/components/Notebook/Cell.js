import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import MonacoEditor from 'react-monaco-editor';

const CellContainer = styled.div`
  margin-bottom: 12px;
  border: 1px solid ${props => props.isActive ? '#2196f3' : 'transparent'};
  border-radius: 4px;
  
  &:hover {
    border-color: ${props => props.isActive ? '#2196f3' : '#e0e0e0'};
  }
`;

const CellToolbar = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background-color: ${props => props.isActive ? '#e3f2fd' : 'transparent'};
  border-bottom: 1px solid ${props => props.isActive ? '#bbdefb' : 'transparent'};
`;

const CellType = styled.div`
  font-size: 12px;
  color: #757575;
  margin-right: 8px;
`;

const CellButton = styled.button`
  background-color: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 2px 6px;
  margin-right: 4px;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const CellContent = styled.div`
  padding: 8px;
  min-height: 24px;
`;

const MarkdownContent = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.5;
  
  h1, h2, h3, h4, h5, h6 {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }
  
  p {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }
  
  pre {
    background-color: #f5f5f5;
    padding: 8px;
    border-radius: 4px;
    overflow-x: auto;
  }
  
  code {
    font-family: 'Courier New', Courier, monospace;
    background-color: #f5f5f5;
    padding: 2px 4px;
    border-radius: 2px;
  }
`;

const CellOutput = styled.div`
  margin-top: 8px;
  padding: 8px;
  background-color: #f9f9f9;
  border-top: 1px solid #f0f0f0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  white-space: pre-wrap;
  overflow-x: auto;
`;

const OutputError = styled.div`
  color: #d32f2f;
  background-color: #ffebee;
  padding: 8px;
  border-radius: 4px;
  margin-top: 8px;
`;

const ExecutionCount = styled.div`
  font-size: 12px;
  color: #757575;
  margin-right: 8px;
  min-width: 20px;
  text-align: right;
`;

const ExecutingIndicator = styled.div`
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(33, 150, 243, 0.2);
  border-top-color: #2196f3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const OutputImage = styled.img`
  max-width: 100%;
  margin-top: 8px;
`;

const OutputTable = styled.div`
  margin-top: 8px;
  overflow-x: auto;
  
  table {
    border-collapse: collapse;
    width: 100%;
  }
  
  th, td {
    border: 1px solid #e0e0e0;
    padding: 6px 8px;
    text-align: left;
  }
  
  th {
    background-color: #f5f5f5;
    font-weight: 500;
  }
  
  tr:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

// Define Python syntax highlighting options
const pythonLanguageConfiguration = {
  comments: {
    lineComment: '#',
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')']
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"', notIn: ['string'] },
    { open: "'", close: "'", notIn: ['string', 'comment'] },
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
  folding: {
    offSide: true,
    markers: {
      start: new RegExp('^\\s*#\\s*region\\b'),
      end: new RegExp('^\\s*#\\s*endregion\\b')
    }
  }
};

function Cell({ cell, isActive, onActivate, onChange, onExecute }) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(cell.content);
  const editorRef = useRef(null);
  
  // Initialize editing state based on cell type and active state
  useEffect(() => {
    if (isActive && cell.type === 'code') {
      setEditing(true);
    }
  }, [isActive, cell.type]);
  
  // Handle editor mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.focus();
    
    // Configure Python syntax highlighting
    if (cell.type === 'code') {
      // Register Python language if not already registered
      if (!monaco.languages.getLanguages().some(lang => lang.id === 'python')) {
        monaco.languages.register({ id: 'python' });
        
        // Set language configuration
        monaco.languages.setLanguageConfiguration('python', pythonLanguageConfiguration);
        
        // Define Python syntax highlighting
        monaco.languages.setMonarchTokensProvider('python', {
          defaultToken: '',
          tokenPostfix: '.python',
          keywords: [
            'and', 'as', 'assert', 'break', 'class', 'continue', 'def',
            'del', 'elif', 'else', 'except', 'exec', 'finally', 'for',
            'from', 'global', 'if', 'import', 'in', 'is', 'lambda',
            'not', 'or', 'pass', 'print', 'raise', 'return', 'self',
            'try', 'while', 'with', 'yield', 'None', 'True', 'False'
          ],
          
          operators: [
            '+', '-', '*', '**', '/', '//', '%', '<<', '>>', '&', '|', '^', '~',
            '<', '>', '<=', '>=', '==', '!=', '<>', '='
          ],
          
          // we include these common regular expressions
          symbols: /[=><!~?:&|+\-*\/\^%]+/,
          escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
          
          // The main tokenizer for our languages
          tokenizer: {
            root: [
              [/[a-zA-Z_]\w*/, {
                cases: {
                  '@keywords': 'keyword',
                  '@default': 'identifier'
                }
              }],
              
              // Strings
              [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-terminated string
              [/'([^'\\]|\\.)*$/, 'string.invalid'],  // non-terminated string
              [/"/, 'string', '@string_double'],
              [/'/, 'string', '@string_single'],
              
              // Numbers
              [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
              [/0[xX][0-9a-fA-F]+/, 'number.hex'],
              [/\d+/, 'number'],
              
              // Delimiter: after number because of .\d floats
              [/[;,.]/, 'delimiter'],
              
              // Comments
              [/#.*$/, 'comment'],
              
              // Whitespace
              [/\s+/, 'white']
            ],
            
            string_double: [
              [/[^\\"]+/, 'string'],
              [/@escapes/, 'string.escape'],
              [/\\./, 'string.escape.invalid'],
              [/"/, 'string', '@pop']
            ],
            
            string_single: [
              [/[^\\']+/, 'string'],
              [/@escapes/, 'string.escape'],
              [/\\./, 'string.escape.invalid'],
              [/'/, 'string', '@pop']
            ],
          }
        });
      }
      
      // Define Python theme
      monaco.editor.defineTheme('pythonTheme', {
        base: 'vs',
        inherit: true,
        rules: [
          { token: 'keyword', foreground: '0000FF', fontStyle: 'bold' },
          { token: 'string', foreground: 'A31515' },
          { token: 'comment', foreground: '008000' },
          { token: 'number', foreground: '098658' },
          { token: 'operator', foreground: 'AF00DB' },
          { token: 'delimiter', foreground: '000000' },
          { token: 'type', foreground: '267F99' },
          { token: 'identifier', foreground: '001080' },
          { token: 'function', foreground: '795E26' }
        ],
        colors: {
          'editor.foreground': '#000000',
          'editor.background': '#FFFFFF',
          'editor.selectionBackground': '#ADD6FF',
          'editor.lineHighlightBackground': '#F7F7F7',
          'editorCursor.foreground': '#000000',
          'editorWhitespace.foreground': '#BFBFBF'
        }
      });
      
      // Set the theme
      monaco.editor.setTheme('pythonTheme');
    }
  };
  
  // Handle content change
  const handleContentChange = (newContent) => {
    setContent(newContent);
    onChange(newContent);
  };
  
  // Handle key down in editor
  const handleKeyDown = (e) => {
    // Shift+Enter to execute cell
    if (e.shiftKey && e.key === 'Enter') {
      e.preventDefault();
      onExecute();
    }
  };
  
  // Render markdown content
  const renderMarkdown = () => {
    // Simple markdown rendering (in a real app, use a proper markdown library)
    let html = cell.content
      // Headers
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Lists
      .replace(/^\s*\*\s(.*$)/gm, '<li>$1</li>')
      // Paragraphs
      .replace(/^(?!<[hl]|<li|<pre)(.+)$/gm, '<p>$1</p>');
    
    return <MarkdownContent dangerouslySetInnerHTML={{ __html: html }} />;
  };
  
  // Render cell output
  const renderOutput = () => {
    if (!cell.outputs || cell.outputs.length === 0) {
      return null;
    }
    
    return (
      <CellOutput>
        {cell.outputs.map((output, index) => {
          if (output.output_type === 'stream') {
            return <div key={index}>{output.text}</div>;
          } else if (output.output_type === 'error') {
            return (
              <OutputError key={index}>
                <div><strong>{output.ename}:</strong> {output.evalue}</div>
                {output.traceback && output.traceback.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </OutputError>
            );
          } else if (output.output_type === 'display_data' || output.output_type === 'execute_result') {
            // Handle different data types
            if (output.data['image/png']) {
              return <OutputImage key={index} src={`data:image/png;base64,${output.data['image/png']}`} alt="Output" />;
            } else if (output.data['text/html']) {
              return <OutputTable key={index} dangerouslySetInnerHTML={{ __html: output.data['text/html'] }} />;
            } else if (output.data['text/plain']) {
              return <div key={index} style={{ whiteSpace: 'pre-wrap' }}>{output.data['text/plain']}</div>;
            }
          }
          return null;
        })}
      </CellOutput>
    );
  };
  
  return (
    <CellContainer isActive={isActive} onClick={onActivate}>
      <CellToolbar isActive={isActive}>
        {cell.type === 'code' && (
          <ExecutionCount>
            {cell.executing ? <ExecutingIndicator /> : cell.execution_count ? `[${cell.execution_count}]` : '[ ]'}
          </ExecutionCount>
        )}
        <CellType>{cell.type === 'code' ? 'Code' : 'Markdown'}</CellType>
        {cell.type === 'code' && (
          <CellButton onClick={(e) => { e.stopPropagation(); onExecute(); }}>
            Run
          </CellButton>
        )}
        {cell.type === 'markdown' && (
          <CellButton onClick={(e) => { e.stopPropagation(); setEditing(!editing); }}>
            {editing ? 'Preview' : 'Edit'}
          </CellButton>
        )}
      </CellToolbar>
      <CellContent>
        {cell.type === 'code' || (cell.type === 'markdown' && editing) ? (
          <MonacoEditor
            width="100%"
            height={Math.max(100, cell.content.split('\n').length * 20)}
            language={cell.type === 'code' ? 'python' : 'markdown'}
            theme={cell.type === 'code' ? 'pythonTheme' : 'vs-light'}
            value={content}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              wrappingIndent: 'indent',
              automaticLayout: true,
              lineNumbers: cell.type === 'code' ? 'on' : 'off',
              renderLineHighlight: 'all',
              highlightActiveIndentGuide: true,
              scrollbar: {
                useShadows: false,
                verticalHasArrows: false,
                horizontalHasArrows: false,
                vertical: 'visible',
                horizontal: 'visible',
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10
              }
            }}
            onChange={handleContentChange}
            editorDidMount={handleEditorDidMount}
            onKeyDown={handleKeyDown}
          />
        ) : (
          renderMarkdown()
        )}
        {cell.type === 'code' && renderOutput()}
      </CellContent>
    </CellContainer>
  );
}

export default Cell;
