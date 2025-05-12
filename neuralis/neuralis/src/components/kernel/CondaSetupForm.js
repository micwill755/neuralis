import React, { useState } from 'react';

function CondaSetupForm({ onComplete, onBack, setIsLoading, setError }) {
  const [formData, setFormData] = useState({
    environmentName: 'neuralis-env',
    pythonVersion: '3.10',
    packages: 'numpy,pandas,matplotlib,scikit-learn'
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
      // Simulate conda environment creation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create kernel configuration
      const config = {
        type: 'conda',
        environmentName: formData.environmentName,
        pythonVersion: formData.pythonVersion,
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
          pattern="[a-zA-Z0-9_\-]+"
          title="Environment name can only contain letters, numbers, underscores, and hyphens"
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
          <option value="3.8">Python 3.8</option>
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
