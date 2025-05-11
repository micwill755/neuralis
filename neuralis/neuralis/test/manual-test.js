/**
 * Manual test script for Amazon Q CLI integration
 * Run this script with: node test/manual-test.js
 */
const { sendMessageToAmazonQ } = require('../server/amazonQService');

// Test message to send to Amazon Q
const testMessage = 'Write a simple Python function to calculate the factorial of a number';

console.log('Testing Amazon Q CLI integration...');
console.log(`Sending message: "${testMessage}"`);
console.log('Waiting for response...');

// Send the test message to Amazon Q
sendMessageToAmazonQ(testMessage)
  .then(response => {
    console.log('\n=== Amazon Q Response ===\n');
    console.log(response);
    console.log('\n=== End of Response ===\n');
    
    // Parse the response to extract code blocks
    const codeBlockRegex = /```(?:[\w]*)\n([\s\S]*?)```/g;
    let match;
    let codeBlockCount = 0;
    
    console.log('Extracted code blocks:');
    while ((match = codeBlockRegex.exec(response)) !== null) {
      codeBlockCount++;
      console.log(`\n--- Code Block ${codeBlockCount} ---\n`);
      console.log(match[1]);
      console.log(`\n--- End of Code Block ${codeBlockCount} ---\n`);
    }
    
    if (codeBlockCount === 0) {
      console.log('No code blocks found in the response.');
    }
    
    console.log('Test completed successfully!');
  })
  .catch(error => {
    console.error('Error during test:', error);
  });
