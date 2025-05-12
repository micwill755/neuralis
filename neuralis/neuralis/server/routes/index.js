/**
 * API Routes Index
 */
const express = require('express');
const router = express.Router();
const kernelRoutes = require('./kernelRoutes');

// Mount routes
router.use('/kernels', kernelRoutes);

module.exports = router;
