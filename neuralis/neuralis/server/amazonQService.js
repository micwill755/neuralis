/**
 * Amazon Q CLI Service for the backend
 */
const { exec, execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

/**
 * Send a message to Amazon Q CLI and get the response
 * @param {string} message - The message to send to Amazon Q
 * @returns {Promise<string>} - The response from Amazon Q
 */
async function sendMessageToAmazonQ(message) {
  try {
    // Create a temporary file to store the message
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `q_message_${Date.now()}.txt`);
    const outputFilePath = path.join(tempDir, `q_output_${Date.now()}.txt`);
    
    // Write the message to the temporary file
    await fs.writeFile(tempFilePath, message);
    
    console.log(`Sending message to Amazon Q CLI: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);
    console.log(`Using temp file: ${tempFilePath}`);
    
    // Execute the Amazon Q CLI command
    return new Promise((resolve, reject) => {
      // Use a direct command with input/output redirection
      const command = `q chat < ${tempFilePath} > ${outputFilePath} 2>&1`;
      
      exec(command, { timeout: 30000 }, async (error, stdout, stderr) => {
        try {
          // Read the output file
          const output = await fs.readFile(outputFilePath, 'utf8');
          
          // Clean up the temporary files
          await fs.unlink(tempFilePath).catch(e => console.error(`Error deleting temp input file: ${e.message}`));
          await fs.unlink(outputFilePath).catch(e => console.error(`Error deleting temp output file: ${e.message}`));
          
          if (error) {
            console.error(`Error executing Amazon Q CLI: ${error.message}`);
            return reject(new Error(`Amazon Q CLI error: ${error.message}`));
          }
          
          resolve(output);
        } catch (cleanupError) {
          console.error(`Error in cleanup: ${cleanupError.message}`);
          reject(cleanupError);
        }
      });
    });
  } catch (error) {
    console.error(`Error in sendMessageToAmazonQ: ${error.message}`);
    throw error;
  }
}

module.exports = {
  sendMessageToAmazonQ
};

module.exports = {
  sendMessageToAmazonQ
};
