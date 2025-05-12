import React, { useState, useEffect, useRef, useCallback } from 'react';
import Cell from './Cell';
import KernelSelector from './KernelSelector';
import kernelService from '../../services/kernelService';
import './Notebook.css';

const Notebook = ({ notebook, onUpdateCells }) => {
  const [cells, setCells] = useState([]);
  const [activeCell, setActiveCell] = useState(null);
  const [activeKernel, setActiveKernel] = useState(null);
  const [cellOutputs, setCellOutputs] = useState({});
  const [runningCell, setRunningCell] = useState(null);
  const previousNotebookRef = useRef(notebook);
  
  // Define addCell with useCallback to prevent it from changing on every render
  const addCell = useCallback((type, content = '', position = 'end') => {
    const newCell = {
      id: Date.now(), // Simple unique ID
      type: type,
      content: content || (type === 'markdown' ? '## New Markdown Cell' : '# New code cell')
    };
    
    setCells(prevCells => {
      if (position === 'end') {
        return [...prevCells, newCell];
      } else if (activeCell) {
        // Find the index of the active cell
        const activeIndex = prevCells.findIndex(cell => cell.id === activeCell);
        if (activeIndex >= 0) {
          // Insert after the active cell
          const newCells = [...prevCells];
          newCells.splice(activeIndex + 1, 0, newCell);
          return newCells;
        }
      }
      return [...prevCells, newCell];
    });
    
    setActiveCell(newCell.id);
    return newCell;
  }, [activeCell]);
  
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
        const newCell = addCell(cellType, code, 'after');
        
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
  }, [addCell]);
  
  const handleCellChange = (id, newContent) => {
    const updatedCells = cells.map(cell => 
      cell.id === id ? { ...cell, content: newContent } : cell
    );
    setCells(updatedCells);
  };
  
  const handleCellFocus = (id) => {
    setActiveCell(id);
  };
  
  const handleKernelChange = (kernel) => {
    setActiveKernel(kernel);
    console.log('Kernel connected:', kernel);
  };
  
  const runCell = async (cellId = null) => {
    // If cellId is provided, use it; otherwise use activeCell
    const cellToRunId = cellId || activeCell;
    
    if (!cellToRunId || !activeKernel) {
      console.log('Cannot run cell: No active cell or kernel');
      return;
    }
    
    const cellToRun = cells.find(cell => cell.id === cellToRunId);
    if (!cellToRun || cellToRun.type !== 'code') {
      console.log('Cannot run cell: Not a code cell');
      return;
    }
    
    try {
      setRunningCell(cellToRunId);
      
      // Clear previous output for this cell
      setCellOutputs(prev => ({
        ...prev,
        [cellToRunId]: { status: 'running', output: '' }
      }));
      
      // Execute the code in the kernel
      await kernelService.executeCode(cellToRun.content, (result) => {
        if (result.type === 'execute_result' || result.type === 'stream' || result.type === 'display_data') {
          // Update the output for this cell
          setCellOutputs(prev => {
            const currentOutput = prev[cellToRunId]?.output || '';
            const currentImageData = prev[cellToRunId]?.imageData;
            
            return {
              ...prev,
              [cellToRunId]: {
                status: 'success',
                output: result.content ? currentOutput + result.content : currentOutput,
                imageData: result.imageData || currentImageData,
                executionCount: result.executionCount || prev[cellToRunId]?.executionCount,
                contentType: result.contentType || prev[cellToRunId]?.contentType
              }
            };
          });
        } else if (result.type === 'error') {
          setCellOutputs(prev => ({
            ...prev,
            [cellToRunId]: {
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
        [cellToRunId]: {
          status: 'error',
          output: error.message
        }
      }));
      setRunningCell(null);
    }
  };
  
  const deleteCell = () => {
    if (!activeCell) return;
    
    setCells(prevCells => prevCells.filter(cell => cell.id !== activeCell));
    setActiveCell(null);
  };
  
  const moveCellUp = () => {
    if (!activeCell) return;
    
    setCells(prevCells => {
      const index = prevCells.findIndex(cell => cell.id === activeCell);
      if (index <= 0) return prevCells;
      
      const newCells = [...prevCells];
      const temp = newCells[index];
      newCells[index] = newCells[index - 1];
      newCells[index - 1] = temp;
      
      return newCells;
    });
  };
  
  const moveCellDown = () => {
    if (!activeCell) return;
    
    setCells(prevCells => {
      const index = prevCells.findIndex(cell => cell.id === activeCell);
      if (index < 0 || index >= prevCells.length - 1) return prevCells;
      
      const newCells = [...prevCells];
      const temp = newCells[index];
      newCells[index] = newCells[index + 1];
      newCells[index + 1] = temp;
      
      return newCells;
    });
  };
  
  if (!notebook) {
    return <div>No notebook selected</div>;
  }
  
  return (
    <div className="notebook-container">
      <div className="notebook-header">
        <h1 className="notebook-title">{notebook.name}</h1>
        <KernelSelector onKernelChange={handleKernelChange} />
      </div>
      
      <div className="notebook-content">
        <div className="button-group">
          <button 
            className={`notebook-button run-button ${(!activeCell || !activeKernel || runningCell !== null) ? 'disabled' : ''}`}
            onClick={() => runCell()} 
            disabled={!activeCell || !activeKernel || runningCell !== null}
          >
            {runningCell === activeCell ? '⏳' : '▶'} {runningCell === activeCell ? 'Running...' : 'Run'}
          </button>
          <button className="notebook-button" onClick={() => addCell('code', '', 'after')}>+ Code</button>
          <button className="notebook-button" onClick={() => addCell('markdown', '', 'after')}>+ Markdown</button>
          <button className="notebook-button" onClick={deleteCell} disabled={!activeCell}>Delete</button>
          <button className="notebook-button" onClick={moveCellUp} disabled={!activeCell}>↑</button>
          <button className="notebook-button" onClick={moveCellDown} disabled={!activeCell}>↓</button>
        </div>
        
        {cells.map((cell, index) => (
          <div id={`cell-${cell.id}`} key={cell.id}>
            <Cell
              id={cell.id}
              type={cell.type}
              content={cell.content}
              isActive={activeCell === cell.id}
              onChange={handleCellChange}
              onFocus={handleCellFocus}
              output={cellOutputs[cell.id]}
              onRunCell={runCell}
            />
            {index === cells.length - 1 && (
              <button className="add-cell-button" onClick={() => addCell('code')}>Add cell</button>
            )}
          </div>
        ))}
        
        {cells.length === 0 && (
          <button className="add-cell-button" onClick={() => addCell('code')}>Add cell</button>
        )}
      </div>
    </div>
  );
};

export default Notebook;