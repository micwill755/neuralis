import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import kernelService from '../../services/kernelService';

const KernelManagerContainer = styled.div`
  padding: 16px;
`;

const KernelTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
  
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
  }
  
  th {
    background-color: #f5f5f5;
    font-weight: 500;
  }
  
  tr:hover {
    background-color: #f9f9f9;
  }
`;

const KernelStatus = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  background-color: ${props => props.active ? '#e8f5e9' : '#f5f5f5'};
  color: ${props => props.active ? '#2e7d32' : '#757575'};
`;

const ActionButton = styled.button`
  background-color: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 4px 8px;
  margin-right: 8px;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  &.start {
    color: #2e7d32;
    border-color: #a5d6a7;
    &:hover {
      background-color: #e8f5e9;
    }
  }
  
  &.stop {
    color: #c62828;
    border-color: #ef9a9a;
    &:hover {
      background-color: #ffebee;
    }
  }
  
  &.restart {
    color: #1565c0;
    border-color: #90caf9;
    &:hover {
      background-color: #e3f2fd;
    }
  }
`;

const KernelIcon = styled.div`
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  vertical-align: middle;
  
  img {
    max-width: 100%;
    max-height: 100%;
  }
`;

function KernelManager() {
  const [kernels, setKernels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load available kernels
    const loadKernels = async () => {
      try {
        setLoading(true);
        const availableKernels = await kernelService.getAvailableKernels();
        
        // Add some status information for demo purposes
        const kernelsWithStatus = availableKernels.map(kernel => ({
          ...kernel,
          status: Math.random() > 0.5 ? 'active' : 'inactive',
          lastUsed: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toLocaleString()
        }));
        
        setKernels(kernelsWithStatus);
      } catch (error) {
        console.error('Error loading kernels:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadKernels();
  }, []);

  const handleStartKernel = (kernelId) => {
    setKernels(prev => 
      prev.map(kernel => 
        kernel.id === kernelId 
          ? { ...kernel, status: 'active' } 
          : kernel
      )
    );
  };

  const handleStopKernel = (kernelId) => {
    setKernels(prev => 
      prev.map(kernel => 
        kernel.id === kernelId 
          ? { ...kernel, status: 'inactive' } 
          : kernel
      )
    );
  };

  const handleRestartKernel = (kernelId) => {
    // Simulate restart by briefly setting to inactive then active
    setKernels(prev => 
      prev.map(kernel => 
        kernel.id === kernelId 
          ? { ...kernel, status: 'restarting' } 
          : kernel
      )
    );
    
    setTimeout(() => {
      setKernels(prev => 
        prev.map(kernel => 
          kernel.id === kernelId 
            ? { ...kernel, status: 'active' } 
            : kernel
        )
      );
    }, 1500);
  };

  return (
    <KernelManagerContainer>
      <h2>Kernel Manager</h2>
      
      {loading ? (
        <p>Loading kernels...</p>
      ) : (
        <KernelTable>
          <thead>
            <tr>
              <th>Kernel</th>
              <th>Type</th>
              <th>Status</th>
              <th>Last Used</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {kernels.map(kernel => (
              <tr key={kernel.id}>
                <td>
                  <KernelIcon>
                    {kernel.type === 'conda' && <img src="/icons/conda.png" alt="Conda" />}
                    {kernel.type === 'docker' && <img src="/icons/docker.png" alt="Docker" />}
                    {kernel.type === 'terminal' && <img src="/icons/terminal.png" alt="Terminal" />}
                  </KernelIcon>
                  {kernel.displayName || kernel.name}
                </td>
                <td>
                  {kernel.type === 'conda' && `Conda (Python ${kernel.pythonVersion})`}
                  {kernel.type === 'docker' && `Docker (${kernel.image || 'Custom Image'})`}
                  {kernel.type === 'terminal' && `Terminal (${kernel.host || 'localhost'}:${kernel.port || '8888'})`}
                </td>
                <td>
                  <KernelStatus active={kernel.status === 'active'}>
                    {kernel.status === 'active' && 'Active'}
                    {kernel.status === 'inactive' && 'Inactive'}
                    {kernel.status === 'restarting' && 'Restarting...'}
                  </KernelStatus>
                </td>
                <td>{kernel.lastUsed}</td>
                <td>
                  {kernel.status === 'inactive' && (
                    <ActionButton 
                      className="start"
                      onClick={() => handleStartKernel(kernel.id)}
                    >
                      Start
                    </ActionButton>
                  )}
                  {kernel.status === 'active' && (
                    <>
                      <ActionButton 
                        className="stop"
                        onClick={() => handleStopKernel(kernel.id)}
                      >
                        Stop
                      </ActionButton>
                      <ActionButton 
                        className="restart"
                        onClick={() => handleRestartKernel(kernel.id)}
                      >
                        Restart
                      </ActionButton>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </KernelTable>
      )}
    </KernelManagerContainer>
  );
}

export default KernelManager;
