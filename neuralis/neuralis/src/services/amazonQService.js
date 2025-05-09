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

  // Clean up Amazon Q CLI output by removing control characters and formatting
  cleanQOutput(text) {
    if (!text) return '';
    
    // Remove ANSI color codes and other terminal formatting
    let cleaned = text
      .replace(/\u001b\[\d+(;\d+)*m/g, '') // ANSI escape sequences
      .replace(/\d+m/g, '')               // Color codes
      .replace(/⠋|⠙|⠹|⠸|⠼|✓/g, '')        // Spinner characters
      
    // Try to extract clean code blocks
    const codeBlocks = this.extractCodeBlocks(cleaned);
    if (codeBlocks.length > 0) {
      // If we found code blocks, return the first one as clean code
      return codeBlocks[0];
    }
    
    return cleaned;
  }
  
  // Helper function to extract code blocks from a message
  extractCodeBlocks(message) {
    if (!message) return [];
    
    // Regex to find code blocks (text between triple backticks)
    const codeBlockRegex = /```(?:python|javascript|java|html|css|bash|shell|sql|json|xml|yaml|typescript|jsx|tsx|markdown|md|text|plain|r|ruby|php|go|c|cpp|csharp|swift)?\n?([\s\S]*?)```/g;
    const matches = [];
    let match;
    
    while ((match = codeBlockRegex.exec(message)) !== null) {
      matches.push(match[1].trim());
    }
    
    // Also look for code blocks that might be indicated by Amazon Q CLI formatting
    // This regex looks for blocks of text that appear to be code (indented or with special markers)
    const cliCodeRegex = /m10m([\s\S]*?)mmm/g;
    while ((match = cliCodeRegex.exec(message)) !== null) {
      matches.push(match[1].trim());
    }
    
    return matches;
  }

  async sendPrompt(prompt, onResponse) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      return await amazonQCliService.sendPrompt(prompt, (response) => {
        // Clean the response content before passing it to the callback
        if (response.content) {
          response.rawContent = response.content;
          response.content = this.cleanQOutput(response.content);
        }
        
        if (onResponse) {
          onResponse(response);
        }
      });
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
    // Clean the code before inserting
    const cleanCode = this.cleanQOutput(code);
    
    // Dispatch an event that the notebook component will listen for
    const event = new CustomEvent('insertCodeToNotebook', {
      detail: { code: cleanCode, cellType }
    });
    window.dispatchEvent(event);
  }
}

// Create a singleton instance
const amazonQService = new AmazonQService();

export default amazonQService;
