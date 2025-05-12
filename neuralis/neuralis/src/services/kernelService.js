/**
 * Client-side service for managing connections to Python kernels running in Docker containers
 */

class KernelService {
  constructor() {
    this.baseUrl = 'http://localhost:8888';
    this.apiUrl = '/api/kernels'; // Backend API endpoint
    this.activeKernel = null;
    this.availableKernels = [];
    this.executionCallbacks = {};
  }

  /**
   * Initialize the kernel service and fetch available kernels
   */
  async initialize() {
    try {
      console.log('Initializing kernel service...');
      
      // Initialize the backend kernel manager
      const initResponse = await fetch(`${this.apiUrl}/initialize`);
      if (!initResponse.ok) {
        throw new Error('Failed to initialize kernel manager');
      }
      
      // Just check if the server is accessible
      const response = await fetch(`${this.baseUrl}/api/kernelspecs`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        console.error('Failed to connect to kernel server:', await response.text());
        throw new Error('Failed to connect to kernel server');
      }
      
      console.log('Kernel server is accessible');
      
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
      return this.availableKernels;
    } catch (error) {
      console.error('Error listing kernels:', error);
      return [];
    }
  }

  /**
   * Get available containers from the backend
   */
  async listContainers() {
    try {
      const response = await fetch(`${this.apiUrl}/containers`);
      if (!response.ok) {
        throw new Error('Failed to fetch containers');
      }
      
      const data = await response.json();
      return data.containers || [];
    } catch (error) {
      console.error('Error listing containers:', error);
      return [];
    }
  }

  /**
   * Get available conda environments from the backend
   */
  async listCondaEnvironments() {
    try {
      const response = await fetch(`${this.apiUrl}/conda-environments`);
      if (!response.ok) {
        throw new Error('Failed to fetch conda environments');
      }
      
      const data = await response.json();
      return data.environments || [];
    } catch (error) {
      console.error('Error listing conda environments:', error);
      return [];
    }
  }

  /**
   * Get available terminal instances from the backend
   */
  async listTerminals() {
    try {
      const response = await fetch('/api/terminals');
      if (!response.ok) {
        throw new Error('Failed to fetch terminal instances');
      }
      
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error listing terminal instances:', error);
      return [];
    }
  }

  /**
   * Build a new kernel container via the backend
   */
  async buildContainer(options = {}) {
    try {
      const response = await fetch(`${this.apiUrl}/containers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to build container');
      }
      
      const data = await response.json();
      return data.container;
    } catch (error) {
      console.error('Error building container:', error);
      throw error;
    }
  }

  /**
   * Start a kernel with the specified name
   */
  async startKernel(kernelName) {
    try {
      console.log('Starting kernel:', kernelName);
      
      // Check if this is a Docker container, conda env, or terminal
      if (kernelName.startsWith('docker-')) {
        // Handle Docker container kernel
        const containerName = kernelName.replace('docker-', '');
        // Implementation would connect to the Docker container's kernel
        console.log('Connecting to Docker container kernel:', containerName);
        // For now, we'll just simulate a connection
        this.activeKernel = {
          id: `docker-${Date.now()}`,
          name: containerName,
          type: 'docker'
        };
        return this.activeKernel;
      } else if (kernelName.startsWith('conda-')) {
        // Handle conda environment kernel
        const envName = kernelName.replace('conda-', '');
        console.log('Connecting to conda environment kernel:', envName);
        // For now, we'll just simulate a connection
        this.activeKernel = {
          id: `conda-${Date.now()}`,
          name: envName,
          type: 'conda'
        };
        return this.activeKernel;
      } else if (kernelName.startsWith('term-')) {
        // Handle terminal instance kernel
        const termName = kernelName.replace('term-', '');
        console.log('Connecting to terminal instance kernel:', termName);
        // For now, we'll just simulate a connection
        this.activeKernel = {
          id: `term-${Date.now()}`,
          name: termName,
          type: 'terminal'
        };
        return this.activeKernel;
      }
      
      // Default: Connect to Jupyter kernel
      const response = await fetch(`${this.baseUrl}/api/kernels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({ name: kernelName }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to start kernel:', errorText);
        throw new Error(`Failed to start kernel: ${response.statusText}`);
      }
      
      const kernelData = await response.json();
      console.log('Kernel started:', kernelData);
      
      this.activeKernel = {
        id: kernelData.id,
        name: kernelData.name,
        type: 'jupyter'
      };
      
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
    
    // Close existing connection if any
    if (this.ws) {
      console.log('Closing existing WebSocket connection');
      this.ws.close();
    }
    
    // Only set up WebSocket for Jupyter kernels
    if (this.activeKernel.type !== 'jupyter') {
      console.log('Not a Jupyter kernel, skipping WebSocket setup');
      return;
    }
    
    // Create new WebSocket connection
    const wsUrl = `ws://localhost:8888/api/kernels/${this.activeKernel.id}/channels`;
    console.log('Setting up WebSocket connection to:', wsUrl);
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('Kernel WebSocket connection established');
      };
      
      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleKernelMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('Kernel WebSocket error:', error);
      };
      
      this.ws.onclose = () => {
        console.log('Kernel WebSocket connection closed');
      };
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
    }
  }

  /**
   * Handle incoming messages from the kernel
   */
  handleKernelMessage(message) {
    console.log('Received kernel message:', message.msg_type || 'unknown type');
    
    // Handle different message types from the kernel
    if (message.msg_type === 'execute_result' || message.msg_type === 'stream' || message.msg_type === 'display_data') {
      const parentMsgId = message.parent_header?.msg_id;
      if (!parentMsgId) {
        console.warn('Message has no parent_header.msg_id:', message);
        return;
      }
      
      const callback = this.executionCallbacks[parentMsgId];
      
      if (callback) {
        let content = '';
        let imageData = null;
        
        if (message.msg_type === 'execute_result' && message.content?.data) {
          if (message.content.data['text/plain']) {
            content = message.content.data['text/plain'];
          } else if (message.content.data['text/html']) {
            content = message.content.data['text/html'];
          }
          
          // Check for image data
          if (message.content.data['image/png']) {
            imageData = {
              type: 'image/png',
              data: message.content.data['image/png']
            };
          }
        } else if (message.msg_type === 'stream' && message.content?.text) {
          content = message.content.text;
        } else if (message.msg_type === 'display_data' && message.content?.data) {
          // Handle display_data messages (often used for plots)
          if (message.content.data['text/plain']) {
            content = message.content.data['text/plain'];
          }
          
          // Check for image data
          if (message.content.data['image/png']) {
            imageData = {
              type: 'image/png',
              data: message.content.data['image/png']
            };
          }
        }
        
        callback({
          type: message.msg_type,
          content,
          imageData,
          executionCount: message.content?.execution_count,
        });
      } else {
        console.warn('No callback found for message ID:', parentMsgId);
      }
    }
    
    // Handle errors
    if (message.msg_type === 'error') {
      const parentMsgId = message.parent_header?.msg_id;
      if (!parentMsgId) return;
      
      const callback = this.executionCallbacks[parentMsgId];
      
      if (callback) {
        const errorMessage = message.content?.traceback?.join('\n') || 
                            message.content?.ename + ': ' + message.content?.evalue || 
                            'Unknown error';
        
        callback({
          type: 'error',
          content: errorMessage,
        });
      }
    }
    
    // Handle execution completion
    if (message.msg_type === 'status' && message.content?.execution_state === 'idle') {
      const parentMsgId = message.parent_header?.msg_id;
      if (!parentMsgId) return;
      
      const callback = this.executionCallbacks[parentMsgId];
      
      if (callback) {
        callback({ type: 'execution_complete' });
        // Don't delete the callback yet as there might be more messages coming
        // We'll delete it after a short timeout
        setTimeout(() => {
          delete this.executionCallbacks[parentMsgId];
        }, 1000);
      }
    }
  }

  /**
   * Execute code in the active kernel
   */
  async executeCode(code, onOutput) {
    if (!this.activeKernel) {
      throw new Error('No active kernel connection');
    }
    
    // Handle different kernel types
    if (this.activeKernel.type === 'docker') {
      // Execute code in Docker container
      return this.executeCodeInDocker(code, onOutput);
    } else if (this.activeKernel.type === 'conda') {
      // Execute code in conda environment
      return this.executeCodeInConda(code, onOutput);
    } else if (this.activeKernel.type === 'terminal') {
      // Execute code in terminal
      return this.executeCodeInTerminal(code, onOutput);
    }
    
    // Default: Execute in Jupyter kernel via WebSocket
    if (!this.ws) {
      throw new Error('No WebSocket connection to kernel');
    }
    
    // Create a message ID
    const msgId = `execute_${Date.now()}`;
    
    // Register callback for this execution
    this.executionCallbacks[msgId] = onOutput;
    
    // Create execute request message
    const message = {
      header: {
        msg_id: msgId,
        username: 'neuralis',
        session: `session_${Date.now()}`,
        msg_type: 'execute_request',
        version: '5.2',
      },
      content: {
        code: code,
        silent: false,
        store_history: true,
        user_expressions: {},
        allow_stdin: false,
      },
      metadata: {},
      parent_header: {},
      channel: 'shell',
    };
    
    console.log('Sending execute request:', msgId);
    
    // Send the message
    this.ws.send(JSON.stringify(message));
    
    return msgId;
  }
  
  /**
   * Execute code in a Docker container
   */
  async executeCodeInDocker(code, onOutput) {
    const msgId = `docker_${Date.now()}`;
    
    try {
      // Simulate execution in Docker container
      console.log('Executing code in Docker container:', this.activeKernel.name);
      
      // Call onOutput with initial status
      onOutput({
        type: 'stream',
        content: `Executing in Docker container: ${this.activeKernel.name}\n`,
      });
      
      // Simulate execution delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate execution result
      onOutput({
        type: 'execute_result',
        content: 'Docker execution result: ' + code.substring(0, 50) + (code.length > 50 ? '...' : ''),
        executionCount: Math.floor(Math.random() * 100),
      });
      
      // Simulate execution completion
      onOutput({ type: 'execution_complete' });
      
      return msgId;
    } catch (error) {
      onOutput({
        type: 'error',
        content: `Error executing in Docker: ${error.message}`,
      });
      throw error;
    }
  }
  
  /**
   * Execute code in a conda environment
   */
  async executeCodeInConda(code, onOutput) {
    const msgId = `conda_${Date.now()}`;
    
    try {
      // Simulate execution in conda environment
      console.log('Executing code in conda environment:', this.activeKernel.name);
      
      // Call onOutput with initial status
      onOutput({
        type: 'stream',
        content: `Executing in conda environment: ${this.activeKernel.name}\n`,
      });
      
      // Simulate execution delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate execution result
      onOutput({
        type: 'execute_result',
        content: 'Conda execution result: ' + code.substring(0, 50) + (code.length > 50 ? '...' : ''),
        executionCount: Math.floor(Math.random() * 100),
      });
      
      // Simulate execution completion
      onOutput({ type: 'execution_complete' });
      
      return msgId;
    } catch (error) {
      onOutput({
        type: 'error',
        content: `Error executing in conda: ${error.message}`,
      });
      throw error;
    }
  }
  
  /**
   * Execute code in a terminal
   */
  async executeCodeInTerminal(code, onOutput) {
    const msgId = `terminal_${Date.now()}`;
    
    try {
      // Simulate execution in terminal
      console.log('Executing code in terminal:', this.activeKernel.name);
      
      // Call onOutput with initial status
      onOutput({
        type: 'stream',
        content: `Executing in terminal: ${this.activeKernel.name}\n`,
      });
      
      // Simulate execution delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate execution result
      onOutput({
        type: 'execute_result',
        content: 'Terminal execution result: ' + code.substring(0, 50) + (code.length > 50 ? '...' : ''),
        executionCount: Math.floor(Math.random() * 100),
      });
      
      // Simulate execution completion
      onOutput({ type: 'execution_complete' });
      
      return msgId;
    } catch (error) {
      onOutput({
        type: 'error',
        content: `Error executing in terminal: ${error.message}`,
      });
      throw error;
    }
  }

  /**
   * Restart the current kernel
   */
  async restartKernel() {
    if (!this.activeKernel) return false;
    
    // Handle different kernel types
    if (this.activeKernel.type !== 'jupyter') {
      // Simulate restart for non-Jupyter kernels
      console.log(`Restarting ${this.activeKernel.type} kernel: ${this.activeKernel.name}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/api/kernels/${this.activeKernel.id}/restart`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      
      return response.ok;
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
    
    // Handle different kernel types
    if (this.activeKernel.type !== 'jupyter') {
      // Simulate interrupt for non-Jupyter kernels
      console.log(`Interrupting ${this.activeKernel.type} kernel: ${this.activeKernel.name}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/api/kernels/${this.activeKernel.id}/interrupt`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      
      return response.ok;
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
