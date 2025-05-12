import React, { useState, useEffect } from 'react';
import kernelManager from '../../services/kernelManager';
import kernelService from '../../services/kernelService';
import './KernelSetup.css';

const KernelSetupScreen = () => {
  const [isDockerAvailable, setIsDockerAvailable] = useState(false);
  const [containers, setContainers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form state
  const [pythonVersion, setPythonVersion] = useState('3.9');
  const [port, setPort] = useState('8888');
  const [containerName, setContainerName] = useState('');
  const [packages, setPackages] = useState('');
  
  // Initialize
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        // Check if Docker is available
        const isInitialized = await kernelManager.initialize();
        setIsDockerAvailable(isInitialized);
        
        if (isInitialized) {
          // List existing containers
          const containerList = await kernelManager.listContainers();
          setContainers(containerList);
        }
      } catch (err) {
        setError(`Initialization error: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    init();
  }, []);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Generate a container name if not provided
      const name = containerName || `neuralis-kernel-${pythonVersion}-${Date.now()}`;
      
      // Build the container
      const result = await kernelService.setupDockerContainer({
        pythonVersion,
        port: parseInt(port),
        name,
        packages
      });
      
      if (result) {
        setSuccess(`Successfully created kernel container: ${name}`);
        
        // Refresh container list
        const containerList = await kernelManager.listContainers();
        setContainers(containerList);
        
        // Reset form
        setContainerName('');
        setPackages('');
      } else {
        setError('Failed to create kernel container');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle container stop
  const handleStopContainer = async (name) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await kernelManager.stopContainer(name);
      
      if (result) {
        setSuccess(`Successfully stopped container: ${name}`);
        
        // Refresh container list
        const containerList = await kernelManager.listContainers();
        setContainers(containerList);
      } else {
        setError(`Failed to stop container: ${name}`);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle container restart
  const handleRestartContainer = async (name) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await kernelManager.restartContainer(name);
      
      if (result) {
        setSuccess(`Successfully restarted container: ${name}`);
        
        // Refresh container list
        const containerList = await kernelManager.listContainers();
        setContainers(containerList);
      } else {
        setError(`Failed to restart container: ${name}`);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Refresh container list
      const containerList = await kernelManager.listContainers();
      setContainers(containerList);
    } catch (err) {
      setError(`Error refreshing: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="kernel-setup-screen">
      <h2>Kernel Settings</h2>
      
      {!isDockerAvailable && (
        <div className="docker-warning">
          <h3>Docker Not Available</h3>
          <p>Docker is required to use Python kernels. Please install Docker and restart the application.</p>
          <a href="https://docs.docker.com/get-docker/" target="_blank" rel="noopener noreferrer">
            Get Docker
          </a>
        </div>
      )}
      
      {isDockerAvailable && (
        <>
          <div className="kernel-form-container">
            <h3>Build New Kernel</h3>
            <form onSubmit={handleSubmit} className="kernel-form">
              <div className="form-group">
                <label htmlFor="pythonVersion">Python Version:</label>
                <select 
                  id="pythonVersion" 
                  value={pythonVersion} 
                  onChange={(e) => setPythonVersion(e.target.value)}
                >
                  <option value="3.7">Python 3.7</option>
                  <option value="3.8">Python 3.8</option>
                  <option value="3.9">Python 3.9</option>
                  <option value="3.10">Python 3.10</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="port">Port:</label>
                <input 
                  type="text" 
                  id="port" 
                  value={port} 
                  onChange={(e) => setPort(e.target.value)}
                  placeholder="8888"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="containerName">Container Name (optional):</label>
                <input 
                  type="text" 
                  id="containerName" 
                  value={containerName} 
                  onChange={(e) => setContainerName(e.target.value)}
                  placeholder="neuralis-kernel-3.9"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="packages">Additional Packages (comma separated):</label>
                <input 
                  type="text" 
                  id="packages" 
                  value={packages} 
                  onChange={(e) => setPackages(e.target.value)}
                  placeholder="pandas,matplotlib,scikit-learn"
                />
              </div>
              
              <button 
                type="submit" 
                className="build-button"
                disabled={isLoading}
              >
                {isLoading ? 'Building...' : 'Build New Kernel'}
              </button>
            </form>
          </div>
          
          <div className="kernel-list-container">
            <div className="kernel-list-header">
              <h3>Available Kernels</h3>
              <button 
                onClick={handleRefresh} 
                className="refresh-button"
                disabled={isLoading}
              >
                Refresh
              </button>
            </div>
            
            {containers.length === 0 ? (
              <p>No kernel containers found.</p>
            ) : (
              <table className="kernel-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Port</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {containers.map((container) => (
                    <tr key={container.name}>
                      <td>{container.name}</td>
                      <td>{container.port}</td>
                      <td>
                        <span className={`status-indicator ${container.status}`}>
                          {container.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleRestartContainer(container.name)}
                          className="action-button restart"
                          disabled={isLoading}
                        >
                          Restart
                        </button>
                        <button 
                          onClick={() => handleStopContainer(container.name)}
                          className="action-button stop"
                          disabled={isLoading}
                        >
                          Stop
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </div>
  );
};

export default KernelSetupScreen;
