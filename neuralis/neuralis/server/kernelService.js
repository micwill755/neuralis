/**
 * Kernel Service for the backend
 * Handles creation and management of kernel environments
 */
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

/**
 * Create a conda environment
 * @param {Object} params - Environment parameters
 * @returns {Promise<Object>} - Created environment info
 */
async function createCondaEnvironment(params) {
  const { name, pythonVersion, packages = [] } = params;
  
  try {
    console.log(`Creating conda environment: ${name} with Python ${pythonVersion}`);
    
    // Create the conda environment with specified Python version
    const createCommand = `conda create -y -n ${name} python=${pythonVersion}`;
    await execAsync(createCommand);
    
    // Install packages if specified
    if (packages && packages.length > 0) {
      const packagesStr = packages.join(' ');
      const installCommand = `conda install -y -n ${name} ${packagesStr}`;
      await execAsync(installCommand);
    }
    
    // Get environment info
    const infoCommand = `conda info --envs | grep ${name}`;
    const { stdout } = await execAsync(infoCommand);
    
    return {
      success: true,
      name,
      type: 'conda',
      pythonVersion,
      packages,
      path: stdout.trim().split(/\s+/)[1],
      status: 'active'
    };
  } catch (error) {
    console.error('Error creating conda environment:', error);
    throw new Error(`Failed to create conda environment: ${error.message}`);
  }
}

/**
 * Create a Docker container for a kernel
 * @param {Object} params - Container parameters
 * @returns {Promise<Object>} - Created container info
 */
async function createDockerContainer(params) {
  const { name, image, ports = {} } = params;
  
  try {
    console.log(`Creating Docker container: ${name} using image ${image}`);
    
    // Build port mapping string
    const portMappings = Object.entries(ports)
      .map(([host, container]) => `-p ${host}:${container}`)
      .join(' ');
    
    // Create and start the Docker container
    const createCommand = `docker run -d --name ${name} ${portMappings} ${image}`;
    const { stdout: containerId } = await execAsync(createCommand);
    
    // Get container info
    const infoCommand = `docker inspect ${containerId.trim()}`;
    const { stdout: containerInfo } = await execAsync(infoCommand);
    const containerData = JSON.parse(containerInfo)[0];
    
    return {
      success: true,
      name,
      type: 'docker',
      image,
      containerId: containerId.trim(),
      status: 'running',
      ports,
      ipAddress: containerData.NetworkSettings.IPAddress
    };
  } catch (error) {
    console.error('Error creating Docker container:', error);
    throw new Error(`Failed to create Docker container: ${error.message}`);
  }
}

/**
 * Connect to a terminal-based kernel
 * @param {Object} params - Connection parameters
 * @returns {Promise<Object>} - Connection info
 */
async function connectToTerminalKernel(params) {
  const { host, port, credentials = {} } = params;
  
  try {
    console.log(`Connecting to terminal kernel at ${host}:${port}`);
    
    // Test the connection (this is a simplified example)
    const testCommand = `nc -z -w 5 ${host} ${port}`;
    await execAsync(testCommand);
    
    return {
      success: true,
      type: 'terminal',
      host,
      port,
      connectionId: `conn_${Date.now()}`,
      status: 'connected'
    };
  } catch (error) {
    console.error('Error connecting to terminal kernel:', error);
    throw new Error(`Failed to connect to terminal kernel: ${error.message}`);
  }
}

/**
 * Start a kernel
 * @param {string} kernelId - ID of the kernel to start
 * @param {Object} kernelInfo - Information about the kernel
 * @returns {Promise<Object>} - Updated kernel info
 */
async function startKernel(kernelId, kernelInfo) {
  try {
    const { type } = kernelInfo;
    
    if (type === 'conda') {
      // For conda environments, we don't need to "start" them
      return { ...kernelInfo, status: 'active' };
    } else if (type === 'docker') {
      // Start the Docker container
      await execAsync(`docker start ${kernelInfo.containerId}`);
      return { ...kernelInfo, status: 'active' };
    } else if (type === 'terminal') {
      // For terminal connections, we would reconnect
      return { ...kernelInfo, status: 'active' };
    }
    
    throw new Error(`Unknown kernel type: ${type}`);
  } catch (error) {
    console.error('Error starting kernel:', error);
    throw new Error(`Failed to start kernel: ${error.message}`);
  }
}

/**
 * Stop a kernel
 * @param {string} kernelId - ID of the kernel to stop
 * @param {Object} kernelInfo - Information about the kernel
 * @returns {Promise<Object>} - Updated kernel info
 */
async function stopKernel(kernelId, kernelInfo) {
  try {
    const { type } = kernelInfo;
    
    if (type === 'conda') {
      // For conda environments, we don't need to "stop" them
      return { ...kernelInfo, status: 'inactive' };
    } else if (type === 'docker') {
      // Stop the Docker container
      await execAsync(`docker stop ${kernelInfo.containerId}`);
      return { ...kernelInfo, status: 'inactive' };
    } else if (type === 'terminal') {
      // For terminal connections, we would disconnect
      return { ...kernelInfo, status: 'inactive' };
    }
    
    throw new Error(`Unknown kernel type: ${type}`);
  } catch (error) {
    console.error('Error stopping kernel:', error);
    throw new Error(`Failed to stop kernel: ${error.message}`);
  }
}

/**
 * Restart a kernel
 * @param {string} kernelId - ID of the kernel to restart
 * @param {Object} kernelInfo - Information about the kernel
 * @returns {Promise<Object>} - Updated kernel info
 */
async function restartKernel(kernelId, kernelInfo) {
  try {
    const { type } = kernelInfo;
    
    if (type === 'conda') {
      // For conda environments, we don't need to "restart" them
      return { ...kernelInfo, status: 'active' };
    } else if (type === 'docker') {
      // Restart the Docker container
      await execAsync(`docker restart ${kernelInfo.containerId}`);
      return { ...kernelInfo, status: 'active' };
    } else if (type === 'terminal') {
      // For terminal connections, we would reconnect
      return { ...kernelInfo, status: 'active' };
    }
    
    throw new Error(`Unknown kernel type: ${type}`);
  } catch (error) {
    console.error('Error restarting kernel:', error);
    throw new Error(`Failed to restart kernel: ${error.message}`);
  }
}

/**
 * Get available kernels
 * @returns {Promise<Array>} - List of available kernels
 */
async function getAvailableKernels() {
  try {
    const kernels = [];
    
    // Get conda environments
    try {
      const { stdout: condaOutput } = await execAsync('conda info --envs');
      const condaLines = condaOutput.split('\n').filter(line => line.trim() && !line.includes('*'));
      
      // Skip header lines
      const envLines = condaLines.slice(2);
      
      for (const line of envLines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2) {
          const name = parts[0];
          const path = parts[1];
          
          // Try to determine Python version
          let pythonVersion = '3.x';
          try {
            const { stdout: versionOutput } = await execAsync(`conda run -n ${name} python --version`);
            pythonVersion = versionOutput.trim().split(' ')[1];
          } catch (e) {
            // Ignore errors getting Python version
          }
          
          kernels.push({
            id: `conda_${name}`,
            name,
            language: 'python',
            type: 'conda',
            pythonVersion,
            path,
            packages: []
          });
        }
      }
    } catch (condaError) {
      console.error('Error getting conda environments:', condaError);
    }
    
    // Get Docker containers
    try {
      const { stdout: dockerOutput } = await execAsync('docker ps -a --format "{{.ID}}|{{.Names}}|{{.Image}}|{{.Status}}"');
      const dockerLines = dockerOutput.split('\n').filter(line => line.trim());
      
      for (const line of dockerLines) {
        const [containerId, name, image, status] = line.split('|');
        
        kernels.push({
          id: `docker_${containerId}`,
          name,
          language: image.includes('python') ? 'python' : 
                   image.includes('r-') ? 'r' : 'unknown',
          type: 'docker',
          image,
          containerId,
          status: status.includes('Up') ? 'active' : 'inactive'
        });
      }
    } catch (dockerError) {
      console.error('Error getting Docker containers:', dockerError);
    }
    
    return kernels;
  } catch (error) {
    console.error('Error getting available kernels:', error);
    throw error;
  }
}

module.exports = {
  createCondaEnvironment,
  createDockerContainer,
  connectToTerminalKernel,
  startKernel,
  stopKernel,
  restartKernel,
  getAvailableKernels
};
