# Neuralis Backend

This is a backend service for the Neuralis application that handles Docker operations for kernel management.

## Features

- Docker availability checking
- Container management (create, list, stop, restart)
- Container logs retrieval
- Script execution for kernel setup

## Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

## API Endpoints

### Check Docker Availability
```
GET /api/docker/check
```

### List Containers
```
GET /api/containers
```

### Create Container
```
POST /api/containers
```
Body:
```json
{
  "pythonVersion": "3.9",
  "port": 8888,
  "name": "neuralis-kernel-3.9",
  "packages": "pandas,matplotlib,scikit-learn"
}
```

### Restart Container
```
POST /api/containers/:name/restart
```

### Stop and Remove Container
```
DELETE /api/containers/:name
```

### Get Container Logs
```
GET /api/containers/:name/logs
```

## Development

For development with auto-restart:
```
npm run dev
```
