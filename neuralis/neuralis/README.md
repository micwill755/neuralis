# Neuralis - Jupyter React Clone

A React-based Jupyter notebook clone with Docker-based kernel support.

## Features

- Create and edit notebooks with code cells and markdown cells
- Execute Python code in Docker-based kernels
- Support for multiple Python versions (3.7, 3.8, 3.9, 3.10)
- Display rich outputs including text, images, and HTML
- Markdown rendering with syntax highlighting

## Getting Started

### Prerequisites

- Node.js and npm
- Docker (for kernel execution)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the backend service:
   ```
   cd neuralis-backend
   npm install
   npm start
   ```
4. In a new terminal, start the development server:
   ```
   cd neuralis
   npm start
   ```

## Using Kernels

Neuralis supports executing Python code in Docker-based kernels. To use this feature:

1. Navigate to the Kernel Settings page
2. Select the Python version you want to use
3. Click "Build New Kernel"
4. Wait for the container to be built and started
5. Once complete, you can select this kernel in your notebooks

For more details, see [KERNEL_SETUP.md](./KERNEL_SETUP.md).

## Architecture

The application consists of two main parts:

1. **Frontend**: React application for the notebook UI
2. **Backend**: Express.js server for Docker operations

This separation allows the frontend to run in the browser while the backend handles Docker operations that require Node.js.

## Recent Fixes

### Notebook Selection Fix

Fixed an issue where users couldn't switch between notebooks after the initial selection. The notebook content now updates correctly when selecting a different notebook. See [AmazonQ.md](./AmazonQ.md) for details.

### Kernel Integration

Implemented Docker-based kernel support according to the requirements in KERNEL_SETUP.md. This allows executing Python code in isolated Docker containers with different Python versions.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
