/**
 * Service for managing Docker containers for Python kernels
 * Implementation based on KERNEL_SETUP.md requirements
 */
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Store active containers
const activeContainers = new Map();

/**
 * Check if Docker is available
 * @returns {Promise<boolean>} - Docker availability status
 */
const checkDockerAvailability = () => {
  return new Promise((resolve) => {
    exec('docker --version', (error) => {
      if (error) {
        console.error('Docker is not available:', error);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

/**
 * Build a Docker container for a Python kernel
 * @param {Object} options - Container options
 * @returns {Promise<Object>} - Build result
 */
const buildKernelContainer = async (options = {}) => {
  const {
    pythonVersion = '3.9',
    port = 8888,
    name = `neuralis-kernel-${pythonVersion}`,
    packages = ''
  } = options;
  
  try {
    // Check if Docker is available
    const dockerAvailable = await checkDockerAvailability();
    if (!dockerAvailable) {
      throw new Error('Docker is not available');
    }
    
    // Create a temporary directory for Dockerfile
    const tempDir = path.join(os.tmpdir(), `neuralis-docker-${Date.now()}`);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Create Dockerfile
    const dockerfilePath = path.join(tempDir, 'Dockerfile');
    const dockerfileContent = `FROM python:${pythonVersion}-slim
    
# Install Jupyter and other dependencies
RUN pip install --no-cache-dir jupyter jupyterlab notebook jupyter-kernel-gateway

# Install additional packages if specified
${packages ? `RUN pip install --no-cache-dir ${packages}` : ''}

# Install common data science packages
RUN pip install --no-cache-dir numpy pandas matplotlib seaborn scikit-learn

# Set up working directory
WORKDIR /notebooks

# Expose the port
EXPOSE ${port}

# Start Jupyter Kernel Gateway
CMD ["jupyter", "kernelgateway", "--KernelGatewayApp.ip=0.0.0.0", "--KernelGatewayApp.port=${port}", "--KernelGatewayApp.allow_origin=*"]
`;
    
    fs.writeFileSync(dockerfilePath, dockerfileContent);
    
    // Build the Docker image
    console.log(`Building Docker image for Python ${pythonVersion}...`);
    
    return new Promise((resolve, reject) => {
      const buildProcess = spawn('docker', [
        'build',
        '-t',
        `neuralis-kernel-image-${pythonVersion}`,
        tempDir
      ]);
      
      let buildOutput = '';
      
      buildProcess.stdout.on('data', (data) => {
        const output = data.toString();
        buildOutput += output;
        console.log(output);
      });
      
      buildProcess.stderr.on('data', (data) => {
        const output = data.toString();
        buildOutput += output;
        console.error(output);
      });
      
      buildProcess.on('close', (code) => {
        if (code !== 0) {
          reject({
            success: false,
            error: `Docker build failed with code ${code}`,
            output: buildOutput
          });
          return;
        }
        
        // Run the container
        console.log(`Starting container ${name}...`);
        
        exec(`docker run -d --name ${name} -p ${port}:${port} neuralis-kernel-image-${pythonVersion}`, (error, stdout, stderr) => {
          if (error) {
            reject({
              success: false,
              error: `Failed to start container: ${error.message}`,
              output: stderr
            });
            return;
          }
          
          const containerId = stdout.trim();
          
          // Store container information
          const containerInfo = {
            id: containerId,
            name,
            pythonVersion,
            port,
            url: `http://localhost:${port}`,
            status: 'running',
            createdAt: new Date().toISOString()
          };
          
          activeContainers.set(name, containerInfo);
          
          // Clean up temporary directory
          try {
            fs.rmSync(tempDir, { recursive: true, force: true });
          } catch (err) {
            console.error('Failed to clean up temporary directory:', err);
          }
          
          resolve({
            success: true,
            container: containerInfo,
            output: buildOutput
          });
        });
      });
      
      buildProcess.on('error', (error) => {
        reject({
          success: false,
          error: `Failed to start Docker build process: ${error.message}`
        });
      });
    });
  } catch (error) {
    console.error('Error building kernel container:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * List all running kernel containers
 * @returns {Promise<Array>} - List of containers
 */
const listContainers = () => {
  return new Promise((resolve, reject) => {
    exec('docker ps --filter "name=neuralis-kernel" --format "{{.ID}}|{{.Names}}|{{.Ports}}"', (error, stdout, stderr) => {
      if (error) {
        console.error('Error listing containers:', error);
        resolve([]);
        return;
      }
      
      const containers = [];
      const lines = stdout.trim().split('\n');
      
      for (const line of lines) {
        if (!line) continue;
        
        const [id, name, ports] = line.split('|');
        
        // Extract port from the ports string (e.g., "0.0.0.0:8888->8888/tcp")
        const portMatch = ports.match(/0\.0\.0\.0:(\d+)/);
        const port = portMatch ? parseInt(portMatch[1]) : 8888;
        
        // Extract Python version from container name
        const versionMatch = name.match(/neuralis-kernel-(\d+\.\d+)/);
        const pythonVersion = versionMatch ? versionMatch[1] : '3.9';
        
        const containerInfo = {
          id,
          name,
          pythonVersion,
          port,
          url: `http://localhost:${port}`,
          status: 'running',
          createdAt: new Date().toISOString() // We don't have the actual creation time
        };
        
        containers.push(containerInfo);
        
        // Update active containers map
        activeContainers.set(name, containerInfo);
      }
      
      resolve(containers);
    });
  });
};

/**
 * Stop a kernel container
 * @param {string} name - Container name
 * @returns {Promise<Object>} - Stop result
 */
const stopContainer = (name) => {
  return new Promise((resolve, reject) => {
    exec(`docker stop ${name} && docker rm ${name}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error stopping container ${name}:`, error);
        resolve({
          success: false,
          error: error.message
        });
        return;
      }
      
      // Remove from active containers
      activeContainers.delete(name);
      
      resolve({
        success: true,
        output: stdout
      });
    });
  });
};

/**
 * Restart a kernel container
 * @param {string} name - Container name
 * @returns {Promise<Object>} - Restart result
 */
const restartContainer = (name) => {
  return new Promise((resolve, reject) => {
    exec(`docker restart ${name}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error restarting container ${name}:`, error);
        resolve({
          success: false,
          error: error.message
        });
        return;
      }
      
      resolve({
        success: true,
        output: stdout
      });
    });
  });
};

/**
 * Get logs from a kernel container
 * @param {string} name - Container name
 * @returns {Promise<Object>} - Container logs
 */
const getContainerLogs = (name) => {
  return new Promise((resolve, reject) => {
    exec(`docker logs ${name} --tail 100`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error getting logs for container ${name}:`, error);
        resolve({
          success: false,
          error: error.message,
          logs: ''
        });
        return;
      }
      
      resolve({
        success: true,
        logs: stdout + stderr
      });
    });
  });
};

/**
 * Create a script to build kernel containers
 * @returns {Promise<string>} - Path to the script
 */
const createBuildScript = () => {
  return new Promise((resolve, reject) => {
    const scriptDir = path.join(process.cwd(), 'scripts');
    
    // Create scripts directory if it doesn't exist
    if (!fs.existsSync(scriptDir)) {
      fs.mkdirSync(scriptDir, { recursive: true });
    }
    
    const scriptPath = path.join(scriptDir, 'build_kernel_container.sh');
    const scriptContent = `#!/bin/bash
# Script to build and run a Docker container for Python kernels

# Default values
PYTHON_VERSION="3.9"
PORT=8888
NAME="neuralis-kernel"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    --python-version)
      PYTHON_VERSION="$2"
      shift
      shift
      ;;
    --port)
      PORT="$2"
      shift
      shift
      ;;
    --name)
      NAME="$2"
      shift
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Set container name if not specified
if [ "$NAME" == "neuralis-kernel" ]; then
  NAME="neuralis-kernel-$PYTHON_VERSION"
fi

echo "Building kernel container with Python $PYTHON_VERSION on port $PORT"

# Create temporary directory for Dockerfile
TEMP_DIR=$(mktemp -d)
DOCKERFILE="$TEMP_DIR/Dockerfile"

# Create Dockerfile
cat > "$DOCKERFILE" << EOF
FROM python:${PYTHON_VERSION}-slim

# Install Jupyter and other dependencies
RUN pip install --no-cache-dir jupyter jupyterlab notebook jupyter-kernel-gateway

# Install common data science packages
RUN pip install --no-cache-dir numpy pandas matplotlib seaborn scikit-learn

# Set up working directory
WORKDIR /notebooks

# Expose the port
EXPOSE ${PORT}

# Start Jupyter Kernel Gateway
CMD ["jupyter", "kernelgateway", "--KernelGatewayApp.ip=0.0.0.0", "--KernelGatewayApp.port=${PORT}", "--KernelGatewayApp.allow_origin=*"]
EOF

# Build the Docker image
echo "Building Docker image..."
docker build -t "neuralis-kernel-image-$PYTHON_VERSION" "$TEMP_DIR"

# Check if build was successful
if [ $? -ne 0 ]; then
  echo "Failed to build Docker image"
  rm -rf "$TEMP_DIR"
  exit 1
fi

# Check if a container with the same name already exists
if docker ps -a --format '{{.Names}}' | grep -q "^$NAME$"; then
  echo "Container $NAME already exists. Stopping and removing..."
  docker stop "$NAME" > /dev/null 2>&1
  docker rm "$NAME" > /dev/null 2>&1
fi

# Run the container
echo "Starting container $NAME on port $PORT..."
docker run -d --name "$NAME" -p "$PORT:$PORT" "neuralis-kernel-image-$PYTHON_VERSION"

# Check if container started successfully
if [ $? -ne 0 ]; then
  echo "Failed to start container"
  rm -rf "$TEMP_DIR"
  exit 1
fi

# Clean up
rm -rf "$TEMP_DIR"

echo "Container $NAME is running on port $PORT"
echo "You can now select this kernel in Neuralis"
`;
    
    fs.writeFile(scriptPath, scriptContent, { mode: 0o755 }, (err) => {
      if (err) {
        console.error('Error creating build script:', err);
        reject(err);
        return;
      }
      
      resolve(scriptPath);
    });
  });
};

module.exports = {
  checkDockerAvailability,
  buildKernelContainer,
  listContainers,
  stopContainer,
  restartContainer,
  getContainerLogs,
  createBuildScript
};
