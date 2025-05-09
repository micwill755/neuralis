/**
 * Service for managing connections to Python kernels running in Docker containers
 */

class KernelService {
  constructor() {
    this.baseUrl = 'http://localhost:8888';
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
   * Start a kernel with the specified name
   */
  async startKernel(kernelName) {
    try {
      console.log('Starting kernel:', kernelName);
      
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
    if (message.msg_type === 'execute_result' || message.msg_type === 'stream') {
      const parentMsgId = message.parent_header?.msg_id;
      if (!parentMsgId) {
        console.warn('Message has no parent_header.msg_id:', message);
        return;
      }
      
      const callback = this.executionCallbacks[parentMsgId];
      
      if (callback) {
        let content = '';
        if (message.msg_type === 'execute_result' && message.content?.data) {
          content = message.content.data['text/plain'] || JSON.stringify(message.content.data);
        } else if (message.msg_type === 'stream' && message.content?.text) {
          content = message.content.text;
        }
        
        callback({
          type: message.msg_type,
          content,
          executionCount: message.content?.execution_count,
        });
      } else {
        console.warn('No callback found for message ID:', parentMsgId);
      }
    }
    
    // Handle execution completion
    if (message.msg_type === 'status' && message.content?.execution_state === 'idle') {
      const parentMsgId = message.parent_header?.msg_id;
      if (!parentMsgId) return;
      
      const callback = this.executionCallbacks[parentMsgId];
      
      if (callback) {
        callback({ type: 'execution_complete' });
        delete this.executionCallbacks[parentMsgId];
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
  }

  /**
   * Execute code in the active kernel
   */
  async executeCode(code, onOutput) {
    if (!this.activeKernel || !this.ws) {
      throw new Error('No active kernel connection');
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
   * Restart the current kernel
   */
  async restartKernel() {
    if (!this.activeKernel) return false;
    
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
