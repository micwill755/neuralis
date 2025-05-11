import React, { useState, useEffect } from 'react';
import SplitPane from 'react-split-pane';
import styled from 'styled-components';
import Sidebar from './components/Layout/Sidebar';
import Notebook from './components/Notebook/Notebook';
import FileViewer from './components/FileViewer/FileViewer';
import AmazonQAssistant from './components/assistant/AmazonQAssistant';
import './App.css';

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f5f5f5;
`;

const Header = styled.header`
  background-color: #f5f5f5;
  color: #333;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  z-index: 100;
  flex-shrink: 0;
  border-bottom: 1px solid #e0e0e0;
  height: 28px;
`;

const MenuBar = styled.div`
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  padding: 2px 8px;
  display: flex;
  align-items: center;
  height: 22px;
`;

const MenuItem = styled.div`
  padding: 0 8px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  &:hover {
    background-color: #e0e0e0;
  }
`;

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
`;

const AmazonQButton = styled.button`
  background-color: #2196f3;
  color: white;
  border: none;
  padding: 3px 8px;
  margin-left: auto;
  border-radius: 2px;
  cursor: pointer;
  font-size: 12px;
  height: 22px;
  &:hover {
    background-color: #1976d2;
  }
`;

const MainContentArea = styled.div`
  height: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
  background-color: white;
`;

const TabBar = styled.div`
  display: flex;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  height: 28px;
  align-items: center;
  padding-left: 8px;
`;

const Tab = styled.div`
  padding: 4px 12px;
  font-size: 13px;
  border-right: 1px solid #e0e0e0;
  background-color: ${props => props.active ? 'white' : '#f5f5f5'};
  border-bottom: ${props => props.active ? '2px solid #2196f3' : 'none'};
  color: ${props => props.active ? '#2196f3' : '#333'};
  cursor: pointer;
  display: flex;
  align-items: center;
  height: 100%;
  box-sizing: border-box;
`;

const CloseTab = styled.span`
  margin-left: 8px;
  font-size: 14px;
  &:hover {
    color: #e53935;
  }
`;

const AmazonQPanel = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e0e0e0;
  background-color: white;
`;

const AmazonQHeader = styled.div`
  padding: 8px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  font-size: 13px;
  font-weight: 500;
`;

const StatusBar = styled.div`
  height: 20px;
  background-color: #f5f5f5;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  padding: 0 8px;
  font-size: 12px;
  color: #666;
`;

const StatusItem = styled.div`
  margin-right: 12px;
  display: flex;
  align-items: center;
`;

const StatusDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.active ? '#4caf50' : '#999'};
  margin-right: 4px;
`;

function App() {
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAmazonQ, setShowAmazonQ] = useState(true);
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  
  // Mock notebooks data
  const notebooks = [
    {
      id: 'notebook1',
      name: 'notebook1.ipynb',
      path: '/notebooks/notebook1.ipynb',
      type: 'notebook',
      cells: [
        { id: 1, type: 'markdown', content: '# Notebook 1\nThis is the first notebook.' },
        { id: 2, type: 'code', content: 'print("Hello from Notebook 1")' }
      ]
    },
    {
      id: 'notebook2',
      name: 'notebook2.ipynb',
      path: '/notebooks/notebook2.ipynb',
      type: 'notebook',
      cells: [
        { id: 1, type: 'markdown', content: '# Notebook 2\nThis is the second notebook.' },
        { id: 2, type: 'code', content: 'print("Hello from Notebook 2")' }
      ]
    }
  ];
  
  const files = [
    {
      id: 'file1',
      name: 'data.csv',
      path: '/data/data.csv',
      type: 'file',
      content: 'id,name,value\n1,Item 1,100\n2,Item 2,200\n3,Item 3,300'
    },
    {
      id: 'file2',
      name: 'config.json',
      path: '/config/config.json',
      type: 'file',
      content: '{\n  "setting1": "value1",\n  "setting2": "value2"\n}'
    },
    {
      id: 'file3',
      name: 'README.md',
      path: '/README.md',
      type: 'file',
      content: '# Neuralis\n\nA Jupyter Lab clone built with React.\n\n## Features\n\n- Notebook interface\n- File browser\n- Amazon Q integration\n- Multiple file types support'
    },
    {
      id: 'file4',
      name: 'script.py',
      path: '/scripts/script.py',
      type: 'file',
      content: 'def hello_world():\n    print("Hello, world!")\n\nif __name__ == "__main__":\n    hello_world()'
    },
    {
      id: 'file5',
      name: 'styles.css',
      path: '/styles/styles.css',
      type: 'file',
      content: 'body {\n    font-family: sans-serif;\n    margin: 0;\n    padding: 0;\n}\n\n.container {\n    max-width: 1200px;\n    margin: 0 auto;\n}'
    },
    {
      id: 'file6',
      name: 'app.js',
      path: '/scripts/app.js',
      type: 'file',
      content: 'function init() {\n    console.log("Application initialized");\n}\n\nwindow.onload = init;'
    }
  ];
  
  const handleSelectNotebook = (notebook) => {
    // Find the full notebook data
    const fullNotebook = notebooks.find(n => n.path === notebook.path);
    if (fullNotebook) {
      setSelectedNotebook(fullNotebook);
      setSelectedFile(null);
      setSelectedItem(notebook);
      
      // Add to tabs if not already open
      if (!openTabs.some(tab => tab.id === fullNotebook.id)) {
        setOpenTabs([...openTabs, fullNotebook]);
      }
      setActiveTab(fullNotebook.id);
    }
  };
  
  const handleSelectFile = (file) => {
    // Find the full file data
    const fullFile = files.find(f => f.path === file.path);
    if (fullFile) {
      setSelectedFile(fullFile);
      setSelectedNotebook(null);
      setSelectedItem(file);
      
      // Add to tabs if not already open
      if (!openTabs.some(tab => tab.id === fullFile.id)) {
        setOpenTabs([...openTabs, fullFile]);
      }
      setActiveTab(fullFile.id);
    }
  };
  
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    const tab = [...notebooks, ...files].find(item => item.id === tabId);
    if (tab) {
      if (tab.type === 'notebook') {
        setSelectedNotebook(tab);
        setSelectedFile(null);
      } else {
        setSelectedFile(tab);
        setSelectedNotebook(null);
      }
      setSelectedItem(tab);
    }
  };
  
  const handleCloseTab = (e, tabId) => {
    e.stopPropagation();
    const newTabs = openTabs.filter(tab => tab.id !== tabId);
    setOpenTabs(newTabs);
    
    // If we closed the active tab, activate another tab if available
    if (activeTab === tabId && newTabs.length > 0) {
      setActiveTab(newTabs[newTabs.length - 1].id);
      const newActiveTab = newTabs[newTabs.length - 1];
      if (newActiveTab.type === 'notebook') {
        setSelectedNotebook(newActiveTab);
        setSelectedFile(null);
      } else {
        setSelectedFile(newActiveTab);
        setSelectedNotebook(null);
      }
      setSelectedItem(newActiveTab);
    } else if (newTabs.length === 0) {
      setActiveTab(null);
      setSelectedNotebook(null);
      setSelectedFile(null);
      setSelectedItem(null);
    }
  };
  
  const toggleAmazonQ = () => {
    setShowAmazonQ(!showAmazonQ);
  };
  
  // Listen for code insertion events from Amazon Q
  useEffect(() => {
    const handleInsertCode = (event) => {
      const { code, cellType = 'code' } = event.detail;
      
      if (selectedNotebook && code) {
        // Create a new cell with the generated code
        const newCell = {
          id: Date.now(),
          type: cellType,
          content: code
        };
        
        // Update the notebook with the new cell
        setSelectedNotebook(prevNotebook => {
          const updatedCells = [...prevNotebook.cells, newCell];
          return {
            ...prevNotebook,
            cells: updatedCells
          };
        });
      }
    };
    
    window.addEventListener('insertCodeToNotebook', handleInsertCode);
    return () => {
      window.removeEventListener('insertCodeToNotebook', handleInsertCode);
    };
  }, [selectedNotebook]);
  
  return (
    <AppContainer>
      <Header>
        <AmazonQButton onClick={toggleAmazonQ}>
          {showAmazonQ ? 'Hide Amazon Q' : 'Show Amazon Q'}
        </AmazonQButton>
      </Header>
      <MenuBar>
        <MenuItem>File</MenuItem>
        <MenuItem>Edit</MenuItem>
        <MenuItem>View</MenuItem>
        <MenuItem>Run</MenuItem>
        <MenuItem>Kernel</MenuItem>
        <MenuItem>Help</MenuItem>
      </MenuBar>
      <ContentContainer>
        <SplitPane
          split="vertical"
          minSize={180}
          defaultSize={220}
          maxSize={300}
        >
          <Sidebar 
            onSelectNotebook={handleSelectNotebook} 
            onSelectFile={handleSelectFile}
            selectedItem={selectedItem}
          />
          <SplitPane
            split="vertical"
            minSize={400}
            defaultSize="70%"
            maxSize={-250} // Ensure Amazon Q panel has at least 250px
          >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <TabBar>
                {openTabs.map(tab => (
                  <Tab 
                    key={tab.id} 
                    active={activeTab === tab.id}
                    onClick={() => handleTabClick(tab.id)}
                  >
                    {tab.name}
                    <CloseTab onClick={(e) => handleCloseTab(e, tab.id)}>×</CloseTab>
                  </Tab>
                ))}
              </TabBar>
              <MainContentArea>
                {selectedNotebook && <Notebook notebook={selectedNotebook} />}
                {selectedFile && <FileViewer file={selectedFile} />}
                {!selectedNotebook && !selectedFile && (
                  <div style={{ padding: '20px', color: '#666', textAlign: 'center', marginTop: '40px' }}>
                    <p>Select a notebook or file from the sidebar to get started.</p>
                    <p>Or use the File menu to create a new notebook.</p>
                  </div>
                )}
              </MainContentArea>
            </div>
            {showAmazonQ && (
              <AmazonQPanel>
                <AmazonQHeader>Amazon Q Assistant</AmazonQHeader>
                <AmazonQAssistant />
              </AmazonQPanel>
            )}
          </SplitPane>
        </SplitPane>
      </ContentContainer>
      <StatusBar>
        <StatusItem>
          <StatusDot active={true} />
          Python 3
        </StatusItem>
        <StatusItem>
          <StatusDot active={false} />
          Trusted
        </StatusItem>
        <StatusItem>
          <StatusDot active={true} />
          Autosaved
        </StatusItem>
      </StatusBar>
    </AppContainer>
  );
}

export default App;
