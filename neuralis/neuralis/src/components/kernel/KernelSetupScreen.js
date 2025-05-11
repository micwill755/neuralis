import React, { useState, useEffect } from 'react';
import CondaSetupForm from './CondaSetupForm';
import DockerSetupForm from './DockerSetupForm';
import './KernelSetupScreen.css';

function KernelSetupScreen({ onClose, onSetupComplete, initialType = null }) {
  const [setupType, setSetupType] = useState(initialType);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Set initial type if provided
  useEffect(() => {
    if (initialType) {
      setSetupType(initialType);
    }
  }, [initialType]);
  
  // Handle setup completion
  const handleSetupComplete = (config) => {
    // Save configuration and close
    onSetupComplete(config);
    onClose();
  };
  
  return (
    <div className="kernel-setup-overlay">
      <div className="kernel-setup-screen">
        <div className="kernel-setup-header">
          <h2>Set Up Python Kernel</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        {error && (
          <div className="setup-error">
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}
        
        {isLoading ? (
          <div className="setup-loading">
            <div className="spinner"></div>
            <p>Setting up your kernel environment...</p>
          </div>
        ) : !setupType ? (
          <div className="setup-options">
            <div 
              className="setup-option" 
              onClick={() => setSetupType('conda')}
            >
              <div className="setup-option-icon conda-icon"></div>
              <h3>Conda Environment</h3>
              <p>Use a local Conda environment as your Python kernel</p>
            </div>
            
            <div 
              className="setup-option" 
              onClick={() => setSetupType('docker')}
            >
              <div className="setup-option-icon docker-icon"></div>
              <h3>Docker Container</h3>
              <p>Run your Python kernel in an isolated Docker container</p>
            </div>
          </div>
        ) : setupType === 'conda' ? (
          <CondaSetupForm 
            onComplete={handleSetupComplete} 
            onBack={() => setSetupType(null)}
            setIsLoading={setIsLoading}
            setError={setError}
          />
        ) : (
          <DockerSetupForm 
            onComplete={handleSetupComplete} 
            onBack={() => setSetupType(null)}
            setIsLoading={setIsLoading}
            setError={setError}
          />
        )}
      </div>
    </div>
  );
}

export default KernelSetupScreen;
