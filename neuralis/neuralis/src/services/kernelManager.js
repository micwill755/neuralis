/**
 * Service for managing Docker-based Python kernels
 * Implementation based on KERNEL_SETUP.md requirements
 * Uses backend API instead of direct child_process calls
 */

class KernelManager {
  constructor() {
    this.containers = [];
    this.initialized = false;
    this.apiBaseUrl = 'http://localhost:3001/api';
  }

  /**
   * Initialize the kernel manager
   */
  async initialize() {
    if (this.initialized) return true;
    
    try {
      // Check if Docker is available via API
      const response = await fetch(`${this.apiBaseUrl}/docker/check`);
      const data = await response.json();
      
      this.initialized = data.available;
      
      if (this.initialized) {
        // List existing containers
        await this.listContainers();
      }
      
      return this.initialized;
    } catch (error) {
      console.error('Error checking Docker availability:', error);
      return false;
    }
  }

  /**
   * Build a Python kernel container
   */
  async buildKernelContainer(options = {}) {
    const {
      pythonVersion = '3.9',
      port = 8888,
      name = `neuralis-kernel-${pythonVersion}`,
      packages = ''
    } = options;
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/containers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pythonVersion,
          port,
          name,
          packages
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Add container to the list
        const container = {
          name,
          pythonVersion,
          port,
          url: `http://localhost:${port}`,
          status: 'running'
        };
        
        this.containers.push(container);
        
        return {
          success: true,
          container,
          output: result.output
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      console.error('Failed to build kernel container:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List all running kernel containers
   */
  async listContainers() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/containers`);
      const containers = await response.json();
      
      this.containers = containers;
      return containers;
    } catch (error) {
      console.error('Failed to list containers:', error);
      return [];
    }
  }

  /**
   * Stop a kernel container
   */
  async stopContainer(name) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/containers/${name}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update containers list
        this.containers = this.containers.filter(c => c.name !== name);
      }
      
      return result.success;
    } catch (error) {
      console.error(`Failed to stop container ${name}:`, error);
      return false;
    }
  }

  /**
   * Restart a kernel container
   */
  async restartContainer(name) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/containers/${name}/restart`, {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update container status
        const container = this.containers.find(c => c.name === name);
        if (container) {
          container.status = 'running';
        }
      }
      
      return result.success;
    } catch (error) {
      console.error(`Failed to restart container ${name}:`, error);
      return false;
    }
  }

  /**
   * Get logs from a kernel container
   */
  async getContainerLogs(name) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/containers/${name}/logs`);
      const data = await response.json();
      
      return data.logs || '';
    } catch (error) {
      console.error(`Failed to get logs for container ${name}:`, error);
      return '';
    }
  }
}

// Create a singleton instance
const kernelManager = new KernelManager();

export default kernelManager;
