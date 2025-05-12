/**
 * Service for executing Python code
 */
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Store active kernel sessions
const activeSessions = new Map();

/**
 * Create a temporary Python file and execute it
 * @param {string} code - Python code to execute
 * @param {string} sessionId - Session ID for the kernel
 * @returns {Promise<Object>} - Execution result
 */
const executePythonCode = async (code, sessionId) => {
  try {
    // Create or get session directory
    const sessionDir = getSessionDir(sessionId);
    
    // Create a unique filename for this execution
    const filename = `execution_${Date.now()}.py`;
    const filePath = path.join(sessionDir, filename);
    
    // Add code to handle image output
    const modifiedCode = `
import sys
import traceback
import base64
import io
from contextlib import redirect_stdout, redirect_stderr

# Setup for capturing matplotlib output
try:
    import matplotlib
    matplotlib.use('Agg')  # Use non-interactive backend
    import matplotlib.pyplot as plt
    
    # Function to capture plot as base64 string
    def show_plot():
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        img_str = base64.b64encode(buf.read()).decode('utf-8')
        plt.close()
        print(f"IMAGE_DATA:{img_str}:")
        
    # Override plt.show to capture output
    plt.show = show_plot
except ImportError:
    pass

# Capture stdout and stderr
stdout_buffer = io.StringIO()
stderr_buffer = io.StringIO()

try:
    with redirect_stdout(stdout_buffer), redirect_stderr(stderr_buffer):
${code.split('\n').map(line => '        ' + line).join('\n')}
    
    # Print any figures that weren't explicitly shown
    try:
        if 'plt' in locals() and plt.get_fignums():
            show_plot()
    except Exception as e:
        print(f"Error displaying plot: {e}")
        
except Exception as e:
    traceback.print_exc(file=stderr_buffer)

# Print captured output
print(stdout_buffer.getvalue(), end='')
print(stderr_buffer.getvalue(), file=sys.stderr, end='')
`;
    
    // Write the code to a temporary file
    fs.writeFileSync(filePath, modifiedCode);
    
    // Execute the Python code
    return new Promise((resolve, reject) => {
      // Get the session's Python path or use default
      const pythonPath = activeSessions.get(sessionId)?.pythonPath || 'python';
      
      // Spawn a Python process
      const pythonProcess = spawn(pythonPath, [filePath]);
      
      let stdout = '';
      let stderr = '';
      let imageData = null;
      
      // Collect stdout
      pythonProcess.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        
        // Check if output contains image data (base64 encoded)
        const imageMatch = output.match(/IMAGE_DATA:([^:]+):/);
        if (imageMatch && imageMatch[1]) {
          imageData = imageMatch[1];
          // Remove the image data marker from the output
          stdout = stdout.replace(/IMAGE_DATA:[^:]+:/, '');
        }
      });
      
      // Collect stderr
      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      // Handle process completion
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          resolve({
            type: 'error',
            content: stderr,
            exitCode: code
          });
        } else {
          resolve({
            type: 'execute_result',
            content: stdout,
            imageData,
            executionCount: Date.now()
          });
        }
      });
      
      // Handle process errors
      pythonProcess.on('error', (error) => {
        reject({
          type: 'error',
          content: `Failed to start Python process: ${error.message}`,
          exitCode: -1
        });
      });
    });
  } catch (error) {
    console.error('Error executing Python code:', error);
    return {
      type: 'error',
      content: `Error executing Python code: ${error.message}`,
      exitCode: -1
    };
  }
};

/**
 * Create a new Python kernel session
 * @param {Object} config - Kernel configuration
 * @returns {Object} - Session information
 */
const createSession = (config = {}) => {
  const sessionId = uuidv4();
  const sessionDir = getSessionDir(sessionId);
  
  // Create session directory if it doesn't exist
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }
  
  // Create a session state file to maintain variables between executions
  const stateFilePath = path.join(sessionDir, 'session_state.py');
  fs.writeFileSync(stateFilePath, '# Session state file\n');
  
  // Store session information
  activeSessions.set(sessionId, {
    id: sessionId,
    createdAt: new Date().toISOString(),
    pythonPath: config.pythonPath || 'python',
    sessionDir,
    stateFilePath
  });
  
  return {
    sessionId,
    sessionDir,
    createdAt: new Date().toISOString()
  };
};

/**
 * Get or create a session directory
 * @param {string} sessionId - Session ID
 * @returns {string} - Path to session directory
 */
const getSessionDir = (sessionId) => {
  const baseDir = path.join(os.tmpdir(), 'neuralis-python-sessions');
  
  // Create base directory if it doesn't exist
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  
  const sessionDir = path.join(baseDir, sessionId);
  
  // Create session directory if it doesn't exist
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }
  
  return sessionDir;
};

/**
 * Close a Python kernel session
 * @param {string} sessionId - Session ID
 * @returns {boolean} - Success status
 */
const closeSession = (sessionId) => {
  if (!activeSessions.has(sessionId)) {
    return false;
  }
  
  // Clean up session resources
  const session = activeSessions.get(sessionId);
  
  // Remove session from active sessions
  activeSessions.delete(sessionId);
  
  return true;
};

/**
 * List all active sessions
 * @returns {Array} - List of active sessions
 */
const listSessions = () => {
  return Array.from(activeSessions.values()).map(session => ({
    id: session.id,
    createdAt: session.createdAt
  }));
};

module.exports = {
  executePythonCode,
  createSession,
  closeSession,
  listSessions
};
