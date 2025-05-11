import React, { useState } from 'react';
import { createCondaEnvironment } from '../../services/kernelService';

function CondaSetupForm({ onComplete, onBack, setIsLoading, setError }) {
  const [formData, setFormData] = useState({
    environmentName: 'neuralis-env',
    pythonVersion: '3.12',
    packages: 'numpy,pandas,matplotlib,scikit-learn',
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
      // Execute conda commands to create environment
      await createCondaEnvironment(formData);
      
      // Create kernel configuration
      const config = {
        type: 'conda',
        environmentName: formData.environmentName,
        pythonVersion: formData.pythonVersion,
        kernelPath: `~/.local/share/neuralis/kernels/${formData.environmentName}`,
        packages: formData.packages.split(',').map(pkg => pkg.trim()),
        timestamp: new Date().toISOString()
      };
      
      onComplete(config);
    } catch (error) {
      setError(error.message || 'Failed to create Conda environment');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="setup-form">
      <button type="button" onClick={onBack} className="back-button">
        ← Back
      </button>
      
      <h3>Configure Conda Environment</h3>
      
      <div className="form-group">
        <label>Environment Name</label>
        <input 
          type="text" 
          name="environmentName" 
          value={formData.environmentName}
          onChange={handleChange}
          required
        />
      </div>
      
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
      
      <button type="submit" className="setup-button">
        Create Conda Environment
      </button>
    </form>
  );
}

export default CondaSetupForm;
