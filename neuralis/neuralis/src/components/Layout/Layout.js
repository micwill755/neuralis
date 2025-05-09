import React, { useState } from 'react';
import styled from 'styled-components';
import SplitPane from 'react-split-pane';
import Notebook from '../Notebook/Notebook';
import Sidebar from './Sidebar';
import AmazonQPanel from '../assistant/AmazonQPanel';

const LayoutContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background-color: #f7f7f7;
  padding: 10px;
  border-bottom: 1px solid #e2e2e2;
  display: flex;
  align-items: center;
`;

const Logo = styled.div`
  font-size: 20px;
  font-weight: bold;
  margin-right: 20px;
`;

const MenuBar = styled.div`
  display: flex;
`;

const MenuItem = styled.div`
  margin-right: 15px;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const MainContent = styled.div`
  flex: 1;
  overflow: hidden;
`;

const Layout = () => {
  const [currentNotebook, setCurrentNotebook] = useState(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  
  // Default notebook data
  const defaultNotebook = {
    name: 'Untitled.ipynb',
    cells: [
      { id: 1, type: 'markdown', content: '# Welcome to Jupyter React Clone\n\nThis is a simple demonstration of a Jupyter-like notebook interface built with React.' },
      { id: 2, type: 'code', content: 'import numpy as np\nimport matplotlib.pyplot as plt\n\n# Generate some data\nx = np.linspace(0, 10, 100)\ny = np.sin(x)\n\n# Create a plot\nplt.figure(figsize=(8, 4))\nplt.plot(x, y)\nplt.title("Sine Wave")\nplt.xlabel("x")\nplt.ylabel("sin(x)")\nplt.grid(True)\nplt.show()' },
      { id: 3, type: 'code', content: '# Calculate some statistics\nmean = np.mean(y)\nstd = np.std(y)\nprint(f"Mean: {mean:.4f}")\nprint(f"Standard Deviation: {std:.4f}")' }
    ]
  };
  
  // Notebook data store (simulating a database)
  const [notebooks, setNotebooks] = useState({
    'notebook1.ipynb': {
      name: 'notebook1.ipynb',
      cells: [
        { id: 1, type: 'markdown', content: '# Notebook 1\n\nThis is the first notebook.' },
        { id: 2, type: 'code', content: 'print("Hello from Notebook 1!")' }
      ]
    },
    'notebook2.ipynb': {
      name: 'notebook2.ipynb',
      cells: [
        { id: 1, type: 'markdown', content: '# Notebook 2\n\nThis is the second notebook.' },
        { id: 2, type: 'code', content: 'print("Hello from Notebook 2!")' }
      ]
    }
  });
  
  // Handle notebook selection from file browser
  const handleSelectNotebook = (file) => {
    const notebookData = notebooks[file.name] || defaultNotebook;
    // Only update if selecting a different notebook
    if (!currentNotebook || currentNotebook.name !== notebookData.name) {
      setCurrentNotebook(notebookData);
    }
  };
  
  // Handle creating a new notebook
  const handleCreateNotebook = (newNotebook) => {
    // Create a new notebook with default cells
    const notebookData = {
      name: newNotebook.name,
      cells: [
        { id: 1, type: 'markdown', content: `# ${newNotebook.name}\n\nWelcome to your new notebook!` },
        { id: 2, type: 'code', content: '# Your code here' }
      ]
    };
    
    // Add to notebooks store
    setNotebooks({
      ...notebooks,
      [newNotebook.name]: notebookData
    });
    
    // Set as current notebook
    setCurrentNotebook(notebookData);
  };
  
  // Update notebook content when cells change
  const handleUpdateNotebook = (updatedCells) => {
    if (currentNotebook) {
      // Create a new notebook object only if cells have actually changed
      const hasChanged = JSON.stringify(currentNotebook.cells) !== JSON.stringify(updatedCells);
      
      if (hasChanged) {
        const updatedNotebook = {
          ...currentNotebook,
          cells: updatedCells
        };
        
        setCurrentNotebook(updatedNotebook);
        
        // Update in the notebooks store
        setNotebooks(prevNotebooks => ({
          ...prevNotebooks,
          [currentNotebook.name]: updatedNotebook
        }));
      }
    }
  };

  // Handle inserting code from AI assistant into notebook
  const handleInsertCode = (code) => {
    if (currentNotebook) {
      // Create a new cell with the generated code
      const newCell = {
        id: Date.now(), // Use timestamp as a simple unique ID
        type: 'code',
        content: code
      };
      
      // Add the new cell to the current notebook
      const updatedCells = [...currentNotebook.cells, newCell];
      handleUpdateNotebook(updatedCells);
    }
  };

  // Toggle AI Assistant panel
  const toggleAIAssistant = () => {
    setShowAIAssistant(!showAIAssistant);
  };
  
  return (
    <LayoutContainer>
      <Header>
        <Logo>Neuralis</Logo>
        <MenuBar>
          <MenuItem>File</MenuItem>
          <MenuItem>Edit</MenuItem>
          <MenuItem>View</MenuItem>
          <MenuItem>Run</MenuItem>
          <MenuItem>Kernel</MenuItem>
          <MenuItem onClick={toggleAIAssistant}>
            {showAIAssistant ? 'Hide AI Assistant' : 'Show AI Assistant'}
          </MenuItem>
          <MenuItem>Help</MenuItem>
        </MenuBar>
      </Header>
      
      <MainContent>
        <SplitPane
          split="vertical"
          minSize={200}
          defaultSize={250}
          style={{ position: 'relative' }}
        >
          <Sidebar 
            onSelectNotebook={handleSelectNotebook}
            onCreateNotebook={handleCreateNotebook}
          />
          
          {showAIAssistant ? (
            <SplitPane
              split="vertical"
              minSize={300}
              defaultSize="70%"
              style={{ position: 'relative' }}
            >
              <Notebook 
                notebook={currentNotebook || defaultNotebook}
                onUpdateCells={handleUpdateNotebook}
              />
              <AmazonQPanel onInsertCode={handleInsertCode} />
            </SplitPane>
          ) : (
            <Notebook 
              notebook={currentNotebook || defaultNotebook}
              onUpdateCells={handleUpdateNotebook}
            />
          )}
        </SplitPane>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;
