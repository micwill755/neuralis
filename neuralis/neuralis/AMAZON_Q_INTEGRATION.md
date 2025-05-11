# Amazon Q CLI Integration

This document explains how to set up and use the Amazon Q CLI integration in the Neuralis application.

## Prerequisites

1. Install the Amazon Q CLI on your system:
   ```
   # Follow the official AWS documentation to install Amazon Q CLI
   # https://docs.aws.amazon.com/amazonq/latest/cli-user-guide/getting-started.html
   ```

2. Verify that Amazon Q CLI is installed and working:
   ```
   q --version
   ```

3. Make sure you can run Amazon Q chat from the command line:
   ```
   q chat
   ```

## Setup

1. Install the required Node.js dependencies:
   ```
   npm install express body-parser cors concurrently
   ```

2. Start the application with both frontend and backend servers:
   ```
   npm run dev
   ```

## How It Works

The integration consists of three main components:

1. **Frontend Component (`AmazonQAssistant.js`)**: 
   - Provides the UI for interacting with Amazon Q
   - Sends user messages to the backend API
   - Displays responses from Amazon Q
   - Allows inserting code snippets into notebooks

2. **Frontend Service (`amazonQService.js`)**:
   - Handles communication with the backend API
   - Parses responses to extract code blocks

3. **Backend Server (`server/index.js` and `server/amazonQService.js`)**:
   - Provides an API endpoint for the frontend
   - Executes Amazon Q CLI commands
   - Returns responses to the frontend

## Usage

1. Open the Neuralis application in your browser
2. Click on the "Show Amazon Q" button to open the assistant panel
3. Type your question or request in the input field
4. Press "Send" or use Ctrl+Enter to submit
5. Amazon Q will respond with text and/or code snippets
6. Click "Insert Code to Notebook" to add code to your current notebook

## Troubleshooting

If you encounter issues with the Amazon Q integration:

1. Check that Amazon Q CLI is installed and working:
   ```
   q --version
   q chat
   ```

2. Verify that the backend server is running:
   ```
   npm run server
   ```

3. Check the browser console and server logs for error messages

4. Ensure your AWS credentials are properly configured:
   ```
   aws configure
   ```

5. If you're getting timeout errors, try increasing the `maxBuffer` value in `server/amazonQService.js`

## Security Considerations

- The application executes commands on your system, so ensure you're using it in a secure environment
- User inputs are written to temporary files, which are deleted after use
- The server only accepts requests from the same origin by default
