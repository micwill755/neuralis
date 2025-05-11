import React, { useState, useEffect } from 'react';
import KernelSetupScreen from '../kernel/KernelSetupScreen';
import { connectToKernel, listAvailableKernels } from '../../services/kernelService';
import { getKernelConfig } from '../../services/storageService';
import './NotebookToolbar.css';

function NotebookToolbar({ onKernelConnect, activeKernel }) {
  const [showKernelSetup, setShowKernelSetup] = useState(false);
  const [availableKernels, setAvailableKernels] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  
  // Load available kernels
  useEffect(() => {
    const loadKernels = async () => {
      const kernels = await listAvailableKernels();
      setAvailableKernels(kernels);
    };
    
    loadKernels();
  }, []);
  
  // Handle kernel setup completion
  const handleSetupComplete = async (config) => {
    try {
      setIsConnecting(true);
      setConnectionError(null);
      
      // Connect to the newly created kernel
      const connectionInfo = await connectToKernel(config);
      
      // Update available kernels
      const kernels = await listAvailableKernels();
      setAvailableKernels(kernels);
      
      // Notify parent component
      onKernelConnect(connectionInfo);
    } catch (error) {
      setConnectionError(error.message);
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Handle kernel selection
  const handleKernelSelect = async (kernel) => {
    try {
      setIsConnecting(true);
      setConnectionError(null);
      
      // Connect to the selected kernel
      const connectionInfo = await connectToKernel(kernel);
      
      // Notify parent component
      onKernelConnect(connectionInfo);
    } catch (error) {
      setConnectionError(error.message);
    } finally {
      setIsConnecting(false);
    }
  };
  
  return (
    <div className="notebook-toolbar">
      <div className="toolbar-section">
        <button className="toolbar-button">
          <i className="fa fa-save"></i> Save
        </button>
        <button className="toolbar-button">
          <i className="fa fa-plus"></i> New Cell
        </button>
        <button className="toolbar-button">
          <i className="fa fa-play"></i> Run
        </button>
      </div>
      
      <div className="toolbar-section kernel-section">
        <div className="kernel-status">
          {activeKernel ? (
            <span className="kernel-connected">
              <i className="fa fa-circle"></i> 
              {activeKernel.kernelType === 'conda' 
                ? `Conda: ${activeKernel.environmentName}` 
                : `Docker: ${activeKernel.containerName || 'Python'}`}
            </span>
          ) : (
            <span className="kernel-disconnected">
              <i className="fa fa-circle-o"></i> No Kernel
            </span>
          )}
        </div>
        
        <div className="kernel-actions">
          <button 
            className="toolbar-button kernel-connect-button"
            onClick={() => setShowKernelSetup(true)}
          >
            <i className="fa fa-plug"></i>
            <span className="setup-icon">⚙️</span>
          </button>
          
          {availableKernels.length > 0 && (
            <div className="kernel-dropdown">
              <button className="toolbar-button">
                <i className="fa fa-chevron-down"></i>
              </button>
              
              <div className="kernel-dropdown-content">
                <h4>Available Kernels</h4>
                {availableKernels.map((kernel, index) => (
                  <button 
                    key={index}
                    className="kernel-option"
                    onClick={() => handleKernelSelect(kernel)}
                  >
                    {kernel.type === 'conda' ? (
                      <span>
                        <i className="kernel-icon conda-icon"></i>
                        {kernel.display_name || `Python (${kernel.environmentName})`}
                      </span>
                    ) : (
                      <span>
                        <i className="kernel-icon docker-icon"></i>
                        {kernel.display_name || `Python (${kernel.containerName})`}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {showKernelSetup && (
        <KernelSetupScreen 
          onClose={() => setShowKernelSetup(false)}
          onSetupComplete={handleSetupComplete}
        />
      )}
      
      {isConnecting && (
        <div className="kernel-connecting">
          <div className="spinner"></div>
          <span>Connecting to kernel...</span>
        </div>
      )}
      
      {connectionError && (
        <div className="kernel-error">
          <i className="fa fa-exclamation-triangle"></i>
          <span>{connectionError}</span>
          <button onClick={() => setConnectionError(null)}>Dismiss</button>
        </div>
      )}
    </div>
  );
}

export default NotebookToolbar;
