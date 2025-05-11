# Amazon Q CLI Integration Tests

This directory contains test scripts for the Amazon Q CLI integration.

## Available Tests

1. **Unit Tests** (`amazonQIntegration.test.js`):
   - Tests the `sendMessageToAmazonQ` function
   - Tests the `parseAmazonQResponse` function
   - Uses Jest mocks to simulate Amazon Q CLI responses

2. **Manual Test Script** (`manual-test.js`):
   - Sends a real request to Amazon Q CLI
   - Displays the full response
   - Extracts and displays code blocks
   - Run with: `node test/manual-test.js`

3. **Test Server** (`test-server.js`):
   - Provides a simple web interface for testing
   - Allows sending messages to Amazon Q CLI
   - Displays responses and extracted code blocks
   - Run with: `node test/test-server.js`

## Running the Tests

### Prerequisites

- Amazon Q CLI must be installed and configured
- Node.js and npm must be installed

### Unit Tests

```
npm test
```

### Manual Test Script

```
node test/manual-test.js
```

### Test Server

```
node test/test-server.js
```

Then open `http://localhost:3001` in your browser.

## Troubleshooting

If you encounter issues:

1. Verify Amazon Q CLI is installed:
   ```
   q --version
   ```

2. Check that you can use Amazon Q CLI directly:
   ```
   q chat
   ```

3. Ensure all dependencies are installed:
   ```
   npm install
   ```

4. Check for errors in the console output
