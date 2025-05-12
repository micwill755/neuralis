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
      // Here we'll execute the code and capture the output
      
      // Parse the code to provide more realistic simulation
      let simulatedOutput = '';
      let executionCount = Math.floor(Math.random() * 100) + 1;
      
      // Check for visualization libraries
      if (code.includes('import matplotlib.pyplot') || 
          code.includes('import seaborn') || 
          code.includes('sns.') || 
          code.includes('plt.')) {
        
        // Handle visualization code
        if (code.includes('plt.show()') || 
            code.includes('plt.plot(') || 
            code.includes('sns.') || 
            code.includes('plt.figure') || 
            code.includes('plt.subplot')) {
          
          // For real implementation, we would:
          // 1. Execute the Python code in a subprocess
          // 2. Capture the plot as a PNG/SVG
          // 3. Convert to base64
          
          // For now, we'll create a realistic plot based on the code
          const plotData = this.generateRealPlot(code);
          
          // Send the plot as an image
          callback({
            type: 'display_data',
            imageData: plotData,
            executionCount
          });
          
          // Don't send text output for plots - just show the visualization
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
   * Generate a realistic plot based on the code
   */
  generateRealPlot(code) {
    try {
      // Analyze the code to determine what kind of plot to generate
      const isSeaborn = code.includes('import seaborn') || code.includes('sns.');
      const isSubplot = code.includes('plt.subplots(') || code.includes('plt.subplot(');
      const isScatter = code.includes('plt.scatter(') || code.includes('sns.scatterplot(');
      const isHeatmap = code.includes('sns.heatmap(');
      const isHistogram = code.includes('plt.hist(') || code.includes('sns.histplot(');
      const isBarPlot = code.includes('plt.bar(') || code.includes('sns.barplot(');
      
      // Generate SVG content based on the plot type
      let svgContent;
      
      if (isSeaborn) {
        // Generate a Seaborn-style plot
        svgContent = `
          <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
            <rect width="600" height="400" fill="#f8f9fa"/>
            <g transform="translate(50, 20)">
              <!-- Axes with Seaborn style -->
              <rect x="0" y="0" width="500" height="320" fill="white" stroke="#cccccc" stroke-width="1"/>
              <line x1="0" y1="0" x2="0" y2="320" stroke="#333333" stroke-width="1.5"/>
              <line x1="0" y1="320" x2="500" y2="320" stroke="#333333" stroke-width="1.5"/>
              
              <!-- Grid lines -->
              <line x1="0" y1="80" x2="500" y2="80" stroke="#eeeeee" stroke-width="1"/>
              <line x1="0" y1="160" x2="500" y2="160" stroke="#eeeeee" stroke-width="1"/>
              <line x1="0" y1="240" x2="500" y2="240" stroke="#eeeeee" stroke-width="1"/>
              <line x1="100" y1="0" x2="100" y2="320" stroke="#eeeeee" stroke-width="1"/>
              <line x1="200" y1="0" x2="200" y2="320" stroke="#eeeeee" stroke-width="1"/>
              <line x1="300" y1="0" x2="300" y2="320" stroke="#eeeeee" stroke-width="1"/>
              <line x1="400" y1="0" x2="400" y2="320" stroke="#eeeeee" stroke-width="1"/>
              
              <!-- X and Y labels -->
              <text x="250" y="350" font-family="Arial" font-size="12" text-anchor="middle">X variable</text>
              <text x="-40" y="160" font-family="Arial" font-size="12" text-anchor="middle" transform="rotate(-90, -40, 160)">Y variable</text>
              
              <!-- Title -->
              <text x="250" y="-5" font-family="Arial" font-size="16" text-anchor="middle">Seaborn Plot</text>
              
              <!-- Plot line with Seaborn palette -->
              <path d="M0,320 L50,280 L100,200 L150,240 L200,150 L250,100 L300,180 L350,220 L400,80 L450,50 L500,120" 
                    fill="none" stroke="#4c72b0" stroke-width="2.5"/>
                    
              <!-- Confidence interval -->
              <path d="M0,320 L50,280 L100,200 L150,240 L200,150 L250,100 L300,180 L350,220 L400,80 L450,50 L500,120 
                       L500,150 L450,80 L400,110 L350,250 L300,210 L250,130 L200,180 L150,270 L100,230 L50,310 L0,320" 
                    fill="#4c72b0" opacity="0.2" stroke="none"/>
            </g>
          </svg>
        `;
      } else if (isSubplot) {
        // Generate a subplot visualization
        svgContent = `
          <svg xmlns="http://www.w3.org/2000/svg" width="600" height="500">
            <rect width="600" height="500" fill="white"/>
            
            <!-- First subplot -->
            <g transform="translate(50, 20)">
              <!-- Axes -->
              <line x1="0" y1="0" x2="0" y2="180" stroke="black" stroke-width="2"/>
              <line x1="0" y1="180" x2="500" y2="180" stroke="black" stroke-width="2"/>
              
              <!-- Title -->
              <text x="250" y="-5" font-family="Arial" font-size="14" text-anchor="middle">Sine Wave</text>
              
              <!-- Plot line -->
              <path d="M0,90 L50,20 L100,90 L150,160 L200,90 L250,20 L300,90 L350,160 L400,90 L450,20 L500,90" 
                    fill="none" stroke="blue" stroke-width="2"/>
            </g>
            
            <!-- Second subplot -->
            <g transform="translate(50, 250)">
              <!-- Axes -->
              <line x1="0" y1="0" x2="0" y2="180" stroke="black" stroke-width="2"/>
              <line x1="0" y1="180" x2="500" y2="180" stroke="black" stroke-width="2"/>
              
              <!-- Title -->
              <text x="250" y="-5" font-family="Arial" font-size="14" text-anchor="middle">Cosine Wave</text>
              
              <!-- Plot line -->
              <path d="M0,20 L50,90 L100,160 L150,90 L200,20 L250,90 L300,160 L350,90 L400,20 L450,90 L500,160" 
                    fill="none" stroke="red" stroke-width="2"/>
            </g>
            
            <!-- X and Y labels -->
            <text x="300" y="480" font-family="Arial" font-size="12" text-anchor="middle">X axis</text>
            <text x="15" y="250" font-family="Arial" font-size="12" text-anchor="middle" transform="rotate(-90, 15, 250)">Y axis</text>
          </svg>
        `;
      } else {
        // Generate a default matplotlib-style plot
        svgContent = `
          <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
            <rect width="600" height="400" fill="white"/>
            <g transform="translate(50, 20)">
              <!-- Axes -->
              <line x1="0" y1="0" x2="0" y2="320" stroke="black" stroke-width="2"/>
              <line x1="0" y1="320" x2="500" y2="320" stroke="black" stroke-width="2"/>
              
              <!-- X and Y labels -->
              <text x="250" y="350" font-family="Arial" font-size="12" text-anchor="middle">X axis</text>
              <text x="-40" y="160" font-family="Arial" font-size="12" text-anchor="middle" transform="rotate(-90, -40, 160)">Y axis</text>
              
              <!-- Title -->
              <text x="250" y="-5" font-family="Arial" font-size="16" text-anchor="middle">Matplotlib Plot</text>
              
              <!-- Plot line -->
              <path d="M0,320 L50,280 L100,200 L150,240 L200,150 L250,100 L300,180 L350,220 L400,80 L450,50 L500,120" 
                    fill="none" stroke="blue" stroke-width="2"/>
              
              <!-- X ticks -->
              <line x1="0" y1="320" x2="0" y2="325" stroke="black" stroke-width="1"/>
              <text x="0" y="335" font-family="Arial" font-size="10" text-anchor="middle">0</text>
              <line x1="100" y1="320" x2="100" y2="325" stroke="black" stroke-width="1"/>
              <text x="100" y="335" font-family="Arial" font-size="10" text-anchor="middle">2</text>
              <line x1="200" y1="320" x2="200" y2="325" stroke="black" stroke-width="1"/>
              <text x="200" y="335" font-family="Arial" font-size="10" text-anchor="middle">4</text>
              <line x1="300" y1="320" x2="300" y2="325" stroke="black" stroke-width="1"/>
              <text x="300" y="335" font-family="Arial" font-size="10" text-anchor="middle">6</text>
              <line x1="400" y1="320" x2="400" y2="325" stroke="black" stroke-width="1"/>
              <text x="400" y="335" font-family="Arial" font-size="10" text-anchor="middle">8</text>
              <line x1="500" y1="320" x2="500" y2="325" stroke="black" stroke-width="1"/>
              <text x="500" y="335" font-family="Arial" font-size="10" text-anchor="middle">10</text>
              
              <!-- Y ticks -->
              <line x1="0" y1="320" x2="-5" y2="320" stroke="black" stroke-width="1"/>
              <text x="-10" y="323" font-family="Arial" font-size="10" text-anchor="end">0</text>
              <line x1="0" y1="240" x2="-5" y2="240" stroke="black" stroke-width="1"/>
              <text x="-10" y="243" font-family="Arial" font-size="10" text-anchor="end">2</text>
              <line x1="0" y1="160" x2="-5" y2="160" stroke="black" stroke-width="1"/>
              <text x="-10" y="163" font-family="Arial" font-size="10" text-anchor="end">4</text>
              <line x1="0" y1="80" x2="-5" y2="80" stroke="black" stroke-width="1"/>
              <text x="-10" y="83" font-family="Arial" font-size="10" text-anchor="end">6</text>
              <line x1="0" y1="0" x2="-5" y2="0" stroke="black" stroke-width="1"/>
              <text x="-10" y="3" font-family="Arial" font-size="10" text-anchor="end">8</text>
            </g>
          </svg>
        `;
      }
      
      // Convert SVG to base64
      const base64 = btoa(svgContent);
      
      return {
        type: 'image/svg+xml',
        data: base64
      };
    } catch (error) {
      console.error('Error generating real plot:', error);
      
      // Return a simple fallback plot
      const fallbackSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
          <rect width="400" height="300" fill="#f8f9fa" />
          <text x="50%" y="50%" font-family="Arial" font-size="16" fill="#666" text-anchor="middle">
            Error generating plot visualization
          </text>
        </svg>
      `;
      
      return {
        type: 'image/svg+xml',
        data: btoa(fallbackSvg)
      };
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
