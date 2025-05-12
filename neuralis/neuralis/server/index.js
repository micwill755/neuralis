/**
 * Express server for handling Amazon Q CLI interactions and Docker kernel management
 */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sendMessageToAmazonQ } = require('./amazonQService');
const { executePythonCode, createSession, closeSession, listSessions } = require('./pythonService');
const {
  checkDockerAvailability,
  buildKernelContainer,
  listContainers,
  stopContainer,
  restartContainer,
  getContainerLogs,
  createBuildScript
} = require('./dockerService');
const kernelsRouter = require('./routes/kernels');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API endpoint for Amazon Q
app.post('/api/amazon-q', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const response = await sendMessageToAmazonQ(message);
    res.json({ response });
  } catch (error) {
    console.error('Error processing Amazon Q request:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoints for Python execution
app.post('/api/python/execute', async (req, res) => {
  try {
    const { code, sessionId } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }
    
    const result = await executePythonCode(code, sessionId || 'default');
    res.json(result);
  } catch (error) {
    console.error('Error executing Python code:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/python/session', (req, res) => {
  try {
    const { config } = req.body;
    const session = createSession(config);
    res.json(session);
  } catch (error) {
    console.error('Error creating Python session:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/python/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const success = closeSession(sessionId);
    res.json({ success });
  } catch (error) {
    console.error('Error closing Python session:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/python/sessions', (req, res) => {
  try {
    const sessions = listSessions();
    res.json(sessions);
  } catch (error) {
    console.error('Error listing Python sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoints for Docker container management
app.get('/api/docker/check', async (req, res) => {
  try {
    const available = await checkDockerAvailability();
    res.json({ available });
  } catch (error) {
    console.error('Error checking Docker availability:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/containers', async (req, res) => {
  try {
    const { pythonVersion, port, name, packages } = req.body;
    
    const result = await buildKernelContainer({
      pythonVersion,
      port,
      name,
      packages
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error building kernel container:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/containers', async (req, res) => {
  try {
    const containers = await listContainers();
    res.json(containers);
  } catch (error) {
    console.error('Error listing containers:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/containers/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const result = await stopContainer(name);
    res.json(result);
  } catch (error) {
    console.error('Error stopping container:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/containers/:name/restart', async (req, res) => {
  try {
    const { name } = req.params;
    const result = await restartContainer(name);
    res.json(result);
  } catch (error) {
    console.error('Error restarting container:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/containers/:name/logs', async (req, res) => {
  try {
    const { name } = req.params;
    const result = await getContainerLogs(name);
    res.json(result);
  } catch (error) {
    console.error('Error getting container logs:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/scripts/build', async (req, res) => {
  try {
    const scriptPath = await createBuildScript();
    res.json({ success: true, scriptPath });
  } catch (error) {
    console.error('Error creating build script:', error);
    res.status(500).json({ error: error.message });
  }
});

// Use kernel routes
app.use('/api/kernels', kernelsRouter);

// Add endpoint to list active terminals
app.get('/api/terminals', (req, res) => {
  try {
    // This would normally query the terminal server
    // For now, we'll return a mock list
    res.json([
      { name: 'bash-1', type: 'bash' },
      { name: 'python-1', type: 'python' }
    ]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
