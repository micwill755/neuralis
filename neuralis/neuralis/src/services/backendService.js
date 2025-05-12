/**
 * Backend Service
 * Handles communication with the backend server for kernel operations
 */
import axios from 'axios';

const API_BASE_URL = '/api';

/**
 * Create a conda environment
 * @param {Object} params - Environment parameters
 * @returns {Promise<Object>} - Created environment info
 */
export const createCondaEnvironment = async (params) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/kernels/conda`, params);
    return response.data;
  } catch (error) {
    console.error('Error creating conda environment:', error);
    throw error;
  }
};

/**
 * Create a Docker container
 * @param {Object} params - Container parameters
 * @returns {Promise<Object>} - Created container info
 */
export const createDockerContainer = async (params) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/kernels/docker`, params);
    return response.data;
  } catch (error) {
    console.error('Error creating Docker container:', error);
    throw error;
  }
};

/**
 * Connect to a terminal kernel
 * @param {Object} params - Connection parameters
 * @returns {Promise<Object>} - Connection info
 */
export const connectToTerminalKernel = async (params) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/kernels/terminal`, params);
    return response.data;
  } catch (error) {
    console.error('Error connecting to terminal kernel:', error);
    throw error;
  }
};

/**
 * Start a kernel
 * @param {string} kernelId - ID of the kernel to start
 * @returns {Promise<Object>} - Updated kernel info
 */
export const startKernel = async (kernelId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/kernels/${kernelId}/start`);
    return response.data;
  } catch (error) {
    console.error('Error starting kernel:', error);
    throw error;
  }
};

/**
 * Stop a kernel
 * @param {string} kernelId - ID of the kernel to stop
 * @returns {Promise<Object>} - Updated kernel info
 */
export const stopKernel = async (kernelId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/kernels/${kernelId}/stop`);
    return response.data;
  } catch (error) {
    console.error('Error stopping kernel:', error);
    throw error;
  }
};

/**
 * Restart a kernel
 * @param {string} kernelId - ID of the kernel to restart
 * @returns {Promise<Object>} - Updated kernel info
 */
export const restartKernel = async (kernelId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/kernels/${kernelId}/restart`);
    return response.data;
  } catch (error) {
    console.error('Error restarting kernel:', error);
    throw error;
  }
};

/**
 * Get all available kernels
 * @returns {Promise<Array>} - List of kernels
 */
export const getKernels = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/kernels`);
    return response.data;
  } catch (error) {
    console.error('Error getting kernels:', error);
    throw error;
  }
};
