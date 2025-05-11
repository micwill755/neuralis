/**
 * Amazon Q Service
 * This service handles interactions with the Amazon Q CLI
 */

/**
 * Send a message to Amazon Q CLI and get a response
 * @param {string} message - The message to send to Amazon Q
 * @returns {Promise<string>} - The response from Amazon Q
 */
export const sendMessageToAmazonQ = async (message) => {
  try {
    // Use the browser's fetch API to call our backend endpoint that will interact with the CLI
    const response = await fetch('/api/amazon-q', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error communicating with Amazon Q CLI:', error);
    return `Error communicating with Amazon Q CLI: ${error.message}`;
  }
};

/**
 * Parse the response from Amazon Q to extract code blocks
 * @param {string} response - The response from Amazon Q
 * @returns {Object} - Object containing the text and code blocks
 */
export const parseAmazonQResponse = (response) => {
  const result = {
    text: '',
    codeBlocks: []
  };
  
  // Handle ANSI escape codes in the response
  const cleanResponse = response.replace(/\u001b\[\d+[A-Za-z]/g, '')
                               .replace(/\u001b\[\d+;\d+[A-Za-z]/g, '')
                               .replace(/\u001b\[\d+[ABCDEFGJKST]/g, '')
                               .replace(/\u001b\[\??\d+[hl]/g, '')
                               .replace(/\u001b\[\d+;\d+;\d+m/g, '')
                               .replace(/\u001b\[\d+m/g, '')
                               .replace(/\u001b\[m/g, '')
                               .replace(/\u001b\[\d+;\d+r/g, '')
                               .replace(/\u001b\[\d+;\d+H/g, '')
                               .replace(/\u001b\[K/g, '')
                               .replace(/\u001b\[2K/g, '')
                               .replace(/\u001b\[7/g, '')
                               .replace(/\u001b\[8/g, '');
  
  // Extract code blocks - look for patterns like ```python ... ``` or ```javascript ... ```
  const codeBlockRegex = /```(?:[\w]*)\n([\s\S]*?)```/g;
  let match;
  let lastIndex = 0;
  
  // Extract all code blocks and keep track of the text before each code block
  while ((match = codeBlockRegex.exec(cleanResponse)) !== null) {
    // Add text before this code block
    result.text += cleanResponse.substring(lastIndex, match.index).trim() + ' ';
    
    // Add the code block
    result.codeBlocks.push(match[1]);
    
    // Update the last index
    lastIndex = match.index + match[0].length;
  }
  
  // Add any remaining text after the last code block
  if (lastIndex < cleanResponse.length) {
    result.text += cleanResponse.substring(lastIndex).trim();
  }
  
  return result;
};
