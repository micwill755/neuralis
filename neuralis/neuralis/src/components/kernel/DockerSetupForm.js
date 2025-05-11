import React, { useState } from 'react';
import { setupDockerContainer } from '../../services/kernelService';

function DockerSetupForm({ onComplete, onBack, setIsLoading, setError }) {
  const [formData, setFormData] = useState({
    pythonVersion: '3.12',
    packages: 'numpy,pandas,matplotlib,scikit-learn',
    port: '8888',
    mountPath: '~/neuralis-notebooks'
  });
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Show loading indicator
    setIsLoading(true);
    
    try {
      // Generate Docker files and start container
      await setupDockerContainer(formData);
      
      // Create kernel configuration
      const config = {
        type: 'docker',
        pythonVersion: formData.pythonVersion,
        host: 'localhost',
        port: formData.port,
        mountPath: formData.mountPath,
        packages: formData.packages.split(',').map(pkg => pkg.trim()),
        timestamp: new Date().toISOString()
      };
      
      onComplete(config);
    } catch (error) {
      setError(error.message || 'Failed to set up Docker container');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="setup-form">
      <button type="button" onClick={onBack} className="back-button">
        ← Back
      </button>
      
      <h3>Configure Docker Container</h3>
      
      <div className="form-group">
        <label>Python Version</label>
        <select 
          name="pythonVersion" 
          value={formData.pythonVersion}
          onChange={handleChange}
        >
          <option value="3.12">Python 3.12</option>
          <option value="3.11">Python 3.11</option>
          <option value="3.10">Python 3.10</option>
          <option value="3.9">Python 3.9</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>Packages (comma-separated)</label>
        <input 
          type="text" 
          name="packages" 
          value={formData.packages}
          onChange={handleChange}
        />
        <small className="form-help">Common packages: numpy, pandas, matplotlib, scikit-learn, tensorflow, pytorch</small>
      </div>
      
      <div className="form-group">
        <label>Port</label>
        <input 
          type="text" 
          name="port" 
          value={formData.port}
          onChange={handleChange}
          pattern="[0-9]+"
          title="Please enter a valid port number"
        />
      </div>
      
      <div className="form-group">
        <label>Notebook Mount Path</label>
        <input 
          type="text" 
          name="mountPath" 
          value={formData.mountPath}
          onChange={handleChange}
        />
        <small className="form-help">Local path where notebook files will be stored</small>
      </div>
      
      <button type="submit" className="setup-button">
        Create Docker Container
      </button>
    </form>
  );
}

export default DockerSetupForm;
