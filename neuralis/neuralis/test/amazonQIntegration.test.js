/**
 * Test script for Amazon Q CLI integration
 */
const { sendMessageToAmazonQ } = require('../server/amazonQService');
const { parseAmazonQResponse } = require('../src/services/amazonQService');

// Mock the child_process.exec function
jest.mock('child_process', () => ({
  exec: jest.fn((command, options, callback) => {
    // Simulate a successful response from Amazon Q CLI
    const stdout = `
Hello! I'm Amazon Q. Here's a simple example of a Python function:

\`\`\`python
def hello_world():
    print("Hello, world!")
    return "Hello from Amazon Q"
\`\`\`

You can use this function by calling it like this:

\`\`\`python
result = hello_world()
print(result)  # Outputs: Hello from Amazon Q
\`\`\`

Let me know if you need anything else!
    `;
    
    callback(null, stdout, '');
  })
}));

// Mock the fs.promises module
jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn().mockResolvedValue(),
    unlink: jest.fn().mockResolvedValue()
  }
}));

describe('Amazon Q CLI Integration', () => {
  test('sendMessageToAmazonQ should return a response from Amazon Q CLI', async () => {
    const message = 'Show me a simple Python function';
    const response = await sendMessageToAmazonQ(message);
    
    expect(response).toContain('Hello! I\'m Amazon Q');
    expect(response).toContain('def hello_world():');
    expect(response).toContain('```python');
  });
  
  test('parseAmazonQResponse should extract code blocks correctly', () => {
    const response = `
Hello! I'm Amazon Q. Here's a simple example of a Python function:

\`\`\`python
def hello_world():
    print("Hello, world!")
    return "Hello from Amazon Q"
\`\`\`

You can use this function by calling it like this:

\`\`\`python
result = hello_world()
print(result)  # Outputs: Hello from Amazon Q
\`\`\`

Let me know if you need anything else!
    `;
    
    const parsed = parseAmazonQResponse(response);
    
    expect(parsed.text).toContain('Hello! I\'m Amazon Q');
    expect(parsed.text).toContain('Let me know if you need anything else!');
    expect(parsed.codeBlocks).toHaveLength(2);
    expect(parsed.codeBlocks[0]).toContain('def hello_world():');
    expect(parsed.codeBlocks[1]).toContain('result = hello_world()');
  });
});
