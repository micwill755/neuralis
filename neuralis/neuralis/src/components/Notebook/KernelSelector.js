import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import kernelService from '../../services/kernelService';

const SelectorContainer = styled.div`
  margin-bottom: 20px;
`;

const Select = styled.select`
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: white;
  min-width: 200px;
`;

const Button = styled.button`
  background-color: #f1f1f1;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px 12px;
  margin-left: 10px;
  cursor: pointer;
  
  &:hover {
    background-color: #e9e9e9;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const StatusIndicator = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
  background-color: ${props => props.active ? '#4CAF50' : '#ccc'};
`;

const KernelSelector = ({ onKernelChange }) => {
  const [availableKernels, setAvailableKernels] = useState([]);
  const [selectedKernel, setSelectedKernel] = useState('');
  const [activeKernel, setActiveKernel] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize on component mount
  useEffect(() => {
    const initializeKernelService = async () => {
      setIsLoading(true);
      try {
        await kernelService.initialize();
        const kernels = await kernelService.listKernels();
        setAvailableKernels(kernels);
        
        if (kernels.length > 0) {
          setSelectedKernel(kernels[0].name);
        }
      } catch (error) {
        console.error('Failed to initialize kernel service:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeKernelService();
  }, []);
  
  const handleKernelSelect = (e) => {
    setSelectedKernel(e.target.value);
  };
  
  const handleConnectKernel = async () => {
    if (!selectedKernel) return;
    
    setIsLoading(true);
    try {
      const kernel = await kernelService.startKernel(selectedKernel);
      if (kernel) {
        setActiveKernel(kernel);
        if (onKernelChange) {
          onKernelChange(kernel);
        }
      }
    } catch (error) {
      console.error('Failed to connect to kernel:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDisconnectKernel = async () => {
    // For now, we'll just clear the active kernel state
    // In a real implementation, you might want to properly shut down the kernel
    setActiveKernel(null);
    if (onKernelChange) {
      onKernelChange(null);
    }
  };
  
  return (
    <SelectorContainer>
      <Select 
        value={selectedKernel} 
        onChange={handleKernelSelect}
        disabled={isLoading || activeKernel}
      >
        <option value="">Select a kernel...</option>
        {availableKernels.map(kernel => (
          <option key={kernel.name} value={kernel.name}>
            {kernel.displayName || kernel.name}
          </option>
        ))}
      </Select>
      
      {activeKernel ? (
        <>
          <StatusIndicator active={true} />
          <span>Connected to {activeKernel.name}</span>
          <Button onClick={handleDisconnectKernel} disabled={isLoading}>
            Disconnect
          </Button>
        </>
      ) : (
        <Button 
          onClick={handleConnectKernel} 
          disabled={isLoading || !selectedKernel}
        >
          {isLoading ? 'Connecting...' : 'Connect'}
        </Button>
      )}
    </SelectorContainer>
  );
};

export default KernelSelector;