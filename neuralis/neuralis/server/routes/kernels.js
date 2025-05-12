/**
 * API routes for kernel management
 */
const express = require('express');
const router = express.Router();
const kernelManager = require('../kernelManager');

// Initialize kernel manager
router.get('/initialize', async (req, res) => {
  try {
    const result = await kernelManager.initialize();
    res.json({ success: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List available containers
router.get('/containers', async (req, res) => {
  try {
    const containers = await kernelManager.listContainers();
    res.json({ containers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Build a new kernel container
router.post('/containers', async (req, res) => {
  try {
    const { pythonVersion, port, name } = req.body;
    const result = await kernelManager.buildKernelContainer({
      pythonVersion,
      port,
      name
    });
    
    if (result.success) {
      res.json({ success: true, container: result.container });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stop a container
router.delete('/containers/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const result = await kernelManager.stopContainer(name);
    res.json({ success: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;