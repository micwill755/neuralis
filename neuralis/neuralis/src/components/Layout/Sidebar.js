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

const ItemIcon = styled.span`
  margin-right: 6px;
  font-size: 14px;
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
    { name: 'README.md', path: '/README.md' }
  ];
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'files':
        return (
          <>
            <SectionTitle>Notebooks</SectionTitle>
            <ItemList>
              {notebooks.map((notebook, index) => (
                <Item 
                  key={index} 
                  selected={selectedItem && selectedItem.path === notebook.path}
                  onClick={() => onSelectNotebook(notebook)}
                >
                  <ItemIcon>📓</ItemIcon>
                  {notebook.name}
                </Item>
              ))}
            </ItemList>
            
            <SectionTitle>Files</SectionTitle>
            <ItemList>
              {files.map((file, index) => (
                <Item 
                  key={index} 
                  selected={selectedItem && selectedItem.path === file.path}
                  onClick={() => onSelectFile(file)}
                >
                  <ItemIcon>📄</ItemIcon>
                  {file.name}
                </Item>
              ))}
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
