import React, { useState, useEffect, useRef } from 'react';
import Cell from './Cell';
import KernelSelector from './KernelSelector';
import NotebookToolbar from './NotebookToolbar';
import kernelService from '../../services/kernelService';

const Notebook = ({ notebook, onUpdateCells }) => {
  const [cells, setCells] = useState([]);
  const [activeCell, setActiveCell] = useState(null);
  const [activeKernel, setActiveKernel] = useState(null);
  const [cellOutputs, setCellOutputs] = useState({});
  const [runningCell, setRunningCell] = useState(null);
  const [kernelStatus, setKernelStatus] = useState('offline'); // 'idle', 'busy', 'offline'
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
  
  const addCell = (type, content = '', position = 'end') => {
    const newCell = {
      id: Date.now(), // Simple unique ID
      type: type,
      content: content || (type === 'markdown' ? '## New Markdown Cell' : '# New code cell')
    };
    
    if (position === 'end') {
      setCells([...cells, newCell]);
    } else if (position === 'start') {
      setCells([newCell, ...cells]);
    } else if (activeCell) {
      // Insert after active cell
      const activeIndex = cells.findIndex(cell => cell.id === activeCell);
      if (activeIndex !== -1) {
        const newCells = [...cells];
        newCells.splice(activeIndex + 1, 0, newCell);
        setCells(newCells);
      } else {
        setCells([...cells, newCell]);
      }
    } else {
      setCells([...cells, newCell]);
    }
    
    setActiveCell(newCell.id);
    return newCell;
  };
  
  const handleKernelChange = (kernel) => {
    setActiveKernel(kernel);
    setKernelStatus(kernel ? 'idle' : 'offline');
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
      setKernelStatus('busy');
      
      // Clear previous output for this cell
      setCellOutputs(prev => ({
        ...prev,
        [activeCell]: { status: 'running', output: '' }
      }));
      
      // Execute the code in the kernel
      await kernelService.executeCode(cellToRun.content, (result) => {
        if (result.type === 'execute_result' || result.type === 'stream' || result.type === 'display_data') {
          // Update the output for this cell
          setCellOutputs(prev => ({
            ...prev,
            [activeCell]: {
              status: 'success',
              output: (prev[activeCell]?.output || '') + result.content,
              imageData: result.imageData,
              executionCount: result.executionCount
            }
          }));
        } else if (result.type === 'error') {
          setCellOutputs(prev => ({
            ...prev,
            [activeCell]: {
              status: 'error',
              output: result.content
            }
          }));
          setRunningCell(null);
          setKernelStatus('idle');
        } else if (result.type === 'execution_complete') {
          setRunningCell(null);
          setKernelStatus('idle');
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
      setKernelStatus('idle');
    }
  };
  
  const runAllCells = async () => {
    if (!activeKernel) return;
    
    const codeCells = cells.filter(cell => cell.type === 'code');
    if (codeCells.length === 0) return;
    
    for (const cell of codeCells) {
      setActiveCell(cell.id);
      setRunningCell(cell.id);
      setKernelStatus('busy');
      
      // Clear previous output for this cell
      setCellOutputs(prev => ({
        ...prev,
        [cell.id]: { status: 'running', output: '' }
      }));
      
      try {
        // Execute the code in the kernel
        await new Promise((resolve) => {
          kernelService.executeCode(cell.content, (result) => {
            if (result.type === 'execute_result' || result.type === 'stream' || result.type === 'display_data') {
              // Update the output for this cell
              setCellOutputs(prev => ({
                ...prev,
                [cell.id]: {
                  status: 'success',
                  output: (prev[cell.id]?.output || '') + result.content,
                  imageData: result.imageData,
                  executionCount: result.executionCount
                }
              }));
            } else if (result.type === 'error') {
              setCellOutputs(prev => ({
                ...prev,
                [cell.id]: {
                  status: 'error',
                  output: result.content
                }
              }));
              resolve();
            } else if (result.type === 'execution_complete') {
              resolve();
            }
          });
        });
      } catch (error) {
        console.error('Error running cell:', error);
        setCellOutputs(prev => ({
          ...prev,
          [cell.id]: {
            status: 'error',
            output: error.message
          }
        }));
      }
    }
    
    setRunningCell(null);
    setKernelStatus('idle');
  };
  
  const deleteCell = (id) => {
    const cellIndex = cells.findIndex(cell => cell.id === id);
    if (cellIndex === -1) return;
    
    const newCells = cells.filter(cell => cell.id !== id);
    setCells(newCells);
    
    // Set active cell to the previous cell or the next cell if available
    if (newCells.length > 0) {
      if (cellIndex > 0) {
        setActiveCell(newCells[cellIndex - 1].id);
      } else {
        setActiveCell(newCells[0].id);
      }
    } else {
      setActiveCell(null);
    }
  };
  
  const moveCellUp = (id) => {
    const cellIndex = cells.findIndex(cell => cell.id === id);
    if (cellIndex <= 0) return;
    
    const newCells = [...cells];
    const temp = newCells[cellIndex];
    newCells[cellIndex] = newCells[cellIndex - 1];
    newCells[cellIndex - 1] = temp;
    
    setCells(newCells);
  };
  
  const moveCellDown = (id) => {
    const cellIndex = cells.findIndex(cell => cell.id === id);
    if (cellIndex === -1 || cellIndex >= cells.length - 1) return;
    
    const newCells = [...cells];
    const temp = newCells[cellIndex];
    newCells[cellIndex] = newCells[cellIndex + 1];
    newCells[cellIndex + 1] = temp;
    
    setCells(newCells);
  };
  
  const restartKernel = async () => {
    if (!activeKernel) return;
    
    setKernelStatus('offline');
    const success = await kernelService.restartKernel();
    if (success) {
      // Clear all outputs
      const clearedOutputs = {};
      cells.forEach(cell => {
        clearedOutputs[cell.id] = null;
      });
      setCellOutputs(clearedOutputs);
      setKernelStatus('idle');
    } else {
      console.error('Failed to restart kernel');
    }
  };
  
  const interruptKernel = async () => {
    if (!activeKernel || !runningCell) return;
    
    const success = await kernelService.interruptKernel();
    if (success) {
      setRunningCell(null);
      setKernelStatus('idle');
    }
  };
  
  if (!notebook) {
    return <div className="jp-notebook-panel">No notebook selected</div>;
  }
  
  return (
    <div className="jp-content-area">
      <div className="jp-notebook-toolbar">
        <h3 className="notebook-title">{notebook.name}</h3>
        
        <NotebookToolbar 
          onAddCodeCell={() => addCell('code', '', 'after')}
          onAddMarkdownCell={() => addCell('markdown', '', 'after')}
          onRunCell={runCell}
          onRunAll={runAllCells}
          onInterrupt={interruptKernel}
          onRestart={restartKernel}
          isRunning={runningCell !== null}
          hasActiveCell={activeCell !== null}
          hasKernel={activeKernel !== null}
        />
        
        <div className="jp-kernel-indicator">
          <div className={`jp-kernel-status ${kernelStatus}`}></div>
          <KernelSelector onKernelChange={handleKernelChange} />
        </div>
      </div>
      
      <div className="jp-notebook-panel">
        {cells.map(cell => (
          <div id={`cell-${cell.id}`} key={cell.id} className="jp-cell">
            <Cell
              id={cell.id}
              type={cell.type}
              content={cell.content}
              isActive={activeCell === cell.id}
              isRunning={runningCell === cell.id}
              onChange={handleCellChange}
              onFocus={handleCellFocus}
              output={cellOutputs[cell.id]}
              onDelete={() => deleteCell(cell.id)}
              onMoveUp={() => moveCellUp(cell.id)}
              onMoveDown={() => moveCellDown(cell.id)}
              onRun={() => {
                setActiveCell(cell.id);
                runCell();
              }}
            />
          </div>
        ))}
        
        <div className="jp-add-cell" onClick={() => addCell('code')}>
          + Add Cell
        </div>
      </div>
    </div>
  );
};

export default Notebook;