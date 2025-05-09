import React, { useState, useEffect, useRef } from 'react';
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
  border: 1px dashed #ccc;
  border-radius: 4px;
  padding: 8px 16px;
  margin: 10px 0;
  width: 100%;
  text-align: center;
  cursor: pointer;
  color: #666;
  
  &:hover {
    background-color: #e9e9e9;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const Button = styled.button`
  background-color: #f1f1f1;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  
  &:hover {
    background-color: #e9e9e9;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const Notebook = ({ notebook, onUpdateCells }) => {
  const [cells, setCells] = useState([]);
  const [activeCell, setActiveCell] = useState(null);
  const [activeKernel, setActiveKernel] = useState(null);
  const [cellOutputs, setCellOutputs] = useState({});
  const [runningCell, setRunningCell] = useState(null);
  const previousNotebookRef = useRef(notebook);
  
  useEffect(() => {
    if (notebook && notebook.cells && notebook !== previousNotebookRef.current) {
      setCells(notebook.cells);
      previousNotebookRef.current = notebook;
    }
  }, [notebook]);
  
  // Reset active cell when switching notebooks
  useEffect(() => {
    setActiveCell(null);
  }, [notebook]);
  
  // Update parent component when cells change
  useEffect(() => {
    if (onUpdateCells && cells.length > 0) {
      onUpdateCells(cells);
    }
  }, [cells, onUpdateCells]);
  
  // Listen for code insertion events from Amazon Q
  useEffect(() => {
    const handleInsertCode = (event) => {
      const { code, cellType = 'code' } = event.detail;
      
      if (code) {
        // Add a new cell with the generated code
        const newCell = addCell(cellType, code);
        
        // Scroll to the new cell (if needed)
        setTimeout(() => {
          const cellElement = document.getElementById(`cell-${newCell.id}`);
          if (cellElement) {
            cellElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    };
    
    window.addEventListener('insertCodeToNotebook', handleInsertCode);
    return () => {
      window.removeEventListener('insertCodeToNotebook', handleInsertCode);
    };
  }, []);
  
  const handleCellChange = (id, newContent) => {
    const updatedCells = cells.map(cell => 
      cell.id === id ? { ...cell, content: newContent } : cell
    );
    setCells(updatedCells);
  };
  
  const handleCellFocus = (id) => {
    setActiveCell(id);
  };
  
  const addCell = (type, content = '') => {
    const newCell = {
      id: Date.now(), // Simple unique ID
      type: type,
      content: content || (type === 'markdown' ? '## New Markdown Cell' : '# New code cell')
    };
    
    setCells([...cells, newCell]);
    setActiveCell(newCell.id);
    return newCell;
  };
  
  const handleKernelChange = (kernel) => {
    setActiveKernel(kernel);
    console.log('Kernel connected:', kernel);
  };
  
  const runCell = async () => {
    if (!activeCell || !activeKernel) {
      console.log('Cannot run cell: No active cell or kernel');
      return;
    }
    
    const cellToRun = cells.find(cell => cell.id === activeCell);
    if (!cellToRun || cellToRun.type !== 'code') {
      console.log('Cannot run cell: Not a code cell');
      return;
    }
    
    try {
      setRunningCell(activeCell);
      
      // Clear previous output for this cell
      setCellOutputs(prev => ({
        ...prev,
        [activeCell]: { status: 'running', output: '' }
      }));
      
      // Execute the code in the kernel
      await kernelService.executeCode(cellToRun.content, (result) => {
        if (result.type === 'execute_result' || result.type === 'stream' || result.type === 'display_data') {
          // Update the output for this cell
          setCellOutputs(prev => {
            const currentOutput = prev[activeCell]?.output || '';
            const currentImageData = prev[activeCell]?.imageData;
            
            return {
              ...prev,
              [activeCell]: {
                status: 'success',
                output: result.content ? currentOutput + result.content : currentOutput,
                imageData: result.imageData || currentImageData,
                executionCount: result.executionCount || prev[activeCell]?.executionCount
              }
            };
          });
        } else if (result.type === 'error') {
          setCellOutputs(prev => ({
            ...prev,
            [activeCell]: {
              status: 'error',
              output: result.content
            }
          }));
          setRunningCell(null);
        } else if (result.type === 'execution_complete') {
          setRunningCell(null);
        }
      });
    } catch (error) {
      console.error('Error running cell:', error);
      setCellOutputs(prev => ({
        ...prev,
        [activeCell]: {
          status: 'error',
          output: error.message
        }
      }));
      setRunningCell(null);
    }
  };
  
  if (!notebook) {
    return <div>No notebook selected</div>;
  }
  
  return (
    <NotebookContainer>
      <NotebookTitle>{notebook.name}</NotebookTitle>
      
      {/* Add Kernel Selector */}
      <KernelSelector onKernelChange={handleKernelChange} />
      
      <ButtonGroup>
        <Button onClick={() => addCell('code')}>Add Code Cell</Button>
        <Button onClick={() => addCell('markdown')}>Add Markdown Cell</Button>
        <Button 
          onClick={runCell} 
          disabled={!activeCell || !activeKernel || runningCell !== null}
        >
          {runningCell === activeCell ? 'Running...' : 'Run Cell'}
        </Button>
      </ButtonGroup>
      
      {cells.map(cell => (
        <div id={`cell-${cell.id}`} key={cell.id}>
          <Cell
            id={cell.id}
            type={cell.type}
            content={cell.content}
            isActive={activeCell === cell.id}
            onChange={handleCellChange}
            onFocus={handleCellFocus}
            output={cellOutputs[cell.id]}
          />
        </div>
      ))}
      
      <AddCellButton onClick={() => addCell('code')}>+ Add Cell</AddCellButton>
    </NotebookContainer>
  );
};

export default Notebook;
