#!/bin/bash

# Script to build and run Python kernel containers for Neuralis

# Default values
IMAGE_NAME="neuralis-python-kernel"
CONTAINER_NAME="neuralis-kernel"
PYTHON_VERSION="3.9"
PORT=8888

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
      CONTAINER_NAME="$2"
      shift
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Create a temporary Dockerfile
TEMP_DOCKERFILE=$(mktemp)
cat > $TEMP_DOCKERFILE << EOF
FROM python:${PYTHON_VERSION}-slim

# Install system dependencies for matplotlib
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libc6-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Jupyter and common data science packages
RUN pip install --no-cache-dir jupyter notebook jupyterlab \
    numpy pandas matplotlib scikit-learn scipy \
    ipykernel jupyter_client

# Configure matplotlib to use Agg backend for headless environments
RUN mkdir -p /root/.config/matplotlib && \
    echo "backend: Agg" > /root/.config/matplotlib/matplotlibrc

# Create a jupyter kernel
RUN python -m ipykernel install --name python${PYTHON_VERSION} --display-name "Python ${PYTHON_VERSION}"

# Expose the port
EXPOSE 8888

# Set up the working directory
WORKDIR /notebooks

# Start Jupyter notebook server with token authentication disabled and CORS allowed
CMD ["jupyter", "notebook", "--ip=0.0.0.0", "--port=8888", "--no-browser", "--allow-root", "--NotebookApp.token=''", "--NotebookApp.password=''", "--NotebookApp.allow_origin='*'", "--NotebookApp.disable_check_xsrf=True"]
EOF

# Build the Docker image
echo "Building Docker image for Python ${PYTHON_VERSION}..."
docker build -t ${IMAGE_NAME}:${PYTHON_VERSION} -f $TEMP_DOCKERFILE .

# Remove the temporary Dockerfile
rm $TEMP_DOCKERFILE

# Check if a container with the same name is already running
if [ "$(docker ps -q -f name=${CONTAINER_NAME})" ]; then
    echo "Container ${CONTAINER_NAME} is already running. Stopping it..."
    docker stop ${CONTAINER_NAME}
    docker rm ${CONTAINER_NAME}
fi

# Run the container
echo "Starting kernel container on port ${PORT}..."
docker run -d --name ${CONTAINER_NAME} \
  -p ${PORT}:8888 \
  -v "$(pwd)/notebooks:/notebooks" \
  ${IMAGE_NAME}:${PYTHON_VERSION}

echo "Kernel container is running!"
echo "Container name: ${CONTAINER_NAME}"
echo "Python version: ${PYTHON_VERSION}"
echo "Jupyter server available at: http://localhost:${PORT}"
echo "Kernel connection details:"
echo "  - URL: http://localhost:${PORT}"
echo "  - Token: (none)"

# Wait for Jupyter to start
sleep 3

# Get kernel information
echo "Available kernels:"
docker exec ${CONTAINER_NAME} jupyter kernelspec list

# Create a test script to verify matplotlib is working
echo "Testing matplotlib..."
cat > /tmp/test_matplotlib.py << EOF
import matplotlib
print("Matplotlib backend:", matplotlib.get_backend())
import matplotlib.pyplot as plt
import numpy as np
x = np.linspace(0, 10, 100)
y = np.sin(x)
plt.figure()
plt.plot(x, y)
plt.title('Test Plot')
plt.savefig('/tmp/test_plot.png')
print("Plot saved successfully!")
EOF

# Run the test script in the container
docker cp /tmp/test_matplotlib.py ${CONTAINER_NAME}:/tmp/
docker exec ${CONTAINER_NAME} python /tmp/test_matplotlib.py

echo "Container setup complete!"
