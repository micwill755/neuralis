# Python 3.12 Kernel for Neuralis

This directory contains Docker configuration to run a Python 3.12 kernel that your Neuralis application can connect to.

## Setup Instructions

1. Make sure Docker and Docker Compose are installed on your system.

2. Build and start the container:
   ```bash
   docker-compose up -d
   ```

3. The Python kernel will be available at `http://localhost:8888`.

4. Configure your Neuralis application to connect to this kernel gateway.

## Container Details

- Python 3.12
- Jupyter Kernel Gateway (not the full Jupyter application)
- Common data science packages (numpy, pandas, matplotlib, scikit-learn)
- Exposed port: 8888

## Adding Custom Packages

If you need additional Python packages, you can add them to the Dockerfile:

```dockerfile
RUN pip install --no-cache-dir package-name
```

Then rebuild the container:

```bash
docker-compose down
docker-compose up -d --build
```

## Accessing Notebooks

The container mounts a `./notebooks` directory where you can store notebook files that will be accessible from within the container.

## Troubleshooting

If you encounter connection issues:

1. Check that the container is running:
   ```bash
   docker-compose ps
   ```

2. View container logs:
   ```bash
   docker-compose logs
   ```

3. Make sure your Neuralis application is configured to connect to `http://localhost:8888`
