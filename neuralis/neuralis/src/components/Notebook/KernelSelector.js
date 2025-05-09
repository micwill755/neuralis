import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import kernelService from '../../services/kernelService';

const SelectorContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 10px;
`;

const KernelLabel = styled.span`
  font-size: 0.9rem;
  color: #666;
`;

const KernelSelect = styled.select`
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  font-size: 0.9rem;
`;

const KernelStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
`;

const StatusIndicator = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.active ? '#4caf50' : '#9e9e9e'};
`;

const KernelButton = styled.button`
  background-color: #f1f1f1;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 0.9rem;
  cursor: pointer;
  
  &:hover {
    background-color: #e9e9e9;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

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
    <SelectorContainer>
      <KernelLabel>Kernel:</KernelLabel>
      <KernelSelect 
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
      </KernelSelect>
      
      {!isConnected ? (
        <>
          <KernelButton 
            onClick={connectToKernel} 
            disabled={isLoading || !selectedKernel}
          >
            {isLoading ? 'Connecting...' : 'Connect'}
          </KernelButton>
          <KernelButton onClick={refreshKernels} disabled={isLoading}>
            Refresh
          </KernelButton>
        </>
      ) : (
        <>
          <KernelStatus>
            <StatusIndicator active={isConnected} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </KernelStatus>
          <KernelButton 
            onClick={restartKernel} 
            disabled={isLoading || !isConnected}
          >
            Restart
          </KernelButton>
        </>
      )}
      
      {error && <div style={{ color: 'red', marginLeft: '10px' }}>{error}</div>}
    </SelectorContainer>
  );
};

export default KernelSelector;
