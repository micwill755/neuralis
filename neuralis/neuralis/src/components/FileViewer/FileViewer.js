import React from 'react';
import styled from 'styled-components';

const FileViewerContainer = styled.div`
  padding: 16px;
  height: 100%;
  overflow: auto;
`;

const FileContent = styled.pre`
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 12px;
  background-color: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre-wrap;
`;

const FileHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const FileName = styled.h2`
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  color: #333;
`;

const FileType = styled.span`
  font-size: 12px;
  color: #757575;
  margin-left: 8px;
  padding: 2px 6px;
  background-color: #f5f5f5;
  border-radius: 4px;
`;

const FileViewer = ({ file }) => {
  if (!file) return null;
  
  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'js':
        return 'JavaScript';
      case 'py':
        return 'Python';
      case 'json':
        return 'JSON';
      case 'md':
        return 'Markdown';
      case 'csv':
        return 'CSV';
      case 'txt':
        return 'Text';
      default:
        return extension.toUpperCase();
    }
  };
  
  return (
    <FileViewerContainer>
      <FileHeader>
        <FileName>{file.name}</FileName>
        <FileType>{getFileType(file.name)}</FileType>
      </FileHeader>
      <FileContent>{file.content}</FileContent>
    </FileViewerContainer>
  );
};

export default FileViewer;
