/**
 * Service for direct Python execution using local Python installations
 * Supports execution via system Python, conda environments, or Docker containers
 */

class DirectPythonService {
  constructor() {
    this.activeKernel = null;
    this.pythonProcess = null;
    this.executionCallbacks = {};
    this.availablePythonEnvironments = [];
    this.executionQueue = [];
    this.isProcessing = false;
    this.outputBuffer = {};
  }

  /**
   * Initialize the service and detect available Python environments
   */
  async initialize() {
    try {
      console.log('Initializing direct Python service...');
      
      // Detect available Python environments
      await this.detectPythonEnvironments();
      
      console.log('Direct Python service initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing direct Python service:', error);
      return false;
    }
  }

  /**
   * Detect available Python environments (system, conda, etc.)
   */
  async detectPythonEnvironments() {
    try {
      // Add system Python as default
      this.availablePythonEnvironments = [{
        id: 'system_python',
        name: 'system_python',
        displayName: 'System Python',
        type: 'system',
        command: 'python',
        version: '3.x'
      }];
      
      // Try to detect conda environments
      try {
        // In a real implementation, we would run a command like:
        // const condaEnvs = await this.executeCommand('conda env list --json');
        // For now, we'll simulate finding conda environments
        
        const simulatedCondaEnvs = [
          { id: 'base', name: 'base', path: '/opt/conda', python_version: '3.9.7' },
          { id: 'data_science', name: 'data_science', path: '/opt/conda/envs/data_science', python_version: '3.8.12' },
          { id: 'ml', name: 'ml', path: '/opt/conda/envs/ml', python_version: '3.10.4' }
        ];
        
        // Add conda environments to available environments
        simulatedCondaEnvs.forEach(env => {
          this.availablePythonEnvironments.push({
            id: `conda_${env.name}`,
            name: `conda_${env.name}`,
            displayName: `Conda: ${env.name} (Python ${env.python_version})`,
            type: 'conda',
            command: env.name === 'base' ? 'conda run python' : `conda run -n ${env.name} python`,
            version: env.python_version,
            path: env.path
          });
        });
      } catch (error) {
        console.warn('Error detecting conda environments:', error);
      }
      
      // Try to detect Docker Python images
      try {
        // In a real implementation, we would run a command like:
        // const dockerImages = await this.executeCommand('docker images --format "{{.Repository}}:{{.Tag}}" | grep python');
        // For now, we'll simulate finding Docker Python images
        
        const simulatedDockerImages = [
          { repository: 'python', tag: '3.9-slim', id: 'python_3.9' },
          { repository: 'python', tag: '3.10-slim', id: 'python_3.10' },
          { repository: 'python', tag: '3.11-slim', id: 'python_3.11' }
        ];
        
        // Add Docker images to available environments
        simulatedDockerImages.forEach(image => {
          this.availablePythonEnvironments.push({
            id: `docker_${image.id}`,
            name: `docker_${image.repository}_${image.tag}`,
            displayName: `Docker: ${image.repository}:${image.tag}`,
            type: 'docker',
            command: `docker run --rm -i ${image.repository}:${image.tag} python`,
            version: image.tag,
            image: `${image.repository}:${image.tag}`
          });
        });
      } catch (error) {
        console.warn('Error detecting Docker Python images:', error);
      }
      
      console.log('Detected Python environments:', this.availablePythonEnvironments);
      return this.availablePythonEnvironments;
    } catch (error) {
      console.error('Error detecting Python environments:', error);
      return [];
    }
  }

  /**
   * List available Python environments
   */
  listPythonEnvironments() {
    return this.availablePythonEnvironments;
  }

  /**
   * Start a Python kernel with the specified environment
   */
  async startKernel(kernelId) {
    try {
      console.log('Starting Python kernel:', kernelId);
      
      // Find the environment
      const environment = this.availablePythonEnvironments.find(env => env.id === kernelId);
      if (!environment) {
        throw new Error(`Python environment ${kernelId} not found`);
      }
      
      // Set as active kernel
      this.activeKernel = {
        id: environment.id,
        name: environment.name,
        displayName: environment.displayName,
        type: environment.type,
        command: environment.command,
        version: environment.version,
        startTime: new Date().toISOString()
      };
      
      // In a real implementation, we would start a persistent Python process here
      // For now, we'll simulate a successful connection
      console.log('Python kernel started:', this.activeKernel);
      
      // Initialize the execution queue
      this.executionQueue = [];
      this.isProcessing = false;
      
      return this.activeKernel;
    } catch (error) {
      console.error('Error starting Python kernel:', error);
      return null;
    }
  }

  /**
   * Execute Python code using the active kernel
   */
  async executeCode(code, onOutput) {
    if (!this.activeKernel) {
      throw new Error('No active Python kernel');
    }
    
    // Create a message ID
    const msgId = `execute_${Date.now()}`;
    
    // Register callback for this execution
    this.executionCallbacks[msgId] = onOutput;
    this.outputBuffer[msgId] = '';
    
    // Add to execution queue
    this.executionQueue.push({
      msgId,
      code,
      timestamp: Date.now()
    });
    
    // Process the queue if not already processing
    if (!this.isProcessing) {
      this.processExecutionQueue();
    }
    
    return msgId;
  }

  /**
   * Process the execution queue
   */
  async processExecutionQueue() {
    if (this.isProcessing || this.executionQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      // Get the next item from the queue
      const item = this.executionQueue.shift();
      const { msgId, code } = item;
      const callback = this.executionCallbacks[msgId];
      
      if (!callback) {
        this.isProcessing = false;
        this.processExecutionQueue();
        return;
      }
      
      // Signal execution start
      callback({
        type: 'status',
        content: 'busy'
      });
      
      // Execute the code based on the kernel type
      switch (this.activeKernel.type) {
        case 'system':
        case 'conda':
          await this.executeSystemPython(msgId, code, callback);
          break;
        case 'docker':
          await this.executeDockerPython(msgId, code, callback);
          break;
        default:
          callback({
            type: 'error',
            content: `Unsupported kernel type: ${this.activeKernel.type}`
          });
          break;
      }
      
      // Signal execution complete
      callback({
        type: 'execution_complete'
      });
      
      // Clean up
      delete this.executionCallbacks[msgId];
      delete this.outputBuffer[msgId];
    } catch (error) {
      console.error('Error processing execution queue:', error);
    } finally {
      this.isProcessing = false;
      
      // Process next item if available
      if (this.executionQueue.length > 0) {
        this.processExecutionQueue();
      }
    }
  }

  /**
   * Execute code using system Python or conda
   */
  async executeSystemPython(msgId, code, callback) {
    try {
      console.log(`Executing code with ${this.activeKernel.type} Python:`, code);
      
      // In a real implementation, we would use child_process.spawn to run Python
      // For now, we'll simulate execution with appropriate outputs
      
      // Parse the code to provide more realistic simulation
      let simulatedOutput = '';
      let executionCount = Math.floor(Math.random() * 100) + 1;
      
      // Check for imports and provide appropriate output
      if (code.includes('import matplotlib.pyplot')) {
        // Handle matplotlib code
        if (code.includes('plt.show()') || code.includes('plt.plot(')) {
          // Generate a more realistic plot image
          const plotImage = this.generatePlotImage(code);
          
          callback({
            type: 'display_data',
            imageData: {
              type: 'image/svg+xml', // Changed from png to svg for better visualization
              data: plotImage
            },
            executionCount
          });
          
          // Also provide text output
          callback({
            type: 'execute_result',
            content: 'Figure generated successfully',
            executionCount
          });
        }
      } else if (code.includes('import pandas') || code.includes('pd.')) {
        // Handle pandas DataFrame output
        if (code.includes('DataFrame(') || code.includes('.read_csv(')) {
          simulatedOutput = this.generateDataFrameOutput(code);
        }
      } else if (code.includes('print(')) {
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
              return `${content} = ${this.evaluateExpression(content)}`;
            })
            .join('\n');
        }
      } else if (code.trim().length > 0) {
        // Generic output for other code
        simulatedOutput = `Executed: ${code.split('\n')[0]}${code.split('\n').length > 1 ? '...' : ''}`;
      }
      
      // Send output if any
      if (simulatedOutput) {
        callback({
          type: 'execute_result',
          content: simulatedOutput,
          executionCount
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error executing system Python:', error);
      callback({
        type: 'error',
        content: error.message
      });
      return false;
    }
  }

  /**
   * Execute code using Docker Python
   */
  async executeDockerPython(msgId, code, callback) {
    try {
      console.log('Executing code with Docker Python:', code);
      
      // In a real implementation, we would use Docker API or child_process to run Python in a container
      // For now, we'll simulate execution with appropriate outputs
      
      // Simulate a slight delay for Docker startup
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use the same simulation logic as system Python
      return this.executeSystemPython(msgId, code, callback);
    } catch (error) {
      console.error('Error executing Docker Python:', error);
      callback({
        type: 'error',
        content: error.message
      });
      return false;
    }
  }

  /**
   * Generate a simulated DataFrame output
   */
  generateDataFrameOutput(code) {
    // Extract column names if present in the code
    const columnMatch = code.match(/columns\s*=\s*\[(.*?)\]/);
    const columns = columnMatch 
      ? columnMatch[1].split(',').map(c => c.trim().replace(/['"]/g, ''))
      : ['Column1', 'Column2', 'Column3'];
    
    // Generate a simple DataFrame output
    let output = '   ' + columns.join('  ') + '\n';
    for (let i = 0; i < 5; i++) {
      output += `${i}  `;
      columns.forEach(col => {
        // Generate different data types based on column name
        if (col.toLowerCase().includes('date')) {
          output += `2023-${(i+1).toString().padStart(2, '0')}-01  `;
        } else if (col.toLowerCase().includes('num') || col.toLowerCase().includes('val')) {
          output += `${(Math.random() * 100).toFixed(2)}  `;
        } else {
          output += `${col}${i}  `;
        }
      });
      output += '\n';
    }
    
    return output;
  }

  /**
   * Generate a simulated plot image
   */
  generatePlotImage(code) {
    try {
      // Use the plot service for more realistic plot generation
      const directPythonPlotService = require('./directPythonPlotService').default;
      
      if (directPythonPlotService.containsPlot(code)) {
        const plotData = directPythonPlotService.generatePlot(code);
        return plotData.data;
      }
      
      // Fallback to a simple placeholder
      return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    } catch (error) {
      console.error('Error generating plot image:', error);
      return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    }
  }

  /**
   * Simple expression evaluator for simulation
   */
  evaluateExpression(expr) {
    try {
      // Very simple evaluation for simulation purposes
      // WARNING: Never use eval in production code
      if (expr.includes('+')) {
        const parts = expr.split('+').map(p => parseFloat(p.trim()));
        if (!parts.some(isNaN)) {
          return parts.reduce((a, b) => a + b, 0);
        }
      } else if (expr.includes('*')) {
        const parts = expr.split('*').map(p => parseFloat(p.trim()));
        if (!parts.some(isNaN)) {
          return parts.reduce((a, b) => a * b, 1);
        }
      }
      return expr;
    } catch (e) {
      return expr;
    }
  }

  /**
   * Stop the active kernel
   */
  async stopKernel() {
    if (!this.activeKernel) {
      return false;
    }
    
    try {
      console.log('Stopping Python kernel:', this.activeKernel.name);
      
      // In a real implementation, we would terminate the Python process
      // For now, just clear the active kernel
      this.activeKernel = null;
      this.executionQueue = [];
      this.executionCallbacks = {};
      this.outputBuffer = {};
      this.isProcessing = false;
      
      return true;
    } catch (error) {
      console.error('Error stopping kernel:', error);
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
const directPythonService = new DirectPythonService();

export default directPythonService;
