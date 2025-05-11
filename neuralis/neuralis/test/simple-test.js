/**
 * Simple test script for Amazon Q CLI integration
 * This script uses the child_process.execSync method to directly interact with the CLI
 * Run with: node test/simple-test.js
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create a temporary file with a test message
const testMessage = 'Write a simple Python function to calculate the factorial of a number';
const tempFilePath = path.join(__dirname, '../test-output/test-message.txt');
const outputFilePath = path.join(__dirname, '../test-output/q-response.txt');

console.log('Testing Amazon Q CLI with direct command execution...');
console.log(`Test message: "${testMessage}"`);

try {
  // Write the test message to a file
  fs.writeFileSync(tempFilePath, testMessage);
  console.log(`Message written to ${tempFilePath}`);
  
  // Execute the Amazon Q CLI command and capture the output
  console.log('Executing Amazon Q CLI command...');
  const command = `q chat < ${tempFilePath} > ${outputFilePath} 2>&1`;
  
  try {
    execSync(command, { timeout: 30000 });
    console.log('Command executed successfully');
    
    // Read and display the response
    const response = fs.readFileSync(outputFilePath, 'utf8');
    console.log('\n=== Amazon Q Response ===\n');
    console.log(response);
    console.log('\n=== End of Response ===\n');
    
    console.log('Test completed successfully!');
  } catch (execError) {
    console.error('Error executing Amazon Q CLI command:', execError.message);
    if (fs.existsSync(outputFilePath)) {
      const errorOutput = fs.readFileSync(outputFilePath, 'utf8');
      console.error('Command output:', errorOutput);
    }
  }
} catch (error) {
  console.error('Error during test:', error);
}
