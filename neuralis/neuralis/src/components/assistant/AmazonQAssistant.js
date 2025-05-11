import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { sendMessageToAmazonQ, parseAmazonQResponse } from '../../services/amazonQService';

const AssistantContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const ChatContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  background-color: #fafafa;
`;

const InputContainer = styled.div`
  border-top: 1px solid #e0e0e0;
  padding: 12px;
  background-color: white;
`;

const MessageInput = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  resize: none;
  font-family: inherit;
  font-size: 14px;
  min-height: 60px;
  &:focus {
    outline: none;
    border-color: #2196f3;
  }
`;

const SendButton = styled.button`
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  margin-top: 8px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background-color: #1976d2;
  }
  &:disabled {
    background-color: #bdbdbd;
    cursor: not-allowed;
  }
`;

const Message = styled.div`
  margin-bottom: 16px;
  max-width: 85%;
  ${props => props.isUser ? 'margin-left: auto;' : ''}
`;

const MessageBubble = styled.div`
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.4;
  background-color: ${props => props.isUser ? '#e3f2fd' : 'white'};
  border: 1px solid ${props => props.isUser ? '#bbdefb' : '#e0e0e0'};
  color: #333;
  white-space: pre-wrap;
`;

const MessageTime = styled.div`
  font-size: 11px;
  color: #757575;
  margin-top: 4px;
  text-align: ${props => props.isUser ? 'right' : 'left'};
`;

const CodeBlock = styled.pre`
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 8px 12px;
  overflow-x: auto;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  margin: 8px 0;
`;

const CodeActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
`;

const CodeButton = styled.button`
  background-color: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  margin-left: 8px;
  &:hover {
    background-color: #f5f5f5;
  }
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  font-size: 14px;
  margin-top: 8px;
  padding: 8px;
  border-radius: 4px;
  background-color: #ffebee;
  border: 1px solid #ffcdd2;
`;

function AmazonQAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm Amazon Q. How can I help you with your code today?",
      isUser: false,
      timestamp: new Date(),
      hasCode: false
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
      hasCode: false
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setError(null);
    
    try {
      // Send message to Amazon Q CLI
      const response = await sendMessageToAmazonQ(inputText);
      
      // Parse the response to extract code blocks
      const parsedResponse = parseAmazonQResponse(response);
      
      const aiMessage = {
        id: Date.now(),
        text: parsedResponse.text,
        isUser: false,
        timestamp: new Date(),
        hasCode: parsedResponse.codeBlocks.length > 0,
        codeBlocks: parsedResponse.codeBlocks
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error communicating with Amazon Q:', err);
      setError(`Failed to get response from Amazon Q: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const insertCodeToNotebook = (code) => {
    // Create a custom event to communicate with the notebook component
    const event = new CustomEvent('insertCodeToNotebook', {
      detail: { code, cellType: 'code' }
    });
    window.dispatchEvent(event);
  };
  
  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <AssistantContainer>
      <ChatContainer>
        {messages.map(message => (
          <Message key={message.id} isUser={message.isUser}>
            <MessageBubble isUser={message.isUser}>
              {message.text}
              {message.hasCode && message.codeBlocks && message.codeBlocks.map((code, index) => (
                <div key={index}>
                  <CodeBlock>{code}</CodeBlock>
                  <CodeActions>
                    <CodeButton onClick={() => navigator.clipboard.writeText(code)}>
                      Copy
                    </CodeButton>
                    <CodeButton onClick={() => insertCodeToNotebook(code)}>
                      Insert to Notebook
                    </CodeButton>
                  </CodeActions>
                </div>
              ))}
            </MessageBubble>
            <MessageTime isUser={message.isUser}>
              {formatTimestamp(message.timestamp)}
            </MessageTime>
          </Message>
        ))}
        {isLoading && (
          <Message isUser={false}>
            <MessageBubble isUser={false}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ marginRight: '8px' }}>Thinking</div>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </MessageBubble>
          </Message>
        )}
        {error && (
          <ErrorMessage>
            {error}
          </ErrorMessage>
        )}
        <div ref={chatEndRef} />
      </ChatContainer>
      <InputContainer>
        <MessageInput
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Amazon Q for help with your code..."
          disabled={isLoading}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <small style={{ color: '#757575', fontSize: '11px' }}>Press Ctrl+Enter to send</small>
          <SendButton onClick={handleSendMessage} disabled={!inputText.trim() || isLoading}>
            Send
          </SendButton>
        </div>
      </InputContainer>
    </AssistantContainer>
  );
}

export default AmazonQAssistant;
