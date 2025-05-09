import React from 'react';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import MonacoEditor from '@monaco-editor/react';

const ViewerContainer = styled.div`
  height: 100%;
  overflow: auto;
  padding: 20px;
  background-color: white;
`;

const CSVTable = styled.table`
  border-collapse: collapse;
  width: 100%;
  
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  
  th {
    background-color: #f2f2f2;
  }
  
  tr:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const FileViewer = ({ file }) => {
  const [content, setContent] = useState('');
  const [fileType, setFileType] = useState('');
  const [parsedData, setParsedData] = useState(null);
  
  useEffect(() => {
    if (!file) return;
    
    // Determine file type from extension
    const extension = file.name.split('.').pop().toLowerCase();
    setFileType(extension);
    
    // Load file content
    fetch(file.path)
      .then(response => response.text())
      .then(data => {
        setContent(data);
        
        // Parse data for specific formats
        if (extension === 'json') {
          try {
            setParsedData(JSON.parse(data));
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        } else if (extension === 'csv') {
          try {
            const rows = data.split('\n').map(row => row.split(','));
            setParsedData(rows);
          } catch (e) {
            console.error('Error parsing CSV:', e);
          }
        }
      })
      .catch(error => {
        console.error('Error loading file:', error);
        setContent(`Error loading file: ${error.message}`);
      });
  }, [file]);
  
  if (!file) {
    return <ViewerContainer>Select a file to view</ViewerContainer>;
  }
  
  const renderContent = () => {
    switch (fileType) {
      case 'md':
        return <ReactMarkdown>{content}</ReactMarkdown>;
      
      case 'json':
        return (
          <MonacoEditor
            height="90vh"
            language="json"
            value={content}
            options={{
              readOnly: true,
              minimap: { enabled: true },
              scrollBeyondLastLine: false
            }}
          />
        );
      
      case 'py':
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
      case 'html':
      case 'css':
        return (
          <MonacoEditor
            height="90vh"
            language={fileType === 'py' ? 'python' : fileType}
            value={content}
            options={{
              readOnly: true,
              minimap: { enabled: true },
              scrollBeyondLastLine: false
            }}
          />
        );
      
      case 'csv':
        return parsedData ? (
          <CSVTable>
            <thead>
              <tr>
                {parsedData[0]?.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parsedData.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </CSVTable>
        ) : (
          <pre>{content}</pre>
        );
      
      default:
        return <pre>{content}</pre>;
    }
  };
  
  return (
    <ViewerContainer>
      <h2>{file.name}</h2>
      {renderContent()}
    </ViewerContainer>
  );
};

export default FileViewer;
