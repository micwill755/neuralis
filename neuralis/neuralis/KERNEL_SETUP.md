# Neuralis Kernel Setup

This document explains how to set up and use Python kernels with Neuralis, our Jupyter Lab clone.

## Overview

Neuralis now supports executing Python code in Docker-based kernels. This allows you to:

1. Create Python kernels with different versions (3.7, 3.8, 3.9, 3.10)
2. Select a kernel for each notebook
3. Execute code cells using the selected kernel
4. View execution results directly in the notebook

## Requirements

- Docker installed on your system
- Node.js and npm (for running the Neuralis application)

## Setting Up Kernels

### Automatic Setup

1. In the Neuralis application, navigate to the Kernel Settings page
2. Select the Python version you want to use
3. Click "Build New Kernel"
4. Wait for the container to be built and started
5. Once complete, you can select this kernel in your notebooks

### Manual Setup

You can also manually build and start kernel containers using the provided script:

```bash
# Navigate to the Neuralis directory
cd /path/to/neuralis

# Run the kernel container build script
./scripts/build_kernel_container.sh --python-version 3.9 --port 8888 --name neuralis-kernel-3.9
```

Options:
- `--python-version`: Python version to use (3.7, 3.8, 3.9, 3.10)
- `--port`: Port to expose the Jupyter server on (default: 8888)
- `--name`: Name for the Docker container (default: neuralis-kernel)

## Using Kernels in Notebooks

1. Open a notebook in Neuralis
2. At the top of the notebook, you'll see a kernel selector
3. Click on the selector and choose a kernel from the dropdown
4. Click "Connect" to connect to the selected kernel
5. Now you can run code cells using this kernel

## Kernel Operations

- **Connect**: Connect to a kernel to execute code
- **Restart**: Restart the kernel if it becomes unresponsive
- **Run Cell**: Execute the currently selected code cell using the connected kernel

## Troubleshooting

### Kernel Not Connecting

If you're having trouble connecting to a kernel:

1. Check that the Docker container is running:
   ```bash
   docker ps | grep neuralis-kernel
   ```

2. Verify that the Jupyter server is accessible:
   ```bash
   curl http://localhost:8888/api/kernels
   ```

3. Restart the kernel container:
   ```bash
   docker restart neuralis-kernel
   ```

### Code Execution Issues

If code execution is not working properly:

1. Check the browser console for any WebSocket connection errors
2. Verify that the kernel is running in the Docker container:
   ```bash
   docker logs neuralis-kernel
   ```

3. Try restarting the kernel from the Neuralis UI

## Architecture

The kernel functionality is implemented using:

1. **Docker containers**: Each kernel runs in its own Docker container
2. **Jupyter Kernel Gateway**: Used for communicating with the kernels
3. **WebSockets**: For real-time communication between the UI and kernels
4. **React components**: For the kernel selection and execution UI

## Advanced Configuration

For advanced users, you can customize the Docker containers by modifying the `build_kernel_container.sh` script. This allows you to:

- Install additional Python packages
- Configure kernel settings
- Set up custom environments for specific use cases
