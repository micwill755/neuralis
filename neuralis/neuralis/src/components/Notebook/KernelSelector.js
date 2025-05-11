import React, { useState, useEffect } from 'react';
import kernelService from '../../services/kernelService';
import './Notebook.css';

const KernelSelector = ({ onKernelChange }) => {
  const [kernels, setKernels] = useState([]);
  const [selectedKernel, setSelectedKernel] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize and fetch available kernels
  useEffect(() => {
    const initKernelService = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Initializing kernel service...');
        const initialized = await kernelService.initialize();
        
        if (initialized) {
          console.log('Kernel service initialized, fetching kernels...');
          const availableKernels = await kernelService.listKernels();
          console.log('Available kernels:', availableKernels);
          
          setKernels(availableKernels);
          
          // Set default kernel if available
          if (availableKernels.length > 0) {
            setSelectedKernel(availableKernels[0].name);
          }
        } else {
          setError('Failed to initialize kernel service');
        }
      } catch (err) {
        console.error('Error in kernel initialization:', err);
        setError(`Error: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    initKernelService();
  }, []);

  // Connect to the selected kernel
  const connectToKernel = async () => {
    if (!selectedKernel) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Connecting to kernel:', selectedKernel);
      const kernel = await kernelService.startKernel(selectedKernel);
      
      if (kernel) {
        console.log('Connected to kernel:', kernel);
        setIsConnected(true);
        if (onKernelChange) {
          onKernelChange(kernel);
        }
      } else {
        setError('Failed to connect to kernel');
      }
    } catch (err) {
      console.error('Failed to connect to kernel:', err);
      setError(`Connection error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Restart the current kernel
  const restartKernel = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const success = await kernelService.restartKernel();
      
      if (success) {
        console.log('Kernel restarted successfully');
        // Notify that kernel was restarted
        if (onKernelChange) {
          onKernelChange(kernelService.getActiveKernel());
        }
      } else {
        setError('Failed to restart kernel');
      }
    } catch (err) {
      console.error('Failed to restart kernel:', err);
      setError(`Restart error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle kernel selection change
  const handleKernelChange = (e) => {
    setSelectedKernel(e.target.value);
    setIsConnected(false);
  };

  // Manual refresh of kernels
  const refreshKernels = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const availableKernels = await kernelService.listKernels();
      setKernels(availableKernels);
    } catch (err) {
      setError(`Refresh error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="kernel-selector">
      <span className="kernel-label">Kernel:</span>
      <select 
        className="kernel-select"
        value={selectedKernel || ''}
        onChange={handleKernelChange}
        disabled={isLoading || isConnected}
      >
        <option value="">Select a kernel</option>
        {kernels.map(kernel => (
          <option key={kernel.id} value={kernel.name}>
            {kernel.displayName}
          </option>
        ))}
      </select>
      
      {!isConnected ? (
        <>
          <button 
            className="notebook-button"
            onClick={connectToKernel} 
            disabled={isLoading || !selectedKernel}
          >
            {isLoading ? 'Connecting...' : 'Connect'}
          </button>
          <button 
            className="notebook-button" 
            onClick={refreshKernels} 
            disabled={isLoading}
          >
            Refresh
          </button>
        </>
      ) : (
        <>
          <div className="kernel-status">
            <div className={`status-indicator ${isConnected ? 'active' : 'inactive'}`}></div>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          <button 
            className="notebook-button"
            onClick={restartKernel} 
            disabled={isLoading || !isConnected}
          >
            Restart
          </button>
        </>
      )}
      
      {error && <div style={{ color: '#e53935', fontSize: '0.85rem', marginLeft: '8px' }}>{error}</div>}
    </div>
  );
};

export default KernelSelector;
