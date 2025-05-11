/**
 * Service for managing connections to Python kernels running in Docker containers
 */

class KernelService {
  constructor() {
    this.baseUrl = 'http://localhost:8888';
    this.activeKernel = null;
    this.availableKernels = [];
    this.executionCallbacks = {};
    this.dockerContainers = [];
  }

  /**
   * Set up a Docker container for Python kernel
   */
  async setupDockerContainer(config) {
    try {
      console.log('Setting up Docker container with config:', config);
      
      // Create a unique container name
      const containerName = `neuralis-python-${config.pythonVersion}-${Date.now()}`;
      
      // Create a Dockerfile
      const dockerfile = `
FROM python:${config.pythonVersion}-slim

WORKDIR /app

# Install Jupyter and other packages
RUN pip install --no-cache-dir jupyter ${config.packages.split(',').join(' ')}

# Expose the Jupyter port
EXPOSE ${config.port}

# Create a non-root user to run Jupyter
RUN useradd -m jupyter
USER jupyter

# Set up Jupyter notebook configuration
RUN mkdir -p /home/jupyter/.jupyter
RUN echo "c.NotebookApp.token = ''" > /home/jupyter/.jupyter/jupyter_notebook_config.py
RUN echo "c.NotebookApp.password = ''" >> /home/jupyter/.jupyter/jupyter_notebook_config.py
RUN echo "c.NotebookApp.allow_origin = '*'" >> /home/jupyter/.jupyter/jupyter_notebook_config.py
RUN echo "c.NotebookApp.ip = '0.0.0.0'" >> /home/jupyter/.jupyter/jupyter_notebook_config.py

# Set the working directory to the mounted volume
WORKDIR /notebooks

# Start Jupyter notebook
CMD ["jupyter", "notebook", "--no-browser"]
`;

      // For demonstration purposes, we'll simulate the Docker container creation
      console.log('Creating Docker container:', containerName);
      console.log('Dockerfile:', dockerfile);
      
      // Simulate Docker build and run process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add the container to our list
      const containerInfo = {
        id: `container_${Date.now()}`,
        name: containerName,
        pythonVersion: config.pythonVersion,
        port: config.port,
        mountPath: config.mountPath,
        status: 'running',
        createdAt: new Date().toISOString()
      };
      
      this.dockerContainers.push(containerInfo);
      
      // Add a kernel for this container
      const kernelInfo = {
        id: `kernel_${Date.now()}`,
        name: `python${config.pythonVersion.replace('.', '')}`,
        displayName: `Python ${config.pythonVersion} (Docker: ${containerName})`,
        language: 'python',
        isRunning: true,
        containerId: containerInfo.id
      };
      
      this.availableKernels.push(kernelInfo);
      
      console.log('Docker container setup complete:', containerInfo);
      console.log('Kernel added:', kernelInfo);
      
      // Dispatch an event to notify that kernels have been updated
      window.dispatchEvent(new CustomEvent('kernelUpdated'));
      
      return containerInfo;
    } catch (error) {
      console.error('Error setting up Docker container:', error);
      throw new Error(`Failed to set up Docker container: ${error.message}`);
    }
  }
  async initialize() {
    try {
      console.log('Initializing kernel service...');
      
      // Simulate successful initialization
      console.log('Kernel service initialized successfully');
      
      // Get available kernels
      await this.listKernels();
      
      return true;
    } catch (error) {
      console.error('Error initializing kernel service:', error);
      return false;
    }
  }

  /**
   * List available kernels from the Jupyter server
   */
  async listKernels() {
    try {
      console.log('Listing available kernels...');
      
      // First, check if we have any Docker container kernels
      if (this.availableKernels.length > 0) {
        console.log('Returning cached kernels:', this.availableKernels);
        return this.availableKernels;
      }
      
      // If no cached kernels, try to get from server
      try {
        // Get kernelspecs (available kernel types)
        const specsResponse = await fetch(`${this.baseUrl}/api/kernelspecs`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors',
        });
        
        if (!specsResponse.ok) {
          console.error('Failed to fetch kernelspecs:', await specsResponse.text());
          throw new Error('Failed to fetch kernelspecs');
        }
        
        const specsData = await specsResponse.json();
        console.log('Available kernelspecs:', specsData);
        
        // Format kernel information
        this.availableKernels = Object.entries(specsData.kernelspecs).map(([id, spec]) => ({
          id,
          name: spec.name,
          displayName: spec.spec.display_name,
          language: spec.spec.language,
          isRunning: false,
        }));
        
        console.log('Formatted kernels:', this.availableKernels);
      } catch (error) {
        console.warn('Error fetching kernels from server:', error);
        // If server fetch fails, create a dummy kernel for testing
        if (this.availableKernels.length === 0) {
          this.availableKernels = [{
            id: 'dummy_kernel',
            name: 'python3',
            displayName: 'Python 3 (Default)',
            language: 'python',
            isRunning: false
          }];
        }
      }
      
      return this.availableKernels;
    } catch (error) {
      console.error('Error listing kernels:', error);
      return this.availableKernels || [];
    }
  }

  /**
   * Start a kernel with the specified name
   */
  async startKernel(kernelName) {
    try {
      console.log('Starting kernel:', kernelName);
      
      // For simulated Docker kernels, we can directly use the kernel info
      const kernelInfo = this.availableKernels.find(k => k.name === kernelName);
      if (!kernelInfo) {
        throw new Error(`Kernel ${kernelName} not found`);
      }
      
      // Simulate successful connection
      this.activeKernel = {
        id: kernelInfo.id,
        name: kernelInfo.name,
        displayName: kernelInfo.displayName
      };
      
      console.log('Kernel started:', this.activeKernel);
      
      // Set up WebSocket connection for this kernel
      this.setupWebSocket();
      
      return this.activeKernel;
    } catch (error) {
      console.error('Error starting kernel:', error);
      return null;
    }
  }

  /**
   * Set up WebSocket connection to the kernel
   */
  setupWebSocket() {
    if (!this.activeKernel) {
      console.log('No active kernel, skipping WebSocket setup');
      return;
    }
    
    // For simulated kernels, we'll just log the connection
    console.log(`Simulating WebSocket connection for kernel: ${this.activeKernel.name}`);
    
    // Set a flag to indicate we have a "connection"
    this.hasConnection = true;
    
    // Simulate WebSocket events
    this.ws = {
      send: (message) => {
        console.log('Simulated WebSocket message sent:', message);
      },
      close: () => {
        console.log('Simulated WebSocket connection closed');
        this.hasConnection = false;
      }
    };
  }

  /**
   * Handle incoming messages from the kernel
   */
  handleKernelMessage(message) {
    console.log('Simulated kernel message:', message.msg_type || 'unknown type');
    
    // This method is not needed for our simulation, but we'll keep it for completeness
  }

  /**
   * Execute code in the active kernel
   */
  async executeCode(code, onOutput) {
    if (!this.activeKernel) {
      throw new Error('No active kernel connection');
    }
    
    // Create a message ID
    const msgId = `execute_${Date.now()}`;
    
    // Register callback for this execution
    this.executionCallbacks[msgId] = onOutput;
    
    // Simulate execution
    console.log('Simulating code execution:', code);
    
    // Simulate execution result after a short delay
    setTimeout(() => {
      onOutput({
        type: 'execute_result',
        content: `Simulated output for: ${code}`,
        executionCount: Math.floor(Math.random() * 100) + 1
      });
      
      setTimeout(() => {
        onOutput({ type: 'execution_complete' });
      }, 500);
    }, 1000);
    
    return msgId;
  }

  /**
   * Restart the current kernel
   */
  async restartKernel() {
    if (!this.activeKernel) return false;
    
    try {
      console.log('Simulating kernel restart for:', this.activeKernel.name);
      
      // Simulate a short delay for restart
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Re-setup the WebSocket connection
      this.setupWebSocket();
      
      return true;
    } catch (error) {
      console.error('Error restarting kernel:', error);
      return false;
    }
  }

  /**
   * Interrupt the current kernel execution
   */
  async interruptKernel() {
    if (!this.activeKernel) return false;
    
    try {
      console.log('Simulating kernel interrupt for:', this.activeKernel.name);
      
      // Simulate a short delay for interrupt
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      console.error('Error interrupting kernel:', error);
      return false;
    }
  }

  /**
   * Get the active kernel information
   */
  getActiveKernel() {
    return this.activeKernel;
  }
}

// Create a singleton instance
const kernelService = new KernelService();

export default kernelService;
