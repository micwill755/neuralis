/**
 * Service for interacting with the Amazon Q CLI via backend API
 */

class AmazonQCliService {
  constructor() {
    this.baseUrl = 'http://localhost:3001/api/amazon-q';
    this.initialized = false;
  }

  /**
   * Initialize the Amazon Q CLI service
   */
  async initialize() {
    try {
      // Check if Amazon Q CLI is available via the backend
      const response = await fetch(`${this.baseUrl}/check`);
      const data = await response.json();
      
      this.initialized = data.available;
      
      if (data.available) {
        console.log('Amazon Q CLI is available:', data.version);
      } else {
        console.error('Amazon Q CLI is not available:', data.error);
      }
      
      return this.initialized;
    } catch (error) {
      console.error('Error checking Amazon Q CLI availability:', error);
      return false;
    }
  }

  /**
   * Send a prompt to Amazon Q CLI
   */
  async sendPrompt(prompt, onResponse) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // First, notify that we're starting to get a response
      if (onResponse) {
        onResponse({
          type: 'partial',
          content: 'Waiting for Amazon Q response...'
        });
      }
      
      // Call the backend API to send the prompt
      const response = await fetch(`${this.baseUrl}/prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (onResponse) {
          onResponse({
            type: 'complete',
            content: data.response
          });
        }
        return true;
      } else {
        if (onResponse) {
          onResponse({
            type: 'error',
            content: data.error || 'Unknown error occurred'
          });
        }
        return false;
      }
    } catch (error) {
      console.error('Error sending prompt to Amazon Q CLI:', error);
      if (onResponse) {
        onResponse({
          type: 'error',
          content: `Error: ${error.message}`
        });
      }
      return false;
    }
  }

  /**
   * Cancel the current request
   */
  cancelRequest() {
    // Not implemented for the API version
    console.log('Request cancellation not supported in this implementation');
    return false;
  }
}

// Create a singleton instance
const amazonQCliService = new AmazonQCliService();

export default amazonQCliService;

