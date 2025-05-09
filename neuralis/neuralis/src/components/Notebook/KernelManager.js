import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import kernelManager from '../../services/kernelManager';

const ManagerContainer = styled.div`
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #f9f9f9;
`;

const Title = styled.h3`
  margin-top: 0;
  margin-bottom: 15px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
`;

const Button = styled.button`
  background-color: #f1f1f1;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  
  &:hover {
    background-color: #e9e9e9;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const ContainerList = styled.div`
  margin-top: 15px;
`;

const ContainerItem = styled.div`
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 10px;
  background-color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ContainerInfo = styled.div`
  flex: 1;
`;

const ContainerName = styled.div`
  font-weight: bold;
`;

const ContainerDetails = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const ActionButton = styled.button`
  background-color: ${props => props.danger ? '#f44336' : '#2196f3'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.danger ? '#d32f2f' : '#1976d2'};
  }
`;

const KernelManager = ({ onKernelContainerCreated }) => {
  const [containers, setContainers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pythonVersion, setPythonVersion] = useState('3.9');
  
  // Initialize and fetch containers
  useEffect(() => {
    const init = async () => {
      await kernelManager.initialize();
      refreshContainers();
    };
    
    init();
  }, []);
  
  const refreshContainers = async () => {
    const containerList = await kernelManager.listContainers();
    setContainers(containerList);
  };
  
  const buildContainer = async () => {
    setIsLoading(true);
    try {
      const result = await kernelManager.buildKernelContainer({
        pythonVersion,
        port: 8888 + containers.length, // Use different ports for each container
        name: `neuralis-kernel-${pythonVersion}-${Date.now().toString().slice(-4)}`
      });
      
      if (result.success) {
        await refreshContainers();
        if (onKernelContainerCreated) {
          onKernelContainerCreated(result.container);
        }
      }
    } catch (error) {
      console.error('Failed to build container:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const stopContainer = async (name) => {
    setIsLoading(true);
    try {
      await kernelManager.stopContainer(name);
      await refreshContainers();
    } catch (error) {
      console.error(`Failed to stop container ${name}:`, error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ManagerContainer>
      <Title>Kernel Containers</Title>
      
      <ButtonGroup>
        <select 
          value={pythonVersion}
          onChange={(e) => setPythonVersion(e.target.value)}
          disabled={isLoading}
        >
          <option value="3.7">Python 3.7</option>
          <option value="3.8">Python 3.8</option>
          <option value="3.9">Python 3.9</option>
          <option value="3.10">Python 3.10</option>
        </select>
        
        <Button onClick={buildContainer} disabled={isLoading}>
          {isLoading ? 'Building...' : 'Build New Kernel'}
        </Button>
        
        <Button onClick={refreshContainers} disabled={isLoading}>
          Refresh
        </Button>
      </ButtonGroup>
      
      <ContainerList>
        {containers.length === 0 ? (
          <p>No kernel containers running. Build a new kernel to get started.</p>
        ) : (
          containers.map((container) => (
            <ContainerItem key={container.name}>
              <ContainerInfo>
                <ContainerName>{container.name}</ContainerName>
                <ContainerDetails>
                  Port: {container.port} | URL: {container.url}
                </ContainerDetails>
              </ContainerInfo>
              <ActionButton 
                danger 
                onClick={() => stopContainer(container.name)}
                disabled={isLoading}
              >
                Stop
              </ActionButton>
            </ContainerItem>
          ))
        )}
      </ContainerList>
    </ManagerContainer>
  );
};

export default KernelManager;
