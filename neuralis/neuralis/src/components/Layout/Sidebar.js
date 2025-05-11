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

// New styled components for kernel options
const KernelOption = styled.div`
  width: 48%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  background-color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #2196f3;
    background-color: #f5f5f5;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const KernelIcon = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
`;

const KernelOptionText = styled.div`
  display: flex;
  flex-direction: column;
`;

const KernelOptionTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #333;
`;

const KernelOptionDesc = styled.div`
  font-size: 11px;
  color: #666;
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
              No active kernels or terminals
            </div>
            
            <SectionTitle>Create New Environment</SectionTitle>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <KernelOption onClick={() => window.dispatchEvent(new CustomEvent('openKernelSetup', { detail: { type: 'conda' } }))}>
                <KernelIcon>
                  <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHBhdGggZmlsbD0iIzQ0QTgzMyIgZD0iTTE2IDBDNy4xNjMgMCAwIDcuMTYzIDAgMTZzNy4xNjMgMTYgMTYgMTZjOC44MzcgMCAxNi03LjE2MyAxNi0xNlMyNC44MzcgMCAxNiAwem0wIDYuNWM1LjMyNiAwIDkuNSA0LjE3NCA5LjUgOS41cy00LjE3NCA5LjUtOS41IDkuNVM2LjUgMjEuMzI2IDYuNSAxNiAxMC42NzQgNi41IDE2IDYuNXoiLz48L3N2Zz4=" 
                    alt="Conda" width="24" height="24" />
                </KernelIcon>
                <KernelOptionText>
                  <KernelOptionTitle>Conda Environment</KernelOptionTitle>
                  <KernelOptionDesc>Create a local conda environment</KernelOptionDesc>
                </KernelOptionText>
              </KernelOption>
              
              <KernelOption onClick={() => window.dispatchEvent(new CustomEvent('openKernelSetup', { detail: { type: 'docker' } }))}>
                <KernelIcon>
                  <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHBhdGggZmlsbD0iIzI0OTZFRCIgZD0iTTE4LjY0NCAxNC43NzFoMi44MjVhLjI0OC4yNDggMCAwIDAgLjI0OC0uMjQ3di0yLjUxN2EuMjQ4LjI0OCAwIDAgMC0uMjQ4LS4yNDhoLTIuODI1YS4yNDcuMjQ3IDAgMCAwLS4yNDcuMjQ4djIuNTE3YzAgLjEzNi4xMS4yNDcuMjQ3LjI0N20tMy45MzktNy4yNGgyLjgyNWEuMjQ4LjI0OCAwIDAgMCAuMjQ4LS4yNDdWNC43NjZhLjI0OC4yNDggMCAwIDAtLjI0OC0uMjQ3aC0yLjgyNWEuMjQ3LjI0NyAwIDAgMC0uMjQ3LjI0N3YyLjUxN2MwIC4xMzYuMTEuMjQ3LjI0Ny4yNDdtMCAzLjYyMWgyLjgyNWEuMjUuMjUgMCAwIDAgLjI0OC0uMjQ4VjguMzg3YS4yNDguMjQ4IDAgMCAwLS4yNDgtLjI0N2gtMi44MjVhLjI0Ny4yNDcgMCAwIDAtLjI0Ny4yNDd2Mi41MTdjMCAuMTM2LjExLjI0Ny4yNDcuMjQ4bS0zLjkwNiAwaDIuODI3YS4yNDguMjQ4IDAgMCAwIC4yNDYtLjI0OFY4LjM4N2EuMjQ3LjI0NyAwIDAgMC0uMjQ2LS4yNDdoLTIuODI3YS4yNDcuMjQ3IDAgMCAwLS4yNDcuMjQ3djIuNTE3YzAgLjEzNi4xMS4yNDcuMjQ3LjI0OG0tMy45NTIgMGgyLjgyNmEuMjQ4LjI0OCAwIDAgMCAuMjQ3LS4yNDhWOC4zODdhLjI0Ny4yNDcgMCAwIDAtLjI0Ny0uMjQ3SDYuODQ3YS4yNDguMjQ4IDAgMCAwLS4yNDguMjQ3djIuNTE3YzAgLjEzNi4xMTIuMjQ3LjI0OC4yNDhtNy44NTggMy42MTloMi44MjVhLjI0OC4yNDggMCAwIDAgLjI0OC0uMjQ3di0yLjUxN2EuMjQ4LjI0OCAwIDAgMC0uMjQ4LS4yNDhoLTIuODI1YS4yNDcuMjQ3IDAgMCAwLS4yNDcuMjQ4djIuNTE3YzAgLjEzNi4xMS4yNDcuMjQ3LjI0N20tMy45MDYgMGgyLjgyN2EuMjQ3LjI0NyAwIDAgMCAuMjQ2LS4yNDd2LTIuNTE3YS4yNDcuMjQ3IDAgMCAwLS4yNDYtLjI0OGgtMi44MjdhLjI0Ny4yNDcgMCAwIDAtLjI0Ny4yNDh2Mi41MTdjMCAuMTM2LjExLjI0Ny4yNDcuMjQ3bS0zLjk1MiAwaDIuODI2YS4yNDcuMjQ3IDAgMCAwIC4yNDctLjI0N3YtMi41MTdhLjI0Ny4yNDcgMCAwIDAtLjI0Ny0uMjQ4SDYuODQ3YS4yNDguMjQ4IDAgMCAwLS4yNDguMjQ4djIuNTE3YzAgLjEzNi4xMTIuMjQ3LjI0OC4yNDdtLTMuODkzIDBIMi45OGEuMjQ3LjI0NyAwIDAgMCAuMjQ2LS4yNDd2LTIuNTE3YS4yNDcuMjQ3IDAgMCAwLS4yNDYtLjI0OEguMjQ3QS4yNDcuMjQ3IDAgMCAwIDAgMTIuMDA3djIuNTE3YzAgLjEzNi4xMS4yNDcuMjQ3LjI0N20zMS42ODQtLjI0N2MtLjA4Ny0uMDY4LS44OTYtLjY4LTIuNjA2LS42OC0uNDUuMDAxLS45MDEuMDQtMS4zNDcuMTE2LS4zMy0yLjI2Ny0yLjIwNC0zLjM3My0yLjI4OC0zLjQyMWwtLjQ1OS0uMjY1LS4zMDEuNDM2Yy0uMzc5LjU4NC0uNjUzIDEuMjMtLjgxNiAxLjkwNy0uMzA3IDEuMjkzLS4xMiAyLjUwOS41MzcgMy41NDgtLjc5My40NDMtMi4wNjcuNTUtMi4zMjUuNTZIMS4wMDFhMS4wMDEgMS4wMDEgMCAwIDAtMSAuOTk3Yy0uMDI1IDEuODcyLjE4NyAzLjc0MS45MjMgNS40MTYuNzI3IDEuOTA0IDEuODA3IDMuMzA3IDMuMjEzIDQuMTY2IDEuNTczLjk2NCA0LjEzMyAxLjUxNiA3LjAzMyAxLjUxNmExLjMxIDEuMzEgMCAwIDAgLjE5LS4wMDhjMS45MjMuMDMzIDMuODQzLS4yNTIgNS42NDUtLjg0MiAxLjk2Ny0uNjM4IDMuNzYzLTEuNjc1IDUuMzU3LTMuMDUzIDEuMzA3LS45NzQgMi40NzktMS43NiAzLjU1LTIuODQ4IDEuNjY5LTEuODkgMi42NjQtMy45OTYgMy40MDQtNS44NjdoLjI5NWMxLjgyOSAwIDIuOTUzLS43MzIgMy41NzMtMS4zNDUuNDEyLS4zOS43MzMtLjg2Ny45NDMtMS4zOTVsLjEzLS4zODR6Ii8+PC9zdmc+" 
                    alt="Docker" width="24" height="24" />
                </KernelIcon>
                <KernelOptionText>
                  <KernelOptionTitle>Docker Container</KernelOptionTitle>
                  <KernelOptionDesc>Run Python in a container</KernelOptionDesc>
                </KernelOptionText>
              </KernelOption>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <KernelOption onClick={() => window.dispatchEvent(new CustomEvent('openKernelSetup', { detail: { type: 'terminal' } }))}>
                <KernelIcon>
                  <span style={{ fontSize: '24px' }}>⌨️</span>
                </KernelIcon>
                <KernelOptionText>
                  <KernelOptionTitle>Terminal</KernelOptionTitle>
                  <KernelOptionDesc>Use system terminal</KernelOptionDesc>
                </KernelOptionText>
              </KernelOption>
              
              <KernelOption onClick={() => window.dispatchEvent(new CustomEvent('openKernelSetup', { detail: { type: 'existing' } }))}>
                <KernelIcon>
                  <span style={{ fontSize: '24px' }}>🔌</span>
                </KernelIcon>
                <KernelOptionText>
                  <KernelOptionTitle>Connect</KernelOptionTitle>
                  <KernelOptionDesc>Connect to existing kernel</KernelOptionDesc>
                </KernelOptionText>
              </KernelOption>
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
