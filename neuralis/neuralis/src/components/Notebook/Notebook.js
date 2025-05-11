import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import Cell from './Cell';
import KernelSelector from './KernelSelector';
import kernelService from '../../services/kernelService';

const NotebookContainer = styled.div`
  padding: 20px;
  background-color: white;
  height: 100%;
  overflow: auto;
`;

const NotebookTitle = styled.h1`
  margin-top: 0;
  margin-bottom: 20px;
`;

const AddCellButton = styled.button`
  background-color: #f1f1f1;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px 10px;
  margin-top: 10px;
  cursor: pointer;
  
  &:hover {
    background-color: #e9e9e9;
  }
`;

const KernelInfo = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const KernelIcon = styled.div`
  width: 20px;
  height: 20px;
  margin-right: 10px;
  
  img {
    max-width: 100%;
    max-height: 100%;
  }
`;

const Notebook = ({ notebook, onSave }) => {
  const [cells, setCells] = useState([]);
  const [activeCell, setActiveCell] = useState(null);
  const [activeKernel, setActiveKernel] = useState(null);
  const previousNotebookRef = useRef(notebook);
  
  // Initialize cells from notebook
  useEffect(() => {
    if (notebook && notebook.cells && notebook !== previousNotebookRef.current) {
      setCells(notebook.cells);
      previousNotebookRef.current = notebook;
      setActiveCell(null);
    }
  }, [notebook]);
  
  // Handle kernel change
  const handleKernelChange = (kernel) => {
    console.log('Kernel changed:', kernel);
    setActiveKernel(kernel);
  };
  
  // Add a new cell
  const addCell = (type = 'code') => {
    const newCell = {
      id: Date.now().toString(),
      type,
      content: '',
      outputs: []
    };
    
    setCells(prevCells => [...prevCells, newCell]);
  };
  
  // Update cell content
  const updateCellContent = (id, content) => {
    setCells(prevCells => 
      prevCells.map(cell => 
        cell.id === id ? { ...cell, content } : cell
      )
    );
  };
  
  // Execute a cell
  const executeCell = async (id) => {
    if (!activeKernel) {
      alert('Please connect to a kernel first');
      return;
    }
    
    const cell = cells.find(c => c.id === id);
    if (!cell || cell.type !== 'code') return;
    
    try {
      // Update cell to show it's executing
      setCells(prevCells => 
        prevCells.map(c => 
          c.id === id ? { ...c, executing: true, outputs: [] } : c
        )
      );
      
      console.log(`Executing cell in kernel: ${activeKernel.name} (${activeKernel.type})`);
      
      // Execute the code
      const result = await kernelService.executeCode(cell.content);
      
      // Update cell with outputs
      setCells(prevCells => 
        prevCells.map(c => 
          c.id === id ? { ...c, executing: false, outputs: result.outputs } : c
        )
      );
      
      // If this is the last cell, automatically add a new code cell
      const cellIndex = cells.findIndex(c => c.id === id);
      if (cellIndex === cells.length - 1) {
        addCell('code');
      }
    } catch (error) {
      console.error('Error executing cell:', error);
      
      // Update cell with error
      setCells(prevCells => 
        prevCells.map(c => 
          c.id === id ? { 
            ...c, 
            executing: false, 
            outputs: [{ 
              output_type: 'error',
              ename: 'Error',
              evalue: error.message,
              traceback: [error.stack]
            }] 
          } : c
        )
      );
    }
  };
  
  // Save the notebook
  const saveNotebook = () => {
    if (onSave) {
      onSave({
        ...notebook,
        cells,
        lastSaved: new Date().toISOString(),
        kernel: activeKernel ? {
          name: activeKernel.name,
          type: activeKernel.type
        } : null
      });
    }
  };
  
  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    // Ctrl+S to save
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      saveNotebook();
    }
  }, [saveNotebook]);
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  // Listen for insertCodeToNotebook event from Amazon Q
  useEffect(() => {
    const handleInsertCode = (event) => {
      const { code, cellType } = event.detail;
      
      // Create a new cell with the code
      const newCell = {
        id: Date.now().toString(),
        type: cellType || 'code',
        content: code,
        outputs: []
      };
      
      setCells(prevCells => [...prevCells, newCell]);
    };
    
    window.addEventListener('insertCodeToNotebook', handleInsertCode);
    
    return () => {
      window.removeEventListener('insertCodeToNotebook', handleInsertCode);
    };
  }, []);

  return (
    <NotebookContainer>
      <NotebookTitle>{notebook?.name || 'Untitled Notebook'}</NotebookTitle>
      
      <KernelSelector onKernelChange={handleKernelChange} />
      
      {activeKernel && (
        <KernelInfo>
          <KernelIcon>
            {activeKernel.type === 'conda' && <img src="/icons/conda.png" alt="Conda" />}
            {activeKernel.type === 'docker' && <img src="/icons/docker.png" alt="Docker" />}
            {activeKernel.type === 'terminal' && <img src="/icons/terminal.png" alt="Terminal" />}
          </KernelIcon>
          <div>
            <strong>Active Kernel:</strong> {activeKernel.displayName || activeKernel.name}
          </div>
        </KernelInfo>
      )}
      
      {cells.map((cell, index) => (
        <Cell
          key={cell.id}
          cell={cell}
          isActive={activeCell === cell.id}
          onActivate={() => setActiveCell(cell.id)}
          onChange={(content) => updateCellContent(cell.id, content)}
          onExecute={() => executeCell(cell.id)}
        />
      ))}
      
      <div>
        <AddCellButton onClick={() => addCell('code')}>+ Add Code Cell</AddCellButton>
        <AddCellButton onClick={() => addCell('markdown')} style={{ marginLeft: '10px' }}>+ Add Markdown Cell</AddCellButton>
        <AddCellButton onClick={saveNotebook} style={{ marginLeft: '10px' }}>Save Notebook</AddCellButton>
      </div>
    </NotebookContainer>
  );
};

export default Notebook;
