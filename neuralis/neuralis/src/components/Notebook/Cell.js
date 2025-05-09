import React from 'react';
import styled from 'styled-components';
import MonacoEditor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';

const CellContainer = styled.div`
  margin-bottom: 20px;
  border: 1px solid ${props => props.isActive ? '#3f51b5' : '#e0e0e0'};
  border-radius: 4px;
  overflow: hidden;
`;

const CellHeader = styled.div`
  background-color: ${props => props.isActive ? '#e8eaf6' : '#f5f5f5'};
  padding: 5px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${props => props.isActive ? '#c5cae9' : '#e0e0e0'};
`;

const CellType = styled.div`
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #757575;
`;

const ExecutionCount = styled.div`
  font-size: 0.8rem;
  color: #757575;
  font-family: monospace;
`;

const CellContent = styled.div`
  padding: ${props => props.type === 'markdown' ? '10px' : '0'};
`;

const MarkdownContent = styled.div`
  padding: 10px;
  
  h1, h2, h3, h4, h5, h6 {
    margin-top: 0;
  }
  
  p {
    margin-bottom: 10px;
  }
  
  pre {
    background-color: #f5f5f5;
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
  }
`;

const CellOutput = styled.div`
  background-color: ${props => props.status === 'error' ? '#ffebee' : '#f5f5f5'};
  border-top: 1px solid #e0e0e0;
  padding: 10px;
  font-family: monospace;
  white-space: pre-wrap;
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
  color: ${props => props.status === 'error' ? '#d32f2f' : 'inherit'};
`;

const OutputImage = styled.img`
  max-width: 100%;
  margin: 10px 0;
`;

const Cell = ({ id, type, content, isActive, onChange, onFocus, output }) => {
  const handleEditorChange = (value) => {
    onChange(id, value);
  };
  
  return (
    <CellContainer isActive={isActive} onClick={() => onFocus(id)}>
      <CellHeader isActive={isActive}>
        <CellType>{type}</CellType>
        {type === 'code' && output?.executionCount && (
          <ExecutionCount>[{output.executionCount}]</ExecutionCount>
        )}
      </CellHeader>
      <CellContent type={type}>
        {type === 'code' ? (
          <MonacoEditor
            height="100px"
            language="python"
            value={content}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              glyphMargin: false,
              folding: false,
              lineDecorationsWidth: 0,
              lineNumbersMinChars: 3
            }}
          />
        ) : (
          isActive ? (
            <MonacoEditor
              height="100px"
              language="markdown"
              value={content}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on'
              }}
            />
          ) : (
            <MarkdownContent>
              <ReactMarkdown>{content}</ReactMarkdown>
            </MarkdownContent>
          )
        )}
      </CellContent>
      
      {/* Display cell output if available */}
      {type === 'code' && output && (
        <CellOutput status={output.status}>
          {output.output}
          
          {/* Display image if available */}
          {output.imageData && (
            <OutputImage 
              src={`data:${output.imageData.type};base64,${output.imageData.data}`} 
              alt="Output visualization" 
            />
          )}
        </CellOutput>
      )}
    </CellContainer>
  );
};

export default Cell;
