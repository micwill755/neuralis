# Setting Up Python Environment for Neuralis

This guide explains how to set up a Python environment that your Neuralis application can connect to for executing Python code without requiring the full Jupyter stack.

## Table of Contents
- [Option 1: Local Conda Environment](#option-1-local-conda-environment)
- [Option 2: Docker Container](#option-2-docker-container)

# Option 1: Local Conda Environment

## Prerequisites

- [Miniconda](https://docs.conda.io/en/latest/miniconda.html) or [Anaconda](https://www.anaconda.com/products/distribution) installed
- Basic familiarity with terminal/command line
- Neuralis application installed

## Step 1: Create a Conda Environment

```bash
# Create a new conda environment with Python 3.12
conda create -n neuralis-env python=3.12

# Activate the environment
conda activate neuralis-env
```

## Step 2: Install Required Packages

```bash
# Install the minimal required packages for kernel communication
conda install -y pyzmq ipykernel

# Install common data science packages (optional)
conda install -y numpy pandas matplotlib scikit-learn
```

## Step 3: Set Up Kernel Configuration

```bash
# Create directory for kernel specifications
mkdir -p ~/.local/share/neuralis/kernels/python3

# Create kernel.json file
cat > ~/.local/share/neuralis/kernels/python3/kernel.json << EOL
{
  "argv": [
    "$(conda info --base)/envs/neuralis-env/bin/python",
    "-m",
    "ipykernel_launcher",
    "-f",
    "{connection_file}"
  ],
  "display_name": "Python 3 (Neuralis)",
  "language": "python"
}
EOL
```

## Step 4: Create a Kernel Launcher Script

```bash
# Create a directory for the script if it doesn't exist
mkdir -p ~/bin

# Create the launcher script
cat > ~/bin/neuralis-kernel << EOL
#!/bin/bash
source $(conda info --base)/etc/profile.d/conda.sh
conda activate neuralis-env
python -m ipykernel \$@
EOL

# Make the script executable
chmod +x ~/bin/neuralis-kernel
```

## Step 5: Configure Neuralis to Use the Conda Environment

In your Neuralis application settings, configure the kernel connection with these parameters:

- **Kernel Discovery Path**: `~/.local/share/neuralis/kernels`
- **Kernel Launcher**: `~/bin/neuralis-kernel`
- **Python Executable**: `$(conda info --base)/envs/neuralis-env/bin/python`

## Step 6: Testing the Connection

1. Start your Neuralis application
2. Create a new notebook
3. Select the "Python 3 (Neuralis)" kernel
4. Run a simple test code:
   ```python
   import sys
   print(f"Python version: {sys.version}")
   print(f"Python executable: {sys.executable}")
   ```

## Troubleshooting

### Kernel Connection Issues

If Neuralis cannot connect to the kernel:

1. Verify the conda environment is active:
   ```bash
   conda activate neuralis-env
   ```

2. Check that the kernel specification file is correct:
   ```bash
   cat ~/.local/share/neuralis/kernels/python3/kernel.json
   ```

3. Ensure the Python path in the kernel.json file points to your conda environment's Python

### Package Import Errors

If you encounter package import errors in your notebooks:

```bash
conda activate neuralis-env
conda install <package-name>
```

## Adding Custom Packages

To add additional packages to your environment:

```bash
conda activate neuralis-env
conda install <package-name>
```

## Advanced: Environment Management

### Exporting Environment

```bash
conda activate neuralis-env
conda env export > neuralis-environment.yml
```

### Recreating Environment

```bash
conda env create -f neuralis-environment.yml
```

## Notes for macOS Users

On macOS, you may need to adjust paths to use:
- `~/Library/Application Support/neuralis/kernels` instead of `~/.local/share/neuralis/kernels`

## Notes for Windows Users

On Windows, adjust the paths accordingly:
- Use `%USERPROFILE%\AppData\Local\neuralis\kernels` instead of `~/.local/share/neuralis/kernels`
- Modify the kernel.json file to use Windows path separators
- Create a batch file (.bat) instead of a bash script for the kernel launcher

# Option 2: Docker Container

If you prefer to run your Python kernel in a Docker container, follow these instructions.

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop) installed
- Basic familiarity with Docker and terminal/command line
- Neuralis application installed

## Step 1: Create a Dockerfile

Create a file named `Dockerfile` in your project directory:

```bash
mkdir -p ~/neuralis-docker
cd ~/neuralis-docker
```

Add the following content to `Dockerfile`:

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install required packages
RUN pip install --no-cache-dir pyzmq ipykernel

# Install common data science packages (optional)
RUN pip install --no-cache-dir numpy pandas matplotlib scikit-learn

# Create a directory for the kernel
RUN mkdir -p /usr/local/share/jupyter/kernels/python3

# Create kernel.json
RUN echo '{\
  "argv": [\
    "python",\
    "-m",\
    "ipykernel_launcher",\
    "-f",\
    "{connection_file}"\
  ],\
  "display_name": "Python 3 (Docker)",\
  "language": "python"\
}' > /usr/local/share/jupyter/kernels/python3/kernel.json

# Expose ZeroMQ ports
EXPOSE 8888 9001 9002 9003 9004 9005

# Create a startup script
RUN echo '#!/bin/bash\n\
python -m ipykernel $@\n\
' > /app/start-kernel.sh && chmod +x /app/start-kernel.sh

# Set the entry point
ENTRYPOINT ["/app/start-kernel.sh"]
```

## Step 2: Create a Docker Compose File

Create a `docker-compose.yml` file:

```yaml
version: '3'

services:
  neuralis-kernel:
    build: .
    ports:
      - "8888:8888"
      - "9001-9005:9001-9005"
    volumes:
      - ./notebooks:/app/notebooks
    command: ["--ip=0.0.0.0", "--port=8888"]
```

## Step 3: Build and Start the Container

```bash
docker-compose build
docker-compose up -d
```

## Step 4: Configure Neuralis to Connect to the Docker Container

In your Neuralis application settings, configure the kernel connection with these parameters:

- **Kernel Host**: `localhost` (or the IP address of your Docker host)
- **Kernel Port**: `8888`
- **Connection Method**: `ZeroMQ`

## Step 5: Testing the Connection

1. Start your Neuralis application
2. Create a new notebook
3. Select the "Python 3 (Docker)" kernel
4. Run a simple test code:
   ```python
   import sys
   print(f"Python version: {sys.version}")
   print(f"Python executable: {sys.executable}")
   ```

## Troubleshooting Docker Setup

### Container Not Starting

If the container fails to start:

```bash
docker-compose logs
```

### Connection Issues

If Neuralis cannot connect to the kernel:

1. Check that the container is running:
   ```bash
   docker-compose ps
   ```

2. Verify that the ports are correctly exposed:
   ```bash
   docker port neuralis-kernel
   ```

3. Test the connection manually:
   ```bash
   telnet localhost 8888
   ```

### Adding Custom Packages

To add additional packages to your Docker container:

1. Modify the Dockerfile to include additional packages:
   ```dockerfile
   RUN pip install --no-cache-dir <package-name>
   ```

2. Rebuild and restart the container:
   ```bash
   docker-compose down
   docker-compose build
   docker-compose up -d
   ```

## Advanced: Persistent Data

To ensure your notebooks and data persist between container restarts:

```yaml
volumes:
  - ./notebooks:/app/notebooks  # Notebooks directory
  - ./data:/app/data            # Data directory
```

## Notes for Different Operating Systems

The Docker setup should work consistently across macOS, Windows, and Linux with minimal adjustments.
