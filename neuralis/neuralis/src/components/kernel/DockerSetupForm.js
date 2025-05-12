import React, { useState } from 'react';
import kernelService from '../../services/kernelService';
import './KernelSetup.css';

const DockerSetupForm = ({ onContainerCreated }) => {
  const [pythonVersion, setPythonVersion] = useState('3.9');
  const [port, setPort] = useState('8888');
  const [containerName, setContainerName] = useState('');
  const [packages, setPackages] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
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
        // Reset form
        setContainerName('');
        setPackages('');
        
        // Notify parent component
        if (onContainerCreated) {
          onContainerCreated(result);
        }
      } else {
        setError('Failed to create kernel container');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="docker-setup-form">
      <h3>Create Docker Kernel</h3>
      
      <form onSubmit={handleSubmit}>
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
          {isLoading ? 'Building...' : 'Build Kernel'}
        </button>
      </form>
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default DockerSetupForm;
