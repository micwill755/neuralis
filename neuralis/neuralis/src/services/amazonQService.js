/**
 * Service to interact with Amazon Q CLI
 */
import amazonQCliService from './amazonQCliService';

class AmazonQService {
  constructor() {
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return true;
    
    try {
      const initialized = await amazonQCliService.initialize();
      this.isInitialized = initialized;
      return initialized;
    } catch (error) {
      console.error('Failed to initialize Amazon Q service:', error);
      return false;
    }
  }

  async sendPrompt(prompt, onResponse) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      return await amazonQCliService.sendPrompt(prompt, onResponse);
    } catch (error) {
      console.error('Error sending prompt to Amazon Q:', error);
      if (onResponse) {
        onResponse({
          type: 'error',
          content: 'Failed to send prompt to Amazon Q CLI: ' + error.message
        });
      }
      return false;
    }
  }

  cancelRequest() {
    return amazonQCliService.cancelRequest();
  }

  // Method to insert code into notebook
  insertCodeToNotebook(code, cellType = 'code') {
    // Dispatch an event that the notebook component will listen for
    const event = new CustomEvent('insertCodeToNotebook', {
      detail: { code, cellType }
    });
    window.dispatchEvent(event);
  }
}

// Create a singleton instance
const amazonQService = new AmazonQService();

export default amazonQService;
