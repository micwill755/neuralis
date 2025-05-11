import React, { useState } from 'react';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f5f5;
  border-right: 1px solid #e0e0e0;
`;

const SidebarTabs = styled.div`
  display: flex;
  flex-direction: column;
  width: 36px;
  background-color: #eeeeee;
  border-right: 1px solid #e0e0e0;
`;

const SidebarTab = styled.div`
  height: 36px;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${props => props.active ? '#2196f3' : '#666'};
  background-color: ${props => props.active ? '#f5f5f5' : 'transparent'};
  border-left: ${props => props.active ? '2px solid #2196f3' : 'none'};
  &:hover {
    background-color: ${props => props.active ? '#f5f5f5' : '#e0e0e0'};
  }
`;

const SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
`;

const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #666;
  margin: 8px 0 4px 0;
  padding-left: 4px;
`;

const ItemList = styled.div`
  margin-bottom: 16px;
`;

const Item = styled.div`
  padding: 4px 8px;
  font-size: 13px;
  cursor: pointer;
  border-radius: 2px;
  display: flex;
  align-items: center;
  background-color: ${props => props.selected ? '#e3f2fd' : 'transparent'};
  color: ${props => props.selected ? '#2196f3' : '#333'};
  &:hover {
    background-color: ${props => props.selected ? '#e3f2fd' : '#e0e0e0'};
  }
`;

const ItemIcon = styled.div`
  margin-right: 6px;
  font-size: 14px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.color || '#666'};
`;

const SidebarLayout = styled.div`
  display: flex;
  height: 100%;
`;

function Sidebar({ onSelectNotebook, onSelectFile, selectedItem }) {
  const [activeTab, setActiveTab] = useState('files');
  
  // Mock data
  const notebooks = [
    { name: 'notebook1.ipynb', path: '/notebooks/notebook1.ipynb' },
    { name: 'notebook2.ipynb', path: '/notebooks/notebook2.ipynb' },
    { name: 'analysis.ipynb', path: '/notebooks/analysis.ipynb' }
  ];
  
  const files = [
    { name: 'data.csv', path: '/data/data.csv' },
    { name: 'config.json', path: '/config/config.json' },
    { name: 'README.md', path: '/README.md' },
    { name: 'script.py', path: '/scripts/script.py' },
    { name: 'styles.css', path: '/styles/styles.css' },
    { name: 'app.js', path: '/scripts/app.js' }
  ];
  
  // Get file icon and color based on file extension
  const getFileIconAndColor = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'ipynb':
        return { icon: '📓', color: '#F37626' }; // Jupyter orange
      case 'py':
        return { icon: '🐍', color: '#3572A5' }; // Python blue
      case 'js':
        return { icon: 'JS', color: '#F7DF1E' }; // JavaScript yellow
      case 'json':
        return { icon: '{ }', color: '#000080' }; // JSON navy
      case 'css':
        return { icon: '🎨', color: '#563D7C' }; // CSS purple
      case 'html':
        return { icon: '🌐', color: '#E34C26' }; // HTML orange
      case 'md':
        return { icon: '📝', color: '#083FA1' }; // Markdown blue
      case 'csv':
        return { icon: '📊', color: '#217346' }; // Excel green
      case 'txt':
        return { icon: '📄', color: '#7F7F7F' }; // Text gray
      case 'pdf':
        return { icon: '📕', color: '#FF0000' }; // PDF red
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return { icon: '🖼️', color: '#FF9E80' }; // Image orange
      default:
        return { icon: '📄', color: '#7F7F7F' }; // Default gray
    }
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'files':
        return (
          <>
            <SectionTitle>Notebooks</SectionTitle>
            <ItemList>
              {notebooks.map((notebook, index) => {
                const { icon, color } = getFileIconAndColor(notebook.name);
                return (
                  <Item 
                    key={index} 
                    selected={selectedItem && selectedItem.path === notebook.path}
                    onClick={() => onSelectNotebook(notebook)}
                  >
                    <ItemIcon color={color}>{icon}</ItemIcon>
                    {notebook.name}
                  </Item>
                );
              })}
            </ItemList>
            
            <SectionTitle>Files</SectionTitle>
            <ItemList>
              {files.map((file, index) => {
                const { icon, color } = getFileIconAndColor(file.name);
                return (
                  <Item 
                    key={index} 
                    selected={selectedItem && selectedItem.path === file.path}
                    onClick={() => onSelectFile(file)}
                  >
                    <ItemIcon color={color}>{icon}</ItemIcon>
                    {file.name}
                  </Item>
                );
              })}
            </ItemList>
          </>
        );
      case 'running':
        return (
          <>
            <SectionTitle>Running Terminals and Kernels</SectionTitle>
            <div style={{ padding: '8px', color: '#666', fontSize: '13px' }}>
              No running terminals or kernels
            </div>
          </>
        );
      case 'commands':
        return (
          <>
            <SectionTitle>Commands</SectionTitle>
            <div style={{ padding: '8px', color: '#666', fontSize: '13px' }}>
              Search for commands here
            </div>
          </>
        );
      default:
        return null;
    }
  };
  
  return (
    <SidebarContainer>
      <SidebarLayout>
        <SidebarTabs>
          <SidebarTab 
            active={activeTab === 'files'} 
            onClick={() => setActiveTab('files')}
            title="File Browser"
          >
            📁
          </SidebarTab>
          <SidebarTab 
            active={activeTab === 'running'} 
            onClick={() => setActiveTab('running')}
            title="Running Terminals and Kernels"
          >
            ⚙️
          </SidebarTab>
          <SidebarTab 
            active={activeTab === 'commands'} 
            onClick={() => setActiveTab('commands')}
            title="Commands"
          >
            🔍
          </SidebarTab>
        </SidebarTabs>
        <SidebarContent>
          {renderTabContent()}
        </SidebarContent>
      </SidebarLayout>
    </SidebarContainer>
  );
}

export default Sidebar;
