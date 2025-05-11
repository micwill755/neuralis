/**
 * Storage Service - Handles persistent storage of application data
 */

const STORAGE_KEY = 'neuralis_kernel_config';

/**
 * Save kernel configuration
 * @param {Object} config - Kernel configuration
 */
export const saveKernelConfig = (config) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Error saving kernel config:', error);
  }
};

/**
 * Get saved kernel configuration
 * @returns {Object|null} - Saved kernel configuration or null
 */
export const getKernelConfig = () => {
  try {
    const config = localStorage.getItem(STORAGE_KEY);
    return config ? JSON.parse(config) : null;
  } catch (error) {
    console.error('Error getting kernel config:', error);
    return null;
  }
};

/**
 * Clear saved kernel configuration
 */
export const clearKernelConfig = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing kernel config:', error);
  }
};
