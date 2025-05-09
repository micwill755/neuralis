/**
 * Service for managing Docker-based Python kernels
 */
import { spawn } from 'child_process';

class KernelManager {
  constructor() {
    this.containers = [];
    this.initialized = false;
  }

  /**
   * Initialize the kernel manager
   */
  async initialize() {
    if (this.initialized) return true;
    
    try {
      // Check if Docker is available
      await this.executeCommand('docker --version');
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Docker is not available:', error);
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
      name = `neuralis-kernel-${pythonVersion}`
    } = options;
    
    try {
      // Execute the build script
      const scriptPath = '/Users/Wiggum/Documents/Neuralis/neuralis/neuralis/scripts/build_kernel_container.sh';
      const result = await this.executeCommand(
        `${scriptPath} --python-version ${pythonVersion} --port ${port} --name ${name}`
      );
      
      // Add container to the list
      this.containers.push({
        name,
        pythonVersion,
        port,
        url: `http://localhost:${port}`,
        status: 'running'
      });
      
      return {
        success: true,
        container: this.containers[this.containers.length - 1],
        output: result
      };
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
      const result = await this.executeCommand(
        'docker ps --filter "name=neuralis-kernel" --format "{{.Names}}|{{.Ports}}"'
      );
      
      const containers = result.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [name, ports] = line.split('|');
          const portMatch = ports.match(/0\.0\.0\.0:(\d+)/);
          const port = portMatch ? parseInt(portMatch[1]) : null;
          
          return {
            name,
            port,
            url: port ? `http://localhost:${port}` : null,
            status: 'running'
          };
        });
      
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
      await this.executeCommand(`docker stop ${name}`);
      await this.executeCommand(`docker rm ${name}`);
      
      // Update containers list
      this.containers = this.containers.filter(c => c.name !== name);
      
      return true;
    } catch (error) {
      console.error(`Failed to stop container ${name}:`, error);
      return false;
    }
  }

  /**
   * Execute a shell command
   */
  executeCommand(command) {
    return new Promise((resolve, reject) => {
      const process = spawn('bash', ['-c', command]);
      
      let stdout = '';
      let stderr = '';
      
      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });
      
      process.on('error', (err) => {
        reject(err);
      });
    });
  }
}

// Create a singleton instance
const kernelManager = new KernelManager();

export default kernelManager;
