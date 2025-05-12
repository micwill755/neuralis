/**
 * Simple Express server to execute Python code
 * This server acts as a bridge between the React frontend and the local Python interpreter
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 5001;

// Configure middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(__dirname, '../../temp');
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// Endpoint to execute Python code
app.post('/execute', upload.single('code_file'), (req, res) => {
  const codeFile = req.file;
  const executionId = req.body.execution_id || Date.now();
  
  if (!codeFile) {
    return res.status(400).json({ error: 'No code file provided' });
  }
  
  const filePath = codeFile.path;
  const resultFilePath = `${filePath}.result.json`;
  
  // Execute the Python code
  exec(`python ${filePath}`, (error, stdout, stderr) => {
    // Check if the result file exists
    if (fs.existsSync(resultFilePath)) {
      try {
        // Read the result file
        const resultData = JSON.parse(fs.readFileSync(resultFilePath, 'utf8'));
        
        // Clean up temporary files
        fs.unlinkSync(filePath);
        fs.unlinkSync(resultFilePath);
        
        // Send the result back to the client
        return res.json(resultData);
      } catch (err) {
        console.error('Error reading result file:', err);
        return res.status(500).json({ 
          error: `Error processing Python execution result: ${err.message}`,
          stdout,
          stderr
        });
      }
    } else {
      // If the result file doesn't exist, there was an error executing the Python code
      let errorMessage = '';
      
      if (error) {
        errorMessage = `Execution error: ${error.message}\n${stderr}`;
      } else {
        errorMessage = 'Unknown error executing Python code';
      }
      
      // Clean up temporary file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      return res.status(500).json({ 
        error: errorMessage,
        stdout,
        stderr
      });
    }
  });
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Python execution server running at http://localhost:${port}`);
});

// Handle server shutdown
process.on('SIGINT', () => {
  console.log('Shutting down Python execution server');
  server.close();
  process.exit(0);
});

module.exports = server;
