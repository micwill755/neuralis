/**
 * Express server for handling Amazon Q CLI interactions
 */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sendMessageToAmazonQ } = require('./amazonQService');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

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
  console.log(`Server running on port ${PORT}`);
});
