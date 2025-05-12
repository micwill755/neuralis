import React, { useState, useEffect } from 'react';
import kernelService from '../../services/kernelService';
import directPythonService from '../../services/directPythonService';
import './Notebook.css';

const KernelSelector = ({ onKernelChange }) => {
  const [kernels, setKernels] = useState([]);
  const [selectedKernel, setSelectedKernel] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kernelType, setKernelType] = useState('jupyter'); // 'jupyter' or 'direct'

  // Initialize and fetch available kernels
  useEffect(() => {
    const initKernelServices = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Initializing kernel services...');
        
        // Initialize both kernel services
        const jupyterInitialized = await kernelService.initialize();
        const directInitialized = await directPythonService.initialize();
        
        if (jupyterInitialized || directInitialized) {
          console.log('Kernel services initialized, fetching kernels...');
          
          // Get kernels from both services
          const availableJupyterKernels = jupyterInitialized ? await kernelService.listKernels() : [];
          const availableDirectKernels = directInitialized ? await directPythonService.listPythonEnvironments() : [];
          
          // Add source information to each kernel
          const jupyterKernelsWithSource = availableJupyterKernels.map(kernel => ({
            ...kernel,
            source: 'jupyter',
            displayName: `Jupyter: ${kernel.displayName}`
          }));
          
          const directKernelsWithSource = availableDirectKernels.map(kernel => ({
            ...kernel,
            source: 'direct'
          }));
          
          // Combine kernels from both sources
          const allKernels = [...jupyterKernelsWithSource, ...directKernelsWithSource];
          console.log('Available kernels:', allKernels);
          
          setKernels(allKernels);
          
          // Set default kernel if available
          if (allKernels.length > 0) {
            setSelectedKernel(allKernels[0].id);
            setKernelType(allKernels[0].source);
          }
        } else {
          setError('Failed to initialize kernel services');
        }
      } catch (err) {
        console.error('Error in kernel initialization:', err);
        setError(`Error: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    initKernelServices();
  }, []);
  
  // Add a listener for kernel updates
  useEffect(() => {
    const handleKernelUpdate = () => {
      refreshKernels();
    };
    
    // Listen for kernel updates
    window.addEventListener('kernelUpdated', handleKernelUpdate);
    
    return () => {
      window.removeEventListener('kernelUpdated', handleKernelUpdate);
    };
  }, []);

  // Connect to the selected kernel
  const connectToKernel = async () => {
    if (!selectedKernel) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Connecting to kernel:', selectedKernel, 'type:', kernelType);
      
      let kernel;
      if (kernelType === 'jupyter') {
        // Connect to Jupyter kernel
        const selectedKernelObj = kernels.find(k => k.id === selectedKernel);
        kernel = await kernelService.startKernel(selectedKernelObj.name);
      } else {
        // Connect to direct Python kernel
        kernel = await directPythonService.startKernel(selectedKernel);
      }
      
      if (kernel) {
        console.log('Connected to kernel:', kernel);
        setIsConnected(true);
        if (onKernelChange) {
          // Add the service type to the kernel object
          onKernelChange({
            ...kernel,
            serviceType: kernelType
          });
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
      
      let success;
      if (kernelType === 'jupyter') {
        success = await kernelService.restartKernel();
      } else {
        // For direct Python, stop and start again
        await directPythonService.stopKernel();
        success = await directPythonService.startKernel(selectedKernel);
      }
      
      if (success) {
        console.log('Kernel restarted successfully');
        // Notify that kernel was restarted
        if (onKernelChange) {
          const kernel = kernelType === 'jupyter' 
            ? kernelService.getActiveKernel()
            : directPythonService.getActiveKernel();
            
          onKernelChange({
            ...kernel,
            serviceType: kernelType
          });
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
    const kernelId = e.target.value;
    setSelectedKernel(kernelId);
    
    // Find the selected kernel to determine its type
    const selectedKernelObj = kernels.find(k => k.id === kernelId);
    if (selectedKernelObj) {
      setKernelType(selectedKernelObj.source);
    }
    
    setIsConnected(false);
  };

  // Manual refresh of kernels
  const refreshKernels = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get kernels from both services
      const availableJupyterKernels = await kernelService.listKernels();
      const availableDirectKernels = await directPythonService.listPythonEnvironments();
      
      // Add source information to each kernel
      const jupyterKernelsWithSource = availableJupyterKernels.map(kernel => ({
        ...kernel,
        source: 'jupyter',
        displayName: `Jupyter: ${kernel.displayName}`
      }));
      
      const directKernelsWithSource = availableDirectKernels.map(kernel => ({
        ...kernel,
        source: 'direct'
      }));
      
      // Combine kernels from both sources
      const allKernels = [...jupyterKernelsWithSource, ...directKernelsWithSource];
      console.log('Refreshed kernels:', allKernels);
      
      setKernels(allKernels);
      
      // If we don't have a selected kernel yet but have available kernels, select the first one
      if (!selectedKernel && allKernels.length > 0) {
        setSelectedKernel(allKernels[0].id);
        setKernelType(allKernels[0].source);
      }
    } catch (err) {
      console.error('Error refreshing kernels:', err);
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
          <option key={kernel.id} value={kernel.id}>
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
