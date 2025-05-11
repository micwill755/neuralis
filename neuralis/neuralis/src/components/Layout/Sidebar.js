import React, { useState } from 'react';
import styled from 'styled-components';
import KernelSelector from '../Notebook/KernelSelector';

const SidebarContainer = styled.div`
  background-color: #f5f5f5;
  border-right: 1px solid #e0e0e0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TabBar = styled.div`
  display: flex;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
`;

const Tab = styled.div`
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  background-color: ${props => props.active ? 'white' : '#f5f5f5'};
  border-bottom: ${props => props.active ? '2px solid #2196f3' : 'none'};
  color: ${props => props.active ? '#2196f3' : '#333'};
`;

const ContentArea = styled.div`
  flex: 1;
  overflow: auto;
  background-color: white;
`;

const FileTree = styled.div`
  padding: 8px;
`;

const FileItem = styled.div`
  padding: 4px 8px;
  margin: 2px 0;
  cursor: pointer;
  border-radius: 4px;
  background-color: ${props => props.selected ? '#e3f2fd' : 'transparent'};
  color: ${props => props.selected ? '#2196f3' : 'inherit'};
  
  &:hover {
    background-color: ${props => props.selected ? '#e3f2fd' : '#f5f5f5'};
  }
`;

const FolderItem = styled(FileItem)`
  font-weight: 500;
`;

const FileIcon = styled.span`
  margin-right: 8px;
  font-size: 12px;
`;

const KernelArea = styled.div`
  padding: 8px;
  border-bottom: 1px solid #e0e0e0;
`;

function Sidebar({ onSelectNotebook, onSelectFile, selectedItem }) {
  const [activeTab, setActiveTab] = useState('files');
  const [activeKernel, setActiveKernel] = useState(null);
  
  // Mock file structure
  const fileStructure = [
    {
      name: 'notebooks',
      type: 'folder',
      children: [
        { name: 'notebook1.ipynb', path: '/notebooks/notebook1.ipynb', type: 'notebook' },
        { name: 'notebook2.ipynb', path: '/notebooks/notebook2.ipynb', type: 'notebook' }
      ]
    },
    {
      name: 'data',
      type: 'folder',
      children: [
        { name: 'data.csv', path: '/data/data.csv', type: 'file' }
      ]
    },
    {
      name: 'config',
      type: 'folder',
      children: [
        { name: 'config.json', path: '/config/config.json', type: 'file' }
      ]
    },
    {
      name: 'scripts',
      type: 'folder',
      children: [
        { name: 'script.py', path: '/scripts/script.py', type: 'file' },
        { name: 'app.js', path: '/scripts/app.js', type: 'file' }
      ]
    },
    {
      name: 'styles',
      type: 'folder',
      children: [
        { name: 'styles.css', path: '/styles/styles.css', type: 'file' }
      ]
    },
    { name: 'README.md', path: '/README.md', type: 'file' }
  ];
  
  const handleKernelChange = (kernel) => {
    setActiveKernel(kernel);
    
    // Dispatch an event to notify all notebooks about the kernel change
    const event = new CustomEvent('globalKernelChange', { 
      detail: { kernel } 
    });
    window.dispatchEvent(event);
  };
  
  const renderFileTree = (items, level = 0) => {
    return items.map(item => {
      if (item.type === 'folder') {
        return (
          <div key={item.name} style={{ marginLeft: level * 16 }}>
            <FolderItem>
              <FileIcon>📁</FileIcon>
              {item.name}
            </FolderItem>
            {item.children && renderFileTree(item.children, level + 1)}
          </div>
        );
      } else if (item.type === 'notebook') {
        return (
          <FileItem 
            key={item.path} 
            selected={selectedItem && selectedItem.path === item.path}
            style={{ marginLeft: level * 16 }}
            onClick={() => onSelectNotebook(item)}
          >
            <FileIcon>📓</FileIcon>
            {item.name}
          </FileItem>
        );
      } else {
        return (
          <FileItem 
            key={item.path} 
            selected={selectedItem && selectedItem.path === item.path}
            style={{ marginLeft: level * 16 }}
            onClick={() => onSelectFile(item)}
          >
            <FileIcon>📄</FileIcon>
            {item.name}
          </FileItem>
        );
      }
    });
  };
  
  return (
    <SidebarContainer>
      <TabBar>
        <Tab 
          active={activeTab === 'files'} 
          onClick={() => setActiveTab('files')}
        >
          Files
        </Tab>
        <Tab 
          active={activeTab === 'kernels'} 
          onClick={() => setActiveTab('kernels')}
        >
          Kernels
        </Tab>
      </TabBar>
      
      {/* Kernel Selector - Always visible at the top */}
      <KernelArea>
        <KernelSelector 
          onKernelChange={handleKernelChange}
          compactMode={true}
        />
      </KernelArea>
      
      <ContentArea>
        {activeTab === 'files' && (
          <FileTree>
            {renderFileTree(fileStructure)}
          </FileTree>
        )}
        
        {activeTab === 'kernels' && (
          <KernelSelector 
            onKernelChange={handleKernelChange}
            compactMode={false}
          />
        )}
      </ContentArea>
    </SidebarContainer>
  );
}

export default Sidebar;
