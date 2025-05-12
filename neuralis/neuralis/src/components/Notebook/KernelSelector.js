import React, { useState, useEffect } from 'react';
import kernelService from '../../services/kernelService';

const KernelSelector = ({ onKernelChange }) => {
  const [availableKernels, setAvailableKernels] = useState([]);
  const [dockerContainers, setDockerContainers] = useState([]);
  const [condaEnvironments, setCondaEnvironments] = useState([]);
  const [terminalInstances, setTerminalInstances] = useState([]);
  const [selectedKernel, setSelectedKernel] = useState('');
  const [activeKernel, setActiveKernel] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize on component mount
  useEffect(() => {
    const initializeKernelService = async () => {
      setIsLoading(true);
      try {
        await kernelService.initialize();
        
        // Get kernels from Jupyter server
        const kernels = await kernelService.listKernels();
        setAvailableKernels(kernels);
        
        // Get Docker containers
        const containers = await kernelService.listContainers();
        setDockerContainers(containers);
        
        // Get conda environments (if available)
        try {
          const condaEnvs = await fetch('/api/kernels/conda-environments').then(res => res.json());
          setCondaEnvironments(condaEnvs.environments || []);
        } catch (error) {
          console.warn('Could not fetch conda environments:', error);
        }
        
        // Get terminal instances (if available)
        try {
          const terminals = await fetch('/api/terminals').then(res => res.json());
          setTerminalInstances(terminals || []);
        } catch (error) {
          console.warn('Could not fetch terminal instances:', error);
        }
        
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
    setActiveKernel(null);
    if (onKernelChange) {
      onKernelChange(null);
    }
  };
  
  // Group all kernel options by type
  const allKernelOptions = [
    ...availableKernels.map(k => ({ 
      id: k.name, 
      name: k.displayName || k.name, 
      type: 'jupyter' 
    })),
    ...dockerContainers.map(c => ({ 
      id: `docker-${c.name}`, 
      name: `Docker: ${c.name}`, 
      type: 'docker' 
    })),
    ...condaEnvironments.map(env => ({ 
      id: `conda-${env.name}`, 
      name: `Conda: ${env.name}`, 
      type: 'conda' 
    })),
    ...terminalInstances.map(term => ({ 
      id: `term-${term.name}`, 
      name: `Terminal: ${term.name}`, 
      type: 'terminal' 
    }))
  ];
  
  return (
    <div className="jp-kernel-selector">
      <select 
        value={selectedKernel} 
        onChange={handleKernelSelect}
        disabled={isLoading || activeKernel}
        className="jp-kernel-dropdown"
      >
        <option value="">Select a kernel...</option>
        
        {/* Group options by type */}
        {availableKernels.length > 0 && (
          <optgroup label="Jupyter Kernels">
            {availableKernels.map(kernel => (
              <option key={kernel.name} value={kernel.name}>
                {kernel.displayName || kernel.name}
              </option>
            ))}
          </optgroup>
        )}
        
        {dockerContainers.length > 0 && (
          <optgroup label="Docker Containers">
            {dockerContainers.map(container => (
              <option key={`docker-${container.name}`} value={`docker-${container.name}`}>
                {container.name}
              </option>
            ))}
          </optgroup>
        )}
        
        {condaEnvironments.length > 0 && (
          <optgroup label="Conda Environments">
            {condaEnvironments.map(env => (
              <option key={`conda-${env.name}`} value={`conda-${env.name}`}>
                {env.name}
              </option>
            ))}
          </optgroup>
        )}
        
        {terminalInstances.length > 0 && (
          <optgroup label="Terminal Instances">
            {terminalInstances.map(term => (
              <option key={`term-${term.name}`} value={`term-${term.name}`}>
                {term.name}
              </option>
            ))}
          </optgroup>
        )}
      </select>
      
      {activeKernel ? (
        <button 
          className="jp-toolbar-button jp-mod-small"
          onClick={handleDisconnectKernel} 
          disabled={isLoading}
        >
          Disconnect
        </button>
      ) : (
        <button 
          className="jp-toolbar-button jp-mod-small"
          onClick={handleConnectKernel} 
          disabled={isLoading || !selectedKernel}
        >
          {isLoading ? 'Connecting...' : 'Connect'}
        </button>
      )}
    </div>
  );
};

export default KernelSelector;

