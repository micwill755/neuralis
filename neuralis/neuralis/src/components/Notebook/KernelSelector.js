import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import kernelService from '../../services/kernelService';

const SelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
  padding: 10px;
`;

const SelectorHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

const KernelLabel = styled.span`
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
`;

const KernelSelect = styled.select`
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  font-size: 0.9rem;
  width: 100%;
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

const EnvironmentSelector = styled.div`
  margin-top: 10px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #f9f9f9;
`;

const EnvironmentTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 12px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
`;

const SectionTitle = styled.h3`
  margin-top: 20px;
  margin-bottom: 10px;
  font-size: 1rem;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 5px;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 15px;
`;

const Tab = styled.div`
  padding: 8px 15px;
  cursor: pointer;
  border: 1px solid #ccc;
  border-bottom: ${props => props.active ? 'none' : '1px solid #ccc'};
  border-radius: 4px 4px 0 0;
  background-color: ${props => props.active ? 'white' : '#f1f1f1'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  
  &:hover {
    background-color: ${props => props.active ? 'white' : '#e9e9e9'};
  }
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  font-size: 0.9rem;
  margin-top: 10px;
  padding: 8px;
  background-color: #ffebee;
  border-radius: 4px;
`;

const SuccessMessage = styled.div`
  color: #2e7d32;
  font-size: 0.9rem;
  margin-top: 10px;
  padding: 8px;
  background-color: #e8f5e9;
  border-radius: 4px;
`;

const ActionButtonGroup = styled.div`
  display: flex;
  gap: 5px;
  margin-top: 10px;
  width: 100%;
`;

const KernelSelector = ({ onKernelChange, compactMode = false }) => {
  const [kernels, setKernels] = useState([]);
  const [selectedKernel, setSelectedKernel] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Environment creation state
  const [showEnvironmentSelector, setShowEnvironmentSelector] = useState(false);
  const [environmentType, setEnvironmentType] = useState('conda'); // conda, docker, terminal
  const [environmentForm, setEnvironmentForm] = useState({
    // Conda fields
    condaName: 'my-conda-env',
    pythonVersion: '3.9',
    condaPackages: 'numpy,pandas,matplotlib',
    
    // Docker fields
    dockerName: 'my-jupyter-container',
    dockerImage: 'jupyter/scipy-notebook',
    dockerPort: '8888:8888',
    
    // Terminal fields
    terminalHost: 'localhost',
    terminalPort: '8888',
    terminalUsername: '',
    terminalPassword: ''
  });

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
  
  // Listen for showKernelSelector events
  useEffect(() => {
    const handleShowKernelSelector = (event) => {
      const { environmentType } = event.detail;
      
      // Show the environment selector with the specified type
      setShowEnvironmentSelector(true);
      setEnvironmentType(environmentType);
      setError(null);
      setSuccess(null);
    };
    
    window.addEventListener('showKernelSelector', handleShowKernelSelector);
    return () => {
      window.removeEventListener('showKernelSelector', handleShowKernelSelector);
    };
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
        setSuccess(`Successfully connected to ${kernel.displayName || kernel.name}`);
        
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
        setSuccess('Kernel restarted successfully');
        
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
    setError(null);
    setSuccess(null);
  };

  // Manual refresh of kernels
  const refreshKernels = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const availableKernels = await kernelService.listKernels();
      setKernels(availableKernels);
      setSuccess('Kernel list refreshed');
    } catch (err) {
      setError(`Refresh error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEnvironmentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create a new environment
  const createEnvironment = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      let result;
      
      if (environmentType === 'conda') {
        // Create conda environment
        const packages = environmentForm.condaPackages.split(',').map(pkg => pkg.trim());
        result = await kernelService.createCondaEnvironment(
          environmentForm.condaName,
          environmentForm.pythonVersion,
          packages
        );
        
      } else if (environmentType === 'docker') {
        // Create Docker container
        const options = {};
        if (environmentForm.dockerPort) {
          const [hostPort, containerPort] = environmentForm.dockerPort.split(':');
          options.ports = { [hostPort]: containerPort };
        }
        
        result = await kernelService.createDockerContainer(
          environmentForm.dockerName,
          environmentForm.dockerImage,
          options
        );
        
      } else if (environmentType === 'terminal') {
        // Connect to terminal kernel
        const credentials = {
          username: environmentForm.terminalUsername,
          password: environmentForm.terminalPassword
        };
        
        result = await kernelService.connectToTerminalKernel(
          environmentForm.terminalHost,
          parseInt(environmentForm.terminalPort),
          credentials
        );
      }
      
      if (result) {
        console.log('Environment created:', result);
        setSuccess(`Successfully created ${result.displayName || result.name}`);
        
        // Add the new kernel to the list and select it
        setKernels(prev => [...prev, result]);
        setSelectedKernel(result.name);
        
        // Close the environment selector
        setShowEnvironmentSelector(false);
        
        // Automatically connect to the newly created kernel
        try {
          console.log('Connecting to newly created kernel:', result.name);
          const kernel = await kernelService.startKernel(result.name);
          
          if (kernel) {
            console.log('Connected to kernel:', kernel);
            setIsConnected(true);
            setSuccess(`Successfully connected to ${kernel.displayName || kernel.name}`);
            
            if (onKernelChange) {
              onKernelChange(kernel);
            }
          }
        } catch (connErr) {
          console.error('Failed to connect to newly created kernel:', connErr);
          setError(`Created environment but failed to connect: ${connErr.message}`);
        }
      }
    } catch (err) {
      console.error('Failed to create environment:', err);
      setError(`Environment creation error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Render the appropriate environment form based on the selected type
  const renderEnvironmentForm = () => {
    switch (environmentType) {
      case 'conda':
        return (
          <>
            <FormGroup>
              <Label htmlFor="condaName">Environment Name</Label>
              <Input
                type="text"
                id="condaName"
                name="condaName"
                value={environmentForm.condaName}
                onChange={handleFormChange}
                placeholder="my-conda-env"
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="pythonVersion">Python Version</Label>
              <Select
                id="pythonVersion"
                name="pythonVersion"
                value={environmentForm.pythonVersion}
                onChange={handleFormChange}
              >
                <option value="3.7">Python 3.7</option>
                <option value="3.8">Python 3.8</option>
                <option value="3.9">Python 3.9</option>
                <option value="3.10">Python 3.10</option>
                <option value="3.11">Python 3.11</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="condaPackages">Packages (comma-separated)</Label>
              <Input
                type="text"
                id="condaPackages"
                name="condaPackages"
                value={environmentForm.condaPackages}
                onChange={handleFormChange}
                placeholder="numpy,pandas,matplotlib"
              />
            </FormGroup>
          </>
        );
        
      case 'docker':
        return (
          <>
            <FormGroup>
              <Label htmlFor="dockerName">Container Name</Label>
              <Input
                type="text"
                id="dockerName"
                name="dockerName"
                value={environmentForm.dockerName}
                onChange={handleFormChange}
                placeholder="my-jupyter-container"
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="dockerImage">Docker Image</Label>
              <Select
                id="dockerImage"
                name="dockerImage"
                value={environmentForm.dockerImage}
                onChange={handleFormChange}
              >
                <option value="jupyter/scipy-notebook">Jupyter SciPy Notebook</option>
                <option value="jupyter/tensorflow-notebook">Jupyter TensorFlow Notebook</option>
                <option value="jupyter/datascience-notebook">Jupyter Data Science Notebook</option>
                <option value="jupyter/r-notebook">Jupyter R Notebook</option>
                <option value="jupyter/pyspark-notebook">Jupyter PySpark Notebook</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="dockerPort">Port Mapping (host:container)</Label>
              <Input
                type="text"
                id="dockerPort"
                name="dockerPort"
                value={environmentForm.dockerPort}
                onChange={handleFormChange}
                placeholder="8888:8888"
              />
            </FormGroup>
          </>
        );
        
      case 'terminal':
        return (
          <>
            <FormGroup>
              <Label htmlFor="terminalHost">Host</Label>
              <Input
                type="text"
                id="terminalHost"
                name="terminalHost"
                value={environmentForm.terminalHost}
                onChange={handleFormChange}
                placeholder="localhost"
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="terminalPort">Port</Label>
              <Input
                type="text"
                id="terminalPort"
                name="terminalPort"
                value={environmentForm.terminalPort}
                onChange={handleFormChange}
                placeholder="8888"
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="terminalUsername">Username (optional)</Label>
              <Input
                type="text"
                id="terminalUsername"
                name="terminalUsername"
                value={environmentForm.terminalUsername}
                onChange={handleFormChange}
                placeholder="username"
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="terminalPassword">Password (optional)</Label>
              <Input
                type="password"
                id="terminalPassword"
                name="terminalPassword"
                value={environmentForm.terminalPassword}
                onChange={handleFormChange}
                placeholder="password"
              />
            </FormGroup>
          </>
        );
        
      default:
        return null;
    }
  };

  return compactMode ? (
    <div>
      <div style={{ marginBottom: '10px', fontWeight: '500', fontSize: '0.9rem' }}>
        Kernel
      </div>
      
      <KernelSelect 
        value={selectedKernel || ''}
        onChange={handleKernelChange}
        disabled={isLoading || isConnected}
        style={{ marginBottom: '8px' }}
      >
        <option value="">Select a kernel</option>
        {kernels.map(kernel => (
          <option key={kernel.id} value={kernel.name}>
            {kernel.displayName || kernel.name}
          </option>
        ))}
      </KernelSelect>
      
      <ActionButtonGroup>
        {!isConnected ? (
          <>
            <KernelButton 
              onClick={connectToKernel} 
              disabled={isLoading || !selectedKernel}
              style={{ flex: 1 }}
            >
              {isLoading ? 'Connecting...' : 'Connect'}
            </KernelButton>
            <KernelButton onClick={refreshKernels} disabled={isLoading}>
              <span role="img" aria-label="refresh">🔄</span>
            </KernelButton>
          </>
        ) : (
          <>
            <KernelStatus style={{ flex: 1 }}>
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
      </ActionButtonGroup>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
    </div>
  ) : (
    <SelectorContainer>
      <SectionTitle>Kernel Selector</SectionTitle>
      
      <SelectorHeader>
        <KernelLabel>Select a kernel:</KernelLabel>
        <KernelSelect 
          value={selectedKernel || ''}
          onChange={handleKernelChange}
          disabled={isLoading || isConnected}
        >
          <option value="">Select a kernel</option>
          {kernels.map(kernel => (
            <option key={kernel.id} value={kernel.name}>
              {kernel.displayName || kernel.name}
            </option>
          ))}
        </KernelSelect>
        
        <ActionButtonGroup>
          {!isConnected ? (
            <>
              <KernelButton 
                onClick={connectToKernel} 
                disabled={isLoading || !selectedKernel}
                style={{ flex: 1 }}
              >
                {isLoading ? 'Connecting...' : 'Connect'}
              </KernelButton>
              <KernelButton onClick={refreshKernels} disabled={isLoading}>
                Refresh
              </KernelButton>
            </>
          ) : (
            <>
              <KernelStatus style={{ flex: 1 }}>
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
        </ActionButtonGroup>
      </SelectorHeader>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      
      <SectionTitle>Create New Environment</SectionTitle>
      
      <ButtonGroup>
        <KernelButton 
          onClick={() => {
            setShowEnvironmentSelector(true);
            setEnvironmentType('conda');
            setError(null);
            setSuccess(null);
          }}
        >
          New Conda Environment
        </KernelButton>
        <KernelButton 
          onClick={() => {
            setShowEnvironmentSelector(true);
            setEnvironmentType('docker');
            setError(null);
            setSuccess(null);
          }}
        >
          New Docker Container
        </KernelButton>
        <KernelButton 
          onClick={() => {
            setShowEnvironmentSelector(true);
            setEnvironmentType('terminal');
            setError(null);
            setSuccess(null);
          }}
        >
          Connect to Terminal
        </KernelButton>
      </ButtonGroup>
      
      {showEnvironmentSelector && (
        <EnvironmentSelector>
          <TabContainer>
            <Tab 
              active={environmentType === 'conda'} 
              onClick={() => setEnvironmentType('conda')}
            >
              Conda
            </Tab>
            <Tab 
              active={environmentType === 'docker'} 
              onClick={() => setEnvironmentType('docker')}
            >
              Docker
            </Tab>
            <Tab 
              active={environmentType === 'terminal'} 
              onClick={() => setEnvironmentType('terminal')}
            >
              Terminal
            </Tab>
          </TabContainer>
          
          <EnvironmentTitle>
            {environmentType === 'conda' && 'Create Conda Environment'}
            {environmentType === 'docker' && 'Create Docker Container'}
            {environmentType === 'terminal' && 'Connect to Terminal'}
          </EnvironmentTitle>
          
          {renderEnvironmentForm()}
          
          <ButtonGroup>
            <KernelButton onClick={() => setShowEnvironmentSelector(false)}>
              Cancel
            </KernelButton>
            <KernelButton 
              onClick={createEnvironment}
              disabled={isLoading}
              style={{ backgroundColor: '#2196f3', color: 'white' }}
            >
              {isLoading ? 'Creating...' : 'Create'}
            </KernelButton>
          </ButtonGroup>
        </EnvironmentSelector>
      )}
      
      <SectionTitle>Running Kernels</SectionTitle>
      
      {kernels.filter(k => k.status === 'active').length === 0 ? (
        <div style={{ color: '#757575', fontSize: '0.9rem', marginTop: '10px' }}>
          No running kernels
        </div>
      ) : (
        <div style={{ marginTop: '10px' }}>
          {kernels.filter(k => k.status === 'active').map(kernel => (
            <div 
              key={kernel.id} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '5px 0',
                borderBottom: '1px solid #e0e0e0'
              }}
            >
              <StatusIndicator active={true} style={{ marginRight: '8px' }} />
              <div style={{ flex: 1 }}>{kernel.displayName || kernel.name}</div>
              <KernelButton 
                onClick={() => restartKernel(kernel.name)}
                style={{ marginRight: '5px' }}
              >
                Restart
              </KernelButton>
              <KernelButton>
                Shut Down
              </KernelButton>
            </div>
          ))}
        </div>
      )}
    </SelectorContainer>
  );
};

export default KernelSelector;
