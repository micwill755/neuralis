/**
 * Client-side service for managing Docker-based Python kernels
 * This service communicates with the backend API instead of using Node.js modules directly
 */

class KernelManager {
  constructor() {
    this.apiUrl = '/api';
    this.containers = [];
    this.initialized = false;
  }

  /**
   * Initialize the kernel manager
   */
  async initialize() {
    if (this.initialized) return true;
    
    try {
      // Check if Docker is available via the backend API
      const response = await fetch(`${this.apiUrl}/docker/check`);
      const data = await response.json();
      
      this.initialized = data.available;
      return data.available;
    } catch (error) {
      console.error('Docker is not available:', error);
      return false;
    }
  }

  /**
   * Build a Python kernel container
   */
  async buildKernelContainer(options = {}) {
    try {
      const response = await fetch(`${this.apiUrl}/containers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });
      
      const result = await response.json();
      
      if (result.success && result.container) {
        // Add container to the list
        this.containers.push(result.container);
      }
      
      return result;
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
      const response = await fetch(`${this.apiUrl}/containers`);
      const data = await response.json();
      
      this.containers = data;
      return data;
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
      const response = await fetch(`${this.apiUrl}/containers/${name}`, {
        method: 'DELETE',
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
}

// Create a singleton instance
const kernelManager = new KernelManager();

export default kernelManager;