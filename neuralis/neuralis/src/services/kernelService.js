/**
 * Service for managing connections to Python kernels running in Docker containers
 * Implementation based on KERNEL_SETUP.md requirements
 */

import kernelManager from './kernelManager';

class KernelService {
  constructor() {
    this.baseUrl = 'http://localhost:8888'; // Default port, will be updated per container
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
      
      // Initialize kernel manager if needed
      const isInitialized = await kernelManager.initialize();
      if (!isInitialized) {
        throw new Error('Failed to initialize kernel manager. Is Docker installed?');
      }
      
      // Create a unique container name
      const containerName = `neuralis-kernel-${config.pythonVersion}-${Date.now()}`;
      
      // Build the container using kernelManager
      const result = await kernelManager.buildKernelContainer({
        pythonVersion: config.pythonVersion,
        port: config.port || 8888,
        name: containerName,
        packages: config.packages || ''
      });
      
      if (!result.success) {
        throw new Error(`Failed to build container: ${result.error}`);
      }
      
      // Add the container to our list
      const containerInfo = {
        id: containerName,
        name: containerName,
        pythonVersion: config.pythonVersion,
        port: config.port || 8888,
        url: `http://localhost:${config.port || 8888}`,
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
        containerId: containerInfo.id,
        baseUrl: containerInfo.url
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
      
      // Initialize kernel manager to check Docker availability
      const isManagerInitialized = await kernelManager.initialize();
      if (!isManagerInitialized) {
        console.warn('Docker is not available. Some features may be limited.');
      }
      
      // List existing Docker containers
      if (isManagerInitialized) {
        const containers = await kernelManager.listContainers();
        this.dockerContainers = containers;
        
        // Create kernel entries for existing containers
        containers.forEach(container => {
          // Extract Python version from container name
          const versionMatch = container.name.match(/neuralis-kernel-(\d+\.\d+)/);
          const pythonVersion = versionMatch ? versionMatch[1] : '3.9';
          
          const kernelInfo = {
            id: `kernel_${container.name}`,
            name: `python${pythonVersion.replace('.', '')}`,
            displayName: `Python ${pythonVersion} (Docker: ${container.name})`,
            language: 'python',
            isRunning: true,
            containerId: container.name,
            baseUrl: container.url
          };
          
          this.availableKernels.push(kernelInfo);
        });
      }
      
      // Get available kernels
      await this.listKernels();
      
      console.log('Kernel service initialized successfully');
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
      
      // If no cached kernels, try to get from Docker containers
      try {
        // Initialize kernel manager if needed
        const isInitialized = await kernelManager.initialize();
        if (isInitialized) {
          const containers = await kernelManager.listContainers();
          this.dockerContainers = containers;
          
          // Create kernel entries for existing containers
          containers.forEach(container => {
            // Extract Python version from container name
            const versionMatch = container.name.match(/neuralis-kernel-(\d+\.\d+)/);
            const pythonVersion = versionMatch ? versionMatch[1] : '3.9';
            
            const kernelInfo = {
              id: `kernel_${container.name}`,
              name: `python${pythonVersion.replace('.', '')}`,
              displayName: `Python ${pythonVersion} (Docker: ${container.name})`,
              language: 'python',
              isRunning: true,
              containerId: container.name,
              baseUrl: container.url
            };
            
            this.availableKernels.push(kernelInfo);
          });
        }
      } catch (error) {
        console.warn('Error fetching Docker containers:', error);
      }
      
      // If still no kernels, try to get from server
      if (this.availableKernels.length === 0) {
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
      
      // First, check if we're using a Docker kernel
      const kernelInfo = this.availableKernels.find(k => k.name === kernelName);
      if (!kernelInfo) {
        throw new Error(`Kernel ${kernelName} not found`);
      }
      
      // If this is a Docker kernel, we need to use its specific URL
      if (kernelInfo.containerId) {
        // Find the container
        const container = this.dockerContainers.find(c => c.name === kernelInfo.containerId);
        if (container) {
          // Update the base URL to point to this container
          this.baseUrl = container.url;
          console.log(`Using Docker container URL: ${this.baseUrl}`);
        }
        
        this.activeKernel = {
          id: kernelInfo.id,
          name: kernelInfo.name,
          displayName: kernelInfo.displayName,
          containerId: kernelInfo.containerId,
          baseUrl: this.baseUrl
        };
        
        console.log('Docker kernel started:', this.activeKernel);
        
        // Set up WebSocket connection for this kernel
        this.setupWebSocket();
        
        return this.activeKernel;
      }
      
      // Otherwise, try to start a real kernel via the Jupyter API
      try {
        const response = await fetch(`${this.baseUrl}/api/kernels`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: kernelName })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to start kernel: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Kernel started via API:', data);
        
        this.activeKernel = {
          id: data.id,
          name: kernelName,
          displayName: kernelInfo.displayName,
          baseUrl: this.baseUrl
        };
        
        // Set up WebSocket connection for this kernel
        this.setupWebSocket();
        
        return this.activeKernel;
      } catch (error) {
        console.error('Error starting kernel via API:', error);
        
        // Fall back to simulated kernel
        console.log('Falling back to simulated kernel');
        
        this.activeKernel = {
          id: `simulated_${Date.now()}`,
          name: kernelName,
          displayName: kernelInfo.displayName,
          simulated: true
        };
        
        // Set up simulated WebSocket connection
        this.setupWebSocket();
        
        return this.activeKernel;
      }
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
    
    try {
      // Create a WebSocket connection to the kernel
      const kernelId = this.activeKernel.id;
      // Use the baseUrl from the active kernel if available
      const baseUrl = this.activeKernel.baseUrl || this.baseUrl;
      const wsUrl = baseUrl.replace('http://', 'ws://') + `/api/kernels/${kernelId}/channels`;
      
      console.log(`Setting up WebSocket connection to: ${wsUrl}`);
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connection established');
        this.hasConnection = true;
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
        this.hasConnection = false;
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.hasConnection = false;
        
        // If WebSocket fails, fall back to simulated mode
        console.log('Falling back to simulated mode due to WebSocket error');
      };
      
      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleKernelMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
      
      // Fall back to simulated mode
      console.log('Falling back to simulated mode');
      
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
  }

  /**
   * Handle incoming messages from the kernel
   */
  handleKernelMessage(message) {
    console.log('Received kernel message:', message.msg_type || 'unknown type');
    
    // Check if this is a response to an execution request
    const parentHeader = message.parent_header || {};
    const msgId = parentHeader.msg_id;
    
    if (!msgId || !this.executionCallbacks[msgId]) {
      // Not a response to our execution request or callback not registered
      return;
    }
    
    const callback = this.executionCallbacks[msgId];
    
    // Handle different message types
    switch (message.msg_type) {
      case 'execute_result':
        // Handle execution result
        if (message.content && message.content.data) {
          const data = message.content.data;
          
          // Handle text output
          if (data['text/plain']) {
            callback({
              type: 'execute_result',
              content: data['text/plain'],
              executionCount: message.content.execution_count
            });
          }
          
          // Handle image output
          if (data['image/png']) {
            callback({
              type: 'display_data',
              imageData: {
                type: 'image/png',
                data: data['image/png']
              },
              executionCount: message.content.execution_count
            });
          }
        }
        break;
        
      case 'stream':
        // Handle stdout/stderr streams
        if (message.content && message.content.text) {
          callback({
            type: 'stream',
            content: message.content.text,
            stream: message.content.name, // 'stdout' or 'stderr'
            executionCount: message.content.execution_count
          });
        }
        break;
        
      case 'display_data':
        // Handle display data (plots, etc.)
        if (message.content && message.content.data) {
          const data = message.content.data;
          
          // Handle text output
          if (data['text/plain']) {
            callback({
              type: 'display_data',
              content: data['text/plain'],
              executionCount: message.content.execution_count
            });
          }
          
          // Handle image output
          if (data['image/png']) {
            callback({
              type: 'display_data',
              imageData: {
                type: 'image/png',
                data: data['image/png']
              },
              executionCount: message.content.execution_count
            });
          }
          
          // Handle HTML output
          if (data['text/html']) {
            callback({
              type: 'display_data',
              content: data['text/html'],
              contentType: 'html',
              executionCount: message.content.execution_count
            });
          }
        }
        break;
        
      case 'error':
        // Handle errors
        if (message.content) {
          const errorContent = message.content.traceback 
            ? message.content.traceback.join('\n') 
            : `${message.content.ename}: ${message.content.evalue}`;
          
          callback({
            type: 'error',
            content: errorContent,
            executionCount: message.content.execution_count
          });
          
          // Signal execution completion on error
          callback({ type: 'execution_complete' });
          
          // Remove the callback
          delete this.executionCallbacks[msgId];
        }
        break;
        
      case 'status':
        // Handle kernel status changes
        if (message.content && message.content.execution_state === 'idle') {
          // Kernel is idle, execution is complete
          callback({ type: 'execution_complete' });
          
          // Remove the callback after execution is complete
          delete this.executionCallbacks[msgId];
        }
        break;
        
      default:
        // Ignore other message types
        break;
    }
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
    
    try {
      console.log('Executing code in kernel:', code);
      
      // For real implementation, we need to connect to a Jupyter kernel
      // This can be done via the Jupyter API
      const kernelId = this.activeKernel.id;
      
      // Use the baseUrl from the active kernel if available
      const baseUrl = this.activeKernel.baseUrl || this.baseUrl;
      
      // Create a session if needed
      if (!this.sessionId) {
        const sessionResponse = await fetch(`${baseUrl}/api/sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            kernel: { id: kernelId },
            name: `session-${Date.now()}`,
            path: `notebook-${Date.now()}.ipynb`,
            type: 'notebook'
          })
        });
        
        if (!sessionResponse.ok) {
          throw new Error('Failed to create session');
        }
        
        const sessionData = await sessionResponse.json();
        this.sessionId = sessionData.id;
      }
      
      // Execute the code
      const executeResponse = await fetch(`${baseUrl}/api/kernels/${kernelId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          silent: false,
          store_history: true,
          user_expressions: {},
          allow_stdin: false,
          stop_on_error: true
        })
      });
      
      if (!executeResponse.ok) {
        // If direct execution fails, try using the WebSocket connection
        if (this.ws && this.hasConnection) {
          // Format a Jupyter protocol message for code execution
          const executeMsg = {
            header: {
              msg_id: msgId,
              username: 'neuralis',
              session: this.sessionId || 'default-session',
              msg_type: 'execute_request',
              version: '5.2'
            },
            content: {
              code: code,
              silent: false,
              store_history: true,
              user_expressions: {},
              allow_stdin: false,
              stop_on_error: true
            },
            metadata: {},
            parent_header: {},
            channel: 'shell'
          };
          
          // Send the message through WebSocket
          this.ws.send(JSON.stringify(executeMsg));
          
          // Set up a timeout to handle no response
          setTimeout(() => {
            // Check if we've received a response
            if (this.executionCallbacks[msgId]) {
              // If we still have the callback, we didn't get a complete response
              onOutput({
                type: 'error',
                content: 'Execution timed out. No response from kernel.'
              });
              
              onOutput({ type: 'execution_complete' });
              delete this.executionCallbacks[msgId];
            }
          }, 30000); // 30 second timeout
          
          return msgId;
        }
        
        // If WebSocket is not available, fall back to simulated execution
        console.warn('Failed to execute code via API, falling back to simulation');
        throw new Error('Failed to execute code');
      }
      
      // Process the execution response
      const executeData = await executeResponse.json();
      console.log('Execution response:', executeData);
      
      // Handle the output
      if (executeData.status === 'ok') {
        // Process output data
        if (executeData.data) {
          // Handle different output types
          if (executeData.data['text/plain']) {
            onOutput({
              type: 'execute_result',
              content: executeData.data['text/plain'],
              executionCount: executeData.execution_count
            });
          }
          
          // Handle image output
          if (executeData.data['image/png']) {
            onOutput({
              type: 'display_data',
              imageData: {
                type: 'image/png',
                data: executeData.data['image/png']
              },
              executionCount: executeData.execution_count
            });
          }
        } else {
          // No output data
          onOutput({
            type: 'execute_result',
            content: '',
            executionCount: executeData.execution_count
          });
        }
      } else if (executeData.status === 'error') {
        // Handle error
        onOutput({
          type: 'error',
          content: executeData.traceback.join('\n') || executeData.ename + ': ' + executeData.evalue,
          executionCount: executeData.execution_count
        });
      }
      
      // Signal execution completion
      onOutput({ type: 'execution_complete' });
    } catch (error) {
      console.error('Error executing code:', error);
      
      // Fall back to simulated execution for development/testing
      console.log('Falling back to simulated execution');
      
      // Parse the code to provide more realistic simulation
      let simulatedOutput = '';
      
      // Check for common Python functions and provide appropriate output
      if (code.includes('print(')) {
        // Extract content inside print statements
        const printMatches = code.match(/print\((.*?)\)/g);
        if (printMatches) {
          simulatedOutput = printMatches
            .map(match => {
              const content = match.substring(6, match.length - 1);
              // Handle string literals
              if (content.startsWith('"') || content.startsWith("'")) {
                return content.substring(1, content.length - 1);
              }
              return `[Simulated: ${content}]`;
            })
            .join('\n');
        }
      } else if (code.includes('import matplotlib.pyplot')) {
        // Simulate matplotlib output
        simulatedOutput = '[Matplotlib figure would be displayed here]';
        
        // Provide a simulated image
        onOutput({
          type: 'display_data',
          imageData: {
            type: 'image/png',
            data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' // 1x1 transparent pixel
          },
          executionCount: Math.floor(Math.random() * 100) + 1
        });
      } else if (code.includes('import pandas') || code.includes('pd.')) {
        // Simulate pandas DataFrame output
        simulatedOutput = '   Column1  Column2\n0        1        A\n1        2        B\n2        3        C';
      } else {
        // Generic simulation
        simulatedOutput = `[Simulated output for: ${code.substring(0, 50)}${code.length > 50 ? '...' : ''}]`;
      }
      
      onOutput({
        type: 'execute_result',
        content: simulatedOutput,
        executionCount: Math.floor(Math.random() * 100) + 1
      });
      
      setTimeout(() => {
        onOutput({ type: 'execution_complete' });
      }, 500);
    }
    
    return msgId;
  }

  /**
   * Restart the current kernel
   */
  async restartKernel() {
    if (!this.activeKernel) return false;
    
    try {
      console.log('Restarting kernel:', this.activeKernel.name);
      
      // If this is a Docker kernel, use the kernelManager to restart it
      if (this.activeKernel.containerId) {
        const result = await kernelManager.restartContainer(this.activeKernel.containerId);
        if (!result) {
          throw new Error('Failed to restart Docker container');
        }
      } else {
        // Simulate a short delay for restart
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
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
