#!/bin/bash
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
