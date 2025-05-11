/**
 * Kernel API Routes
 */
const express = require('express');
const router = express.Router();
const kernelService = require('../kernelService');

// Store kernel information in memory (in a real app, this would be in a database)
const kernels = {};

// Get all kernels
router.get('/', async (req, res) => {
  try {
    const availableKernels = await kernelService.getAvailableKernels();
    
    // Merge with stored kernel information
    const allKernels = [
      ...availableKernels,
      ...Object.values(kernels).filter(k => 
        !availableKernels.some(ak => ak.id === k.id)
      )
    ];
    
    res.json(allKernels);
  } catch (error) {
    console.error('Error getting kernels:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create conda environment
router.post('/conda', async (req, res) => {
  try {
    const result = await kernelService.createCondaEnvironment(req.body);
    
    // Store kernel information
    const kernelId = `conda_${result.name}`;
    kernels[kernelId] = {
      id: kernelId,
      ...result
    };
    
    res.json(kernels[kernelId]);
  } catch (error) {
    console.error('Error creating conda environment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create Docker container
router.post('/docker', async (req, res) => {
  try {
    const result = await kernelService.createDockerContainer(req.body);
    
    // Store kernel information
    const kernelId = `docker_${result.containerId}`;
    kernels[kernelId] = {
      id: kernelId,
      ...result
    };
    
    res.json(kernels[kernelId]);
  } catch (error) {
    console.error('Error creating Docker container:', error);
    res.status(500).json({ error: error.message });
  }
});

// Connect to terminal kernel
router.post('/terminal', async (req, res) => {
  try {
    const result = await kernelService.connectToTerminalKernel(req.body);
    
    // Store kernel information
    const kernelId = `terminal_${result.connectionId}`;
    kernels[kernelId] = {
      id: kernelId,
      ...result,
      name: `Terminal (${req.body.host}:${req.body.port})`
    };
    
    res.json(kernels[kernelId]);
  } catch (error) {
    console.error('Error connecting to terminal kernel:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start kernel
router.post('/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!kernels[id]) {
      return res.status(404).json({ error: 'Kernel not found' });
    }
    
    const result = await kernelService.startKernel(id, kernels[id]);
    
    // Update kernel information
    kernels[id] = {
      ...kernels[id],
      ...result
    };
    
    res.json(kernels[id]);
  } catch (error) {
    console.error('Error starting kernel:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stop kernel
router.post('/:id/stop', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!kernels[id]) {
      return res.status(404).json({ error: 'Kernel not found' });
    }
    
    const result = await kernelService.stopKernel(id, kernels[id]);
    
    // Update kernel information
    kernels[id] = {
      ...kernels[id],
      ...result
    };
    
    res.json(kernels[id]);
  } catch (error) {
    console.error('Error stopping kernel:', error);
    res.status(500).json({ error: error.message });
  }
});

// Restart kernel
router.post('/:id/restart', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!kernels[id]) {
      return res.status(404).json({ error: 'Kernel not found' });
    }
    
    const result = await kernelService.restartKernel(id, kernels[id]);
    
    // Update kernel information
    kernels[id] = {
      ...kernels[id],
      ...result
    };
    
    res.json(kernels[id]);
  } catch (error) {
    console.error('Error restarting kernel:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
