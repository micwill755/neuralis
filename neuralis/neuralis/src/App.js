import React, { useState, useEffect } from 'react';
import SplitPane from 'react-split-pane';
import styled from 'styled-components';
import Sidebar from './components/Layout/Sidebar';
import Notebook from './components/Notebook/Notebook';
import FileViewer from './components/FileViewer/FileViewer';
import AmazonQPanel from './components/assistant/AmazonQPanel';
import './App.css';

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background-color: #f37626;
  color: white;
  padding: 10px 20px;
  display: flex;
  align-items: center;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
`;

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const AmazonQButton = styled.button`
  background-color: #0078d4;
  color: white;
  border: none;
  padding: 5px 10px;
  margin-left: auto;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #005a9e;
  }
`;

function App() {
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAmazonQ, setShowAmazonQ] = useState(true);
  
  // Mock notebooks data
  const notebooks = [
    {
      name: 'notebook1.ipynb',
      path: '/notebooks/notebook1.ipynb',
      cells: [
        { id: 1, type: 'markdown', content: '# Notebook 1\nThis is the first notebook.' },
        { id: 2, type: 'code', content: 'print("Hello from Notebook 1")' }
      ]
    },
    {
      name: 'notebook2.ipynb',
      path: '/notebooks/notebook2.ipynb',
      cells: [
        { id: 1, type: 'markdown', content: '# Notebook 2\nThis is the second notebook.' },
        { id: 2, type: 'code', content: 'print("Hello from Notebook 2")' }
      ]
    }
  ];
  
  const handleSelectNotebook = (notebook) => {
    // Find the full notebook data
    const fullNotebook = notebooks.find(n => n.path === notebook.path);
    if (fullNotebook) {
      setSelectedNotebook(fullNotebook);
      setSelectedFile(null);
      setSelectedItem(notebook);
    }
  };
  
  const handleSelectFile = (file) => {
    setSelectedFile(file);
    setSelectedNotebook(null);
    setSelectedItem(file);
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
        <Logo>Jupyter React Clone</Logo>
        <AmazonQButton onClick={toggleAmazonQ}>
          {showAmazonQ ? 'Hide Amazon Q' : 'Show Amazon Q'}
        </AmazonQButton>
      </Header>
      <ContentContainer>
        <SplitPane
          split="vertical"
          minSize={200}
          defaultSize={250}
          maxSize={400}
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
            maxSize={-300} // Ensure Amazon Q panel has at least 300px
          >
            <div style={{ height: '100%', overflow: 'auto' }}>
              {selectedNotebook && <Notebook notebook={selectedNotebook} />}
              {selectedFile && <FileViewer file={selectedFile} />}
              {!selectedNotebook && !selectedFile && (
                <div style={{ padding: '20px' }}>
                  Select a notebook or file from the sidebar to get started.
                </div>
              )}
            </div>
            {showAmazonQ && (
              <div style={{ height: '100%', borderLeft: '1px solid #ddd' }}>
                <AmazonQPanel onInsertCode={(code) => {
                  // Dispatch a custom event to insert code into the active notebook
                  window.dispatchEvent(new CustomEvent('insertCodeToNotebook', { 
                    detail: { 
                      code,
                      cellType: 'code' // Default to code cell type
                    } 
                  }));
                }} />
              </div>
            )}
          </SplitPane>
        </SplitPane>
      </ContentContainer>
    </AppContainer>
  );
}

export default App;
