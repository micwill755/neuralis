const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Endpoint to check if Amazon Q CLI is available
app.get('/api/amazon-q/check', (req, res) => {
  const process = spawn('q', ['--version']);
  
  let stdout = '';
  let stderr = '';
  
  process.stdout.on('data', (data) => {
    stdout += data.toString();
  });
  
  process.stderr.on('data', (data) => {
    stderr += data.toString();
  });
  
  process.on('close', (code) => {
    if (code === 0) {
      res.json({ available: true, version: stdout.trim() });
    } else {
      res.json({ available: false, error: stderr });
    }
  });
});

// Endpoint to send prompts to Amazon Q CLI
app.post('/api/amazon-q/prompt', (req, res) => {
  const { prompt } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  
  const process = spawn('q', ['chat', '--no-interactive']);
  
  let responseData = '';
  let errorData = '';
  
  process.stdout.on('data', (data) => {
    responseData += data.toString();
  });
  
  process.stderr.on('data', (data) => {
    errorData += data.toString();
  });
  
  process.on('close', (code) => {
    if (code === 0) {
      res.json({ success: true, response: responseData });
    } else {
      res.status(500).json({ success: false, error: errorData });
    }
  });
  
  // Write the prompt to stdin
  process.stdin.write(prompt);
  process.stdin.end();
});

app.listen(port, () => {
  console.log(`Amazon Q CLI server running at http://localhost:${port}`);
});