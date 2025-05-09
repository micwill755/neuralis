import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaFolder, FaFolderOpen, FaFileCsv, FaFileCode, FaMarkdown, FaFileAlt } from 'react-icons/fa';

const SidebarContainer = styled.div`
  background-color: #f8f9fa;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  border-right: 1px solid #dee2e6;
`;

const SidebarHeader = styled.div`
  padding: 15px;
  font-weight: bold;
  border-bottom: 1px solid #dee2e6;
`;

const FileList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const FileItem = styled.li`
  padding: 8px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  &:hover {
    background-color: #e9ecef;
  }
  ${props => props.active && `
    background-color: #e9ecef;
    font-weight: bold;
  `}
`;

const FileIcon = styled.span`
  margin-right: 8px;
  display: flex;
  align-items: center;
`;

const FolderContents = styled.ul`
  list-style-type: none;
  padding-left: 20px;
  margin: 0;
`;

const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  
  switch (extension) {
    case 'ipynb':
      return <FaFileCode color="#F37626" />;
    case 'csv':
      return <FaFileCsv color="#217346" />;
    case 'md':
      return <FaMarkdown color="#083fa1" />;
    case 'py':
      return <FaFileCode color="#3572A5" />;
    case 'js':
    case 'jsx':
      return <FaFileCode color="#f7df1e" />;
    case 'json':
      return <FaFileCode color="#5a5a5a" />;
    default:
      return <FaFileAlt />;
  }
};

const Folder = ({ folder, onSelectNotebook, onSelectFile, selectedItem }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <FileItem onClick={() => setIsOpen(!isOpen)}>
        <FileIcon>
          {isOpen ? <FaFolderOpen color="#FFC107" /> : <FaFolder color="#FFC107" />}
        </FileIcon>
        {folder.name}
      </FileItem>
      
      {isOpen && (
        <FolderContents>
          {folder.contents.map((item, index) => (
            item.type === 'folder' ? (
              <Folder 
                key={index} 
                folder={item} 
                onSelectNotebook={onSelectNotebook}
                onSelectFile={onSelectFile}
                selectedItem={selectedItem}
              />
            ) : (
              <FileItem 
                key={index} 
                onClick={() => {
                  if (item.name.endsWith('.ipynb')) {
                    onSelectNotebook(item);
                  } else {
                    onSelectFile(item);
                  }
                }}
                active={selectedItem && selectedItem.path === item.path}
              >
                <FileIcon>
                  {getFileIcon(item.name)}
                </FileIcon>
                {item.name}
              </FileItem>
            )
          ))}
        </FolderContents>
      )}
    </>
  );
};

const Sidebar = ({ onSelectNotebook, onSelectFile, selectedItem }) => {
  const [fileStructure, setFileStructure] = useState([]);
  
  useEffect(() => {
    // Mock file structure - in a real app, this would come from an API
    const mockFileStructure = [
      {
        type: 'folder',
        name: 'notebooks',
        contents: [
          { type: 'file', name: 'notebook1.ipynb', path: '/notebooks/notebook1.ipynb' },
          { type: 'file', name: 'notebook2.ipynb', path: '/notebooks/notebook2.ipynb' }
        ]
      },
      {
        type: 'folder',
        name: 'data',
        contents: [
          { type: 'file', name: 'data.csv', path: '/data/data.csv' },
          { type: 'file', name: 'config.json', path: '/data/config.json' }
        ]
      },
      {
        type: 'folder',
        name: 'docs',
        contents: [
          { type: 'file', name: 'README.md', path: '/docs/README.md' }
        ]
      },
      {
        type: 'folder',
        name: 'src',
        contents: [
          { type: 'file', name: 'main.py', path: '/src/main.py' },
          { type: 'file', name: 'utils.js', path: '/src/utils.js' }
        ]
      }
    ];
    
    setFileStructure(mockFileStructure);
  }, []);
  
  return (
    <SidebarContainer>
      <SidebarHeader>Files</SidebarHeader>
      <FileList>
        {fileStructure.map((item, index) => (
          item.type === 'folder' ? (
            <Folder 
              key={index} 
              folder={item} 
              onSelectNotebook={onSelectNotebook}
              onSelectFile={onSelectFile}
              selectedItem={selectedItem}
            />
          ) : (
            <FileItem 
              key={index} 
              onClick={() => {
                if (item.name.endsWith('.ipynb')) {
                  onSelectNotebook(item);
                } else {
                  onSelectFile(item);
                }
              }}
              active={selectedItem && selectedItem.path === item.path}
            >
              <FileIcon>
                {getFileIcon(item.name)}
              </FileIcon>
              {item.name}
            </FileItem>
          )
        ))}
      </FileList>
    </SidebarContainer>
  );
};

export default Sidebar;
