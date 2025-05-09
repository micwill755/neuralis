import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import amazonQService from '../../services/amazonQService';

const AssistantContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f9f9fa;
  border-left: 1px solid #ddd;
  overflow: hidden; /* Prevent overflow at container level */
`;

const AssistantHeader = styled.div`
  padding: 10px 15px;
  background-color: #232f3e;
  color: white;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0; /* Prevent header from shrinking */
  z-index: 10; /* Keep header on top */
`;

const ChatContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Message = styled.div`
  margin-bottom: 15px;
  max-width: 85%;
  padding: 10px 15px;
  border-radius: 8px;
  ${props => props.isUser ? `
    align-self: flex-end;
    background-color: #0078d4;
    color: white;
  ` : `
    align-self: flex-start;
    background-color: white;
    border: 1px solid #ddd;
  `}
  white-space: pre-wrap;
`;

const CodeBlock = styled.div`
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin: 10px 0;
  position: relative;
`;

const CodeContent = styled.pre`
  padding: 12px;
  margin: 0;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.4;
  background-color: #f5f5f5;
  color: #28a745; /* Green text color for code */
`;

const InsertCodeButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  margin-top: 8px;
  cursor: pointer;
  font-size: 13px;
  
  &:hover {
    background-color: #218838;
  }
`;

const InputContainer = styled.div`
  padding: 15px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Input = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: none;
  height: 80px;
  font-family: inherit;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #2196f3;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
`;

const SendButton = styled.button`
  padding: 8px 16px;
  background-color: #232f3e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #1a2530;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

// Helper function to extract code blocks from a message
const extractCodeBlocks = (message) => {
  if (!message) return [];
  
  // Regex to find code blocks (text between triple backticks)
  const codeBlockRegex = /```(?:python|javascript|java|html|css|bash|shell|sql|json|xml|yaml|typescript|jsx|tsx|markdown|md|text|plain|r|ruby|php|go|c|cpp|csharp|swift)?\n?([\s\S]*?)```/g;
  const matches = [];
  let match;
  
  while ((match = codeBlockRegex.exec(message)) !== null) {
    matches.push(match[1].trim());
  }
  
  // Also look for code blocks that might be indicated by Amazon Q CLI formatting
  // This regex looks for blocks of text that appear to be code (indented or with special markers)
  const cliCodeRegex = /m10m([\s\S]*?)mmm/g;
  while ((match = cliCodeRegex.exec(message)) !== null) {
    matches.push(match[1].trim());
  }
  
  return matches;
};

// Clean up Amazon Q CLI output by removing control characters and formatting
const cleanQOutput = (text) => {
  if (!text) return '';
  
  // Remove ANSI color codes and other terminal formatting
  let cleaned = text
    .replace(/\u001b\[\d+(;\d+)*m/g, '') // ANSI escape sequences
    .replace(/\d+m/g, '')               // Color codes
    .replace(/⠋|⠙|⠹|⠸|⠼|✓/g, '')        // Spinner characters
    
  // Try to extract clean code blocks
  const codeBlocks = extractCodeBlocks(cleaned);
  if (codeBlocks.length > 0) {
    // If we found code blocks, return the first one as clean code
    return codeBlocks[0];
  }
  
  return cleaned;
};

const AmazonQAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);
  
  useEffect(() => {
    // Initialize Amazon Q service
    amazonQService.initialize();
    
    // Add welcome message
    setMessages([
      {
        id: Date.now(),
        content: "Hello! I'm Amazon Q. How can I help you with your code today?",
        isUser: false
      }
    ]);
  }, []);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = {
      id: Date.now(),
      content: input.trim(),
      isUser: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Create a placeholder for the assistant's response
    const assistantMessageId = Date.now() + 1;
    setMessages(prev => [...prev, {
      id: assistantMessageId,
      content: '',
      isUser: false,
      isLoading: true
    }]);
    
    // Send prompt to Amazon Q CLI
    await amazonQService.sendPrompt(input.trim(), (response) => {
      if (response.type === 'partial' || response.type === 'complete') {
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: response.content, isLoading: false } 
            : msg
        ));
      } else if (response.type === 'error') {
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: `Error: ${response.content}`, isLoading: false } 
            : msg
        ));
      }
      
      if (response.type === 'complete') {
        setIsLoading(false);
      }
    });
  };
  
  const insertCodeToNotebook = (code) => {
    amazonQService.insertCodeToNotebook(code);
  };
  
  // Find the last code block from assistant messages
  const getLastCodeBlock = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (!message.isUser) {
        const codeBlocks = extractCodeBlocks(message.content);
        if (codeBlocks.length > 0) {
          return codeBlocks[0];
        }
      }
    }
    return null;
  };
  
  // Render message with code blocks highlighted
  const renderMessage = (message) => {
    if (message.isLoading) return 'Thinking...';
    if (message.isUser) return message.content;
    
    const codeBlocks = extractCodeBlocks(message.content);
    
    if (codeBlocks.length === 0) {
      return message.content;
    }
    
    // If there's code, display it in a code block with an insert button
    const cleanCode = codeBlocks[0]; // Use the first code block
    
    return (
      <>
        <div>{message.content.split('```')[0]}</div>
        <CodeBlock>
          <CodeContent>{cleanCode}</CodeContent>
          <InsertCodeButton onClick={() => insertCodeToNotebook(cleanCode)}>
            Insert Code to Notebook
          </InsertCodeButton>
        </CodeBlock>
        {message.content.split('```').length > 2 && (
          <div>{message.content.split('```').slice(2).join('```')}</div>
        )}
      </>
    );
  };
  
  return (
    <AssistantContainer>
      <AssistantHeader>
        Amazon Q Assistant
      </AssistantHeader>
      
      <ChatContainer ref={chatContainerRef}>
        {messages.map(message => (
          <Message key={message.id} isUser={message.isUser}>
            {renderMessage(message)}
          </Message>
        ))}
      </ChatContainer>
      
      <InputContainer>
        <Input 
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask Amazon Q for help... (Ctrl+Enter to send)"
          disabled={isLoading}
        />
        <ButtonGroup>
          <SendButton 
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </SendButton>
        </ButtonGroup>
      </InputContainer>
    </AssistantContainer>
  );
};

export default AmazonQAssistant;
