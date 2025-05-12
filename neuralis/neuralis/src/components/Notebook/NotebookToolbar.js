import React from 'react';

const NotebookToolbar = ({
  onAddCodeCell,
  onAddMarkdownCell,
  onRunCell,
  onRunAll,
  onInterrupt,
  onRestart,
  isRunning,
  hasActiveCell,
  hasKernel
}) => {
  return (
    <div className="jp-toolbar-buttons">
      <button 
        className="jp-toolbar-button" 
        onClick={onAddCodeCell}
        title="Add Code Cell"
      >
        <span className="button-text">+ Code</span>
      </button>
      
      <button 
        className="jp-toolbar-button" 
        onClick={onAddMarkdownCell}
        title="Add Markdown Cell"
      >
        <span className="button-text">+ Markdown</span>
      </button>
      
      <button 
        className="jp-toolbar-button" 
        onClick={onRunCell}
        disabled={!hasActiveCell || !hasKernel || isRunning}
        title="Run Selected Cell"
      >
        <span className="button-text">▶ Run</span>
      </button>
      
      <button 
        className="jp-toolbar-button" 
        onClick={onRunAll}
        disabled={!hasKernel || isRunning}
        title="Run All Cells"
      >
        <span className="button-text">▶▶ Run All</span>
      </button>
      
      <button 
        className="jp-toolbar-button" 
        onClick={onInterrupt}
        disabled={!isRunning || !hasKernel}
        title="Interrupt Kernel"
      >
        <span className="button-text">⏹ Stop</span>
      </button>
      
      <button 
        className="jp-toolbar-button" 
        onClick={onRestart}
        disabled={!hasKernel}
        title="Restart Kernel"
      >
        <span className="button-text">↻ Restart</span>
      </button>
    </div>
  );
};

export default NotebookToolbar;
