import React, { useState } from 'react';
import styled from 'styled-components';
import KernelSelector from '../kernel/KernelSelector';

const ToolbarContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
`;

const ToolbarGroup = styled.div`
  display: flex;
  align-items: center;
  margin-right: 16px;
`;

const ToolbarButton = styled.button`
  background-color: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 6px 12px;
  margin-right: 8px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: #e0e0e0;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg, img {
    margin-right: 6px;
    width: 16px;
    height: 16px;
  }
`;

const KernelButton = styled(ToolbarButton)`
  background-color: ${props => props.active ? '#e3f2fd' : 'transparent'};
  border-color: ${props => props.active ? '#2196f3' : '#e0e0e0'};
  
  &:hover {
    background-color: ${props => props.active ? '#bbdefb' : '#e0e0e0'};
  }
`;

const KernelStatus = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #757575;
  
  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 8px;
    background-color: ${props => props.active ? '#4caf50' : '#bdbdbd'};
  }
`;

const KernelIcon = styled.div`
  width: 20px;
  height: 20px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    max-width: 100%;
    max-height: 100%;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 4px;
  width: 600px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

function NotebookToolbar({ onRunCell, onAddCell, onSaveNotebook, activeKernel, onKernelSelect }) {
  const [showKernelSelector, setShowKernelSelector] = useState(false);
  
  const handleKernelSelect = (kernel) => {
    setShowKernelSelector(false);
    if (onKernelSelect) {
      onKernelSelect(kernel);
    }
  };
  
  return (
    <ToolbarContainer>
      <ToolbarGroup>
        <ToolbarButton onClick={onRunCell} title="Run Cell">
          <i className="fas fa-play"></i> Run
        </ToolbarButton>
        <ToolbarButton onClick={onAddCell} title="Add Cell">
          <i className="fas fa-plus"></i> Add Cell
        </ToolbarButton>
        <ToolbarButton onClick={onSaveNotebook} title="Save Notebook">
          <i className="fas fa-save"></i> Save
        </ToolbarButton>
      </ToolbarGroup>
      
      <ToolbarGroup>
        <KernelButton 
          onClick={() => setShowKernelSelector(true)}
          title="Select Kernel"
          active={showKernelSelector}
        >
          {activeKernel ? (
            <>
              <KernelIcon>
                {activeKernel.type === 'conda' && <img src="/icons/conda.png" alt="Conda" />}
                {activeKernel.type === 'docker' && <img src="/icons/docker.png" alt="Docker" />}
                {activeKernel.type === 'terminal' && <img src="/icons/terminal.png" alt="Terminal" />}
              </KernelIcon>
              {activeKernel.displayName || activeKernel.name}
            </>
          ) : (
            <>
              <i className="fas fa-microchip"></i> Select Kernel
            </>
          )}
        </KernelButton>
      </ToolbarGroup>
      
      {activeKernel && (
        <KernelStatus active={activeKernel.status === 'active'}>
          <div className="status-indicator"></div>
          {activeKernel.status === 'active' ? 'Running' : 'Idle'}
        </KernelStatus>
      )}
      
      {showKernelSelector && (
        <Modal onClick={() => setShowKernelSelector(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <KernelSelector onKernelSelect={handleKernelSelect} />
          </ModalContent>
        </Modal>
      )}
    </ToolbarContainer>
  );
}

export default NotebookToolbar;
