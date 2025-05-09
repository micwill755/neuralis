import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { generateCodeFromPrompt } from '../../services/aiAssistantService';

const PanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f8f9fa;
  border-left: 1px solid #ddd;
`;

const Header = styled.div`
  padding: 10px;
  font-weight: bold;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
`;

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 10px;
`;

const MessageBubble = styled.div`
  padding: 10px 12px;
  border-radius: 8px;
  max-width: 85%;
  word-wrap: break-word;
  line-height: 1.4;
  ${props => props.isUser ? `
    align-self: flex-end;
    background-color: #0078d4;
    color: white;
  ` : `
    align-self: flex-start;
    background-color: white;
    border: 1px solid #ddd;
  `}
`;

const CodeBlock = styled.pre`
  background-color: #f1f1f1;
  border-radius: 4px;
  padding: 10px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  margin: 8px 0;
  white-space: pre-wrap;
`;

const InputArea = styled.div`
  padding: 10px;
  border-top: 1px solid #ddd;
`;

const PromptInput = styled.textarea`
  width: 100%;
  height: 80px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  font-family: inherit;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
`;

const Button = styled.button`
  background-color: #0078d4;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #005a9e;
  }
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const InsertButton = styled(Button)`
  background-color: #28a745;
  &:hover {
    background-color: #218838;
  }
`;

// Helper function to extract code blocks from a message
const extractCodeBlocks = (message) => {
  // Simple regex to find code blocks (text between triple backticks)
  const codeBlockRegex = /```([\s\S]*?)```/g;
  const matches = [...message.matchAll(codeBlockRegex)];
  
  if (matches.length === 0) return [message]; // No code blocks found
  
  const result = [];
  let lastIndex = 0;
  
  matches.forEach(match => {
    // Add text before code block
    if (match.index > lastIndex) {
      result.push({
        type: 'text',
        content: message.substring(lastIndex, match.index)
      });
    }
    
    // Add code block
    result.push({
      type: 'code',
      content: match[1].trim()
    });
    
    lastIndex = match.index + match[0].length;
  });
  
  // Add remaining text after last code block
  if (lastIndex < message.length) {
    result.push({
      type: 'text',
      content: message.substring(lastIndex)
    });
  }
  
  return result;
};

const AmazonQPanel = ({ onInsertCode }) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    { 
      id: 'welcome', 
      sender: 'assistant', 
      content: 'Hi! I\'m your AI assistant. Ask me to generate code for your notebook. Try something like "generate a matplotlib scatter plot with random data" or "create a pandas dataframe with sample data".' 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: prompt
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setPrompt(''); // Clear input field
    
    try {
      // Call the Amazon Q service
      const response = await generateCodeFromPrompt(prompt);
      
      // Add assistant response to chat
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: response
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error querying Amazon Q:', error);
      
      // Add error message
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: 'Sorry, I encountered an error while processing your request.'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInsertCode = (code) => {
    if (code && onInsertCode) {
      onInsertCode(code);
    }
  };

  // Find the last code block from assistant messages
  const getLastCodeBlock = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.sender === 'assistant') {
        const parts = extractCodeBlocks(message.content);
        for (const part of parts) {
          if (part.type === 'code') {
            return part.content;
          }
        }
        // If no code blocks with triple backticks, try to return the whole message
        // as it might be just code without formatting
        if (message.content.includes('import ') || 
            message.content.includes('def ') || 
            message.content.includes('class ')) {
          return message.content;
        }
      }
    }
    return null;
  };

  const renderMessageContent = (content) => {
    const parts = extractCodeBlocks(content);
    
    if (parts.length === 1 && !parts[0].type) {
      // Simple message without code blocks
      return <p>{content}</p>;
    }
    
    return parts.map((part, index) => {
      if (part.type === 'code') {
        return (
          <CodeBlock key={index}>
            {part.content}
            <InsertButton 
              onClick={() => handleInsertCode(part.content)}
              style={{ float: 'right', marginTop: '5px' }}
            >
              Insert
            </InsertButton>
          </CodeBlock>
        );
      } else {
        return <p key={index}>{part.content}</p>;
      }
    });
  };

  return (
    <PanelContainer>
      <Header>
        <span>AI Code Assistant</span>
      </Header>
      <Content>
        <ChatContainer>
          {messages.map(message => (
            <MessageBubble 
              key={message.id} 
              isUser={message.sender === 'user'}
            >
              {renderMessageContent(message.content)}
            </MessageBubble>
          ))}
          {isLoading && (
            <MessageBubble>
              <p>Thinking...</p>
            </MessageBubble>
          )}
          <div ref={messagesEndRef} />
        </ChatContainer>
      </Content>
      <InputArea>
        <PromptInput
          placeholder="Ask for code to generate in your notebook... (Ctrl+Enter to send)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <ButtonGroup>
          <Button onClick={handleSubmit} disabled={isLoading || !prompt.trim()}>
            {isLoading ? 'Generating...' : 'Send'}
          </Button>
          {getLastCodeBlock() && (
            <InsertButton 
              onClick={() => handleInsertCode(getLastCodeBlock())}
              disabled={isLoading}
            >
              Insert Latest Code
            </InsertButton>
          )}
        </ButtonGroup>
      </InputArea>
    </PanelContainer>
  );
};

export default AmazonQPanel;
