/**
 * Test server for Amazon Q CLI integration
 * Run this script with: node test/test-server.js
 */
const express = require('express');
const bodyParser = require('body-parser');
const { sendMessageToAmazonQ } = require('../server/amazonQService');

const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.json());

// Test endpoint
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Amazon Q CLI Integration Test</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          textarea { width: 100%; height: 100px; margin-bottom: 10px; padding: 8px; }
          button { padding: 8px 16px; background-color: #2196f3; color: white; border: none; cursor: pointer; }
          pre { background-color: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
          .code-block { background-color: #e8f5e9; padding: 10px; margin: 10px 0; border-left: 4px solid #4caf50; }
          .loading { display: none; margin-top: 10px; }
        </style>
      </head>
      <body>
        <h1>Amazon Q CLI Integration Test</h1>
        <p>Enter a message to send to Amazon Q:</p>
        <textarea id="message" placeholder="Write a simple Python function to calculate the factorial of a number"></textarea>
        <div>
          <button id="send">Send to Amazon Q</button>
        </div>
        <div class="loading" id="loading">
          <p>Waiting for response from Amazon Q...</p>
        </div>
        <div id="response-container" style="display: none;">
          <h2>Response:</h2>
          <pre id="response"></pre>
          <h2>Extracted Code Blocks:</h2>
          <div id="code-blocks"></div>
        </div>
        
        <script>
          document.getElementById('send').addEventListener('click', async () => {
            const message = document.getElementById('message').value;
            if (!message) return;
            
            document.getElementById('loading').style.display = 'block';
            document.getElementById('response-container').style.display = 'none';
            document.getElementById('response').textContent = '';
            document.getElementById('code-blocks').innerHTML = '';
            
            try {
              const response = await fetch('/api/amazon-q', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
              });
              
              const data = await response.json();
              
              document.getElementById('loading').style.display = 'none';
              document.getElementById('response-container').style.display = 'block';
              document.getElementById('response').textContent = data.response;
              
              // Extract code blocks
              const codeBlockRegex = /\`\`\`([\s\S]*?)\`\`\`/g;
              let match;
              let codeBlockCount = 0;
              const codeBlocksContainer = document.getElementById('code-blocks');
              
              while ((match = codeBlockRegex.exec(data.response)) !== null) {
                codeBlockCount++;
                const codeBlock = document.createElement('div');
                codeBlock.className = 'code-block';
                codeBlock.innerHTML = '<h3>Code Block ' + codeBlockCount + '</h3><pre>' + match[1] + '</pre>';
                codeBlocksContainer.appendChild(codeBlock);
              }
              
              if (codeBlockCount === 0) {
                codeBlocksContainer.innerHTML = '<p>No code blocks found in the response.</p>';
              }
            } catch (error) {
              document.getElementById('loading').style.display = 'none';
              document.getElementById('response-container').style.display = 'block';
              document.getElementById('response').textContent = 'Error: ' + error.message;
            }
          });
        </script>
      </body>
    </html>
  `);
});

// API endpoint for Amazon Q
app.post('/api/amazon-q', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const response = await sendMessageToAmazonQ(message);
    res.json({ response });
  } catch (error) {
    console.error('Error processing Amazon Q request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log('Open this URL in your browser to test the Amazon Q CLI integration');
});
