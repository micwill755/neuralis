import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import kernelService from '../../services/kernelService';

const KernelSelectorContainer = styled.div`
  padding: 16px;
`;

const KernelList = styled.div`
  margin-top: 16px;
`;

const KernelOption = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  ${props => props.selected && `
    background-color: #e3f2fd;
    border-color: #2196f3;
  `}
`;

const KernelIcon = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  
  img {
    max-width: 100%;
    max-height: 100%;
  }
`;

const KernelInfo = styled.div`
  flex: 1;
`;

const KernelName = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const KernelDescription = styled.div`
  font-size: 12px;
  color: #757575;
`;

const KernelActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
`;

const Button = styled.button`
  background-color: ${props => props.primary ? '#2196f3' : 'white'};
  color: ${props => props.primary ? 'white' : '#2196f3'};
  border: 1px solid #2196f3;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  margin-left: 8px;
  
  &:hover {
    background-color: ${props => props.primary ? '#1976d2' : '#e3f2fd'};
  }
  
  &:disabled {
    background-color: #bdbdbd;
    border-color: #bdbdbd;
    color: white;
    cursor: not-allowed;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #2196f3;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #2196f3;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 4px;
  padding: 24px;
  width: 500px;
  max-width: 90%;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ModalTitle = styled.h3`
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #757575;
  
  &:hover {
    color: #212121;
  }
`;

const StatusMessage = styled.div`
  padding: 12px;
  margin-top: 16px;
  border-radius: 4px;
  background-color: ${props => props.success ? '#e8f5e9' : '#ffebee'};
  color: ${props => props.success ? '#2e7d32' : '#c62828'};
  border: 1px solid ${props => props.success ? '#a5d6a7' : '#ef9a9a'};
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: #2196f3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

function KernelSelector({ onKernelSelect }) {
  const [kernels, setKernels] = useState([]);
  const [selectedKernel, setSelectedKernel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ message: '', success: true });

  useEffect(() => {
    // Load available kernels
    const loadKernels = async () => {
      try {
        const availableKernels = await kernelService.getAvailableKernels();
        setKernels(availableKernels);
      } catch (error) {
        console.error('Error loading kernels:', error);
      }
    };
    
    loadKernels();
  }, []);

  const handleKernelSelect = (kernel) => {
    setSelectedKernel(kernel);
  };

  const openModal = (type) => {
    setModalType(type);
    
    // Set default form data based on modal type
    if (type === 'conda') {
      setFormData({
        name: 'my-conda-env',
        pythonVersion: '3.9',
        packages: 'numpy,pandas,matplotlib'
      });
    } else if (type === 'docker') {
      setFormData({
        name: 'my-docker-container',
        image: 'jupyter/scipy-notebook',
        ports: '8888:8888'
      });
    } else if (type === 'terminal') {
      setFormData({
        host: 'localhost',
        port: '8888',
        username: '',
        password: ''
      });
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setStatus({ message: '', success: true });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setStatus({ message: '', success: true });
    
    try {
      let result;
      
      if (modalType === 'conda') {
        // Create conda environment
        const packages = formData.packages.split(',').map(pkg => pkg.trim());
        result = await kernelService.createCondaEnvironment(formData.name, formData.pythonVersion, packages);
        
        setStatus({
          message: `Conda environment "${result.name}" created successfully!`,
          success: true
        });
        
      } else if (modalType === 'docker') {
        // Create Docker container
        const options = {};
        if (formData.ports) {
          const [hostPort, containerPort] = formData.ports.split(':');
          options.ports = { [hostPort]: containerPort };
        }
        
        result = await kernelService.createDockerContainer(formData.name, formData.image, options);
        
        setStatus({
          message: `Docker container "${result.name}" created successfully!`,
          success: true
        });
        
      } else if (modalType === 'terminal') {
        // Connect to terminal kernel
        const credentials = {
          username: formData.username,
          password: formData.password
        };
        
        result = await kernelService.connectToTerminalKernel(formData.host, parseInt(formData.port), credentials);
        
        setStatus({
          message: `Connected to terminal kernel at ${result.host}:${result.port}!`,
          success: true
        });
      }
      
      // Add the new kernel to the list
      if (result) {
        setKernels(prev => [...prev, result]);
        setSelectedKernel(result);
        
        // Notify parent component
        if (onKernelSelect) {
          onKernelSelect(result);
        }
      }
      
    } catch (error) {
      console.error(`Error creating ${modalType} environment:`, error);
      setStatus({
        message: `Error creating ${modalType} environment: ${error.message}`,
        success: false
      });
    } finally {
      setLoading(false);
    }
  };

  const renderModalContent = () => {
    if (modalType === 'conda') {
      return (
        <>
          <FormGroup>
            <Label htmlFor="name">Environment Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              placeholder="my-conda-env"
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="pythonVersion">Python Version</Label>
            <Select
              id="pythonVersion"
              name="pythonVersion"
              value={formData.pythonVersion || '3.9'}
              onChange={handleInputChange}
            >
              <option value="3.7">Python 3.7</option>
              <option value="3.8">Python 3.8</option>
              <option value="3.9">Python 3.9</option>
              <option value="3.10">Python 3.10</option>
              <option value="3.11">Python 3.11</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label htmlFor="packages">Packages (comma-separated)</Label>
            <Input
              type="text"
              id="packages"
              name="packages"
              value={formData.packages || ''}
              onChange={handleInputChange}
              placeholder="numpy,pandas,matplotlib"
            />
          </FormGroup>
        </>
      );
    } else if (modalType === 'docker') {
      return (
        <>
          <FormGroup>
            <Label htmlFor="name">Container Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              placeholder="my-docker-container"
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="image">Docker Image</Label>
            <Select
              id="image"
              name="image"
              value={formData.image || 'jupyter/scipy-notebook'}
              onChange={handleInputChange}
            >
              <option value="jupyter/scipy-notebook">Jupyter SciPy Notebook</option>
              <option value="jupyter/tensorflow-notebook">Jupyter TensorFlow Notebook</option>
              <option value="jupyter/datascience-notebook">Jupyter Data Science Notebook</option>
              <option value="jupyter/r-notebook">Jupyter R Notebook</option>
              <option value="jupyter/pyspark-notebook">Jupyter PySpark Notebook</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label htmlFor="ports">Port Mapping (host:container)</Label>
            <Input
              type="text"
              id="ports"
              name="ports"
              value={formData.ports || ''}
              onChange={handleInputChange}
              placeholder="8888:8888"
            />
          </FormGroup>
        </>
      );
    } else if (modalType === 'terminal') {
      return (
        <>
          <FormGroup>
            <Label htmlFor="host">Host</Label>
            <Input
              type="text"
              id="host"
              name="host"
              value={formData.host || ''}
              onChange={handleInputChange}
              placeholder="localhost"
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="port">Port</Label>
            <Input
              type="text"
              id="port"
              name="port"
              value={formData.port || ''}
              onChange={handleInputChange}
              placeholder="8888"
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="username">Username (optional)</Label>
            <Input
              type="text"
              id="username"
              name="username"
              value={formData.username || ''}
              onChange={handleInputChange}
              placeholder="username"
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="password">Password (optional)</Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password || ''}
              onChange={handleInputChange}
              placeholder="password"
            />
          </FormGroup>
        </>
      );
    }
    
    return null;
  };

  return (
    <KernelSelectorContainer>
      <h2>Select Kernel</h2>
      
      <div>
        <Button onClick={() => openModal('conda')}>
          <i className="fas fa-plus"></i> New Conda Environment
        </Button>
        <Button onClick={() => openModal('docker')} style={{ marginLeft: '8px' }}>
          <i className="fas fa-docker"></i> New Docker Container
        </Button>
        <Button onClick={() => openModal('terminal')} style={{ marginLeft: '8px' }}>
          <i className="fas fa-terminal"></i> Connect to Terminal
        </Button>
      </div>
      
      <KernelList>
        {kernels.map(kernel => (
          <KernelOption 
            key={kernel.id} 
            selected={selectedKernel && selectedKernel.id === kernel.id}
            onClick={() => handleKernelSelect(kernel)}
          >
            <KernelIcon>
              {kernel.type === 'conda' && <img src="/icons/conda.png" alt="Conda" />}
              {kernel.type === 'docker' && <img src="/icons/docker.png" alt="Docker" />}
              {kernel.type === 'terminal' && <img src="/icons/terminal.png" alt="Terminal" />}
            </KernelIcon>
            <KernelInfo>
              <KernelName>{kernel.displayName || kernel.name}</KernelName>
              <KernelDescription>
                {kernel.type === 'conda' && `Conda Environment - Python ${kernel.pythonVersion}`}
                {kernel.type === 'docker' && `Docker Container - ${kernel.image}`}
                {kernel.type === 'terminal' && `Terminal Connection - ${kernel.host}:${kernel.port}`}
              </KernelDescription>
            </KernelInfo>
          </KernelOption>
        ))}
      </KernelList>
      
      <KernelActions>
        <Button 
          primary 
          disabled={!selectedKernel}
          onClick={() => {
            if (selectedKernel && onKernelSelect) {
              onKernelSelect(selectedKernel);
            }
          }}
        >
          Select Kernel
        </Button>
      </KernelActions>
      
      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {modalType === 'conda' && 'Create Conda Environment'}
                {modalType === 'docker' && 'Create Docker Container'}
                {modalType === 'terminal' && 'Connect to Terminal'}
              </ModalTitle>
              <CloseButton onClick={closeModal}>&times;</CloseButton>
            </ModalHeader>
            
            {renderModalContent()}
            
            {status.message && (
              <StatusMessage success={status.success}>
                {status.message}
              </StatusMessage>
            )}
            
            <KernelActions>
              <Button onClick={closeModal}>Cancel</Button>
              <Button primary onClick={handleSubmit} disabled={loading}>
                {loading && <LoadingSpinner />}
                {modalType === 'conda' && 'Create Environment'}
                {modalType === 'docker' && 'Create Container'}
                {modalType === 'terminal' && 'Connect'}
              </Button>
            </KernelActions>
          </ModalContent>
        </Modal>
      )}
    </KernelSelectorContainer>
  );
}

export default KernelSelector;
