// src/components/chat/AllieChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, Brain, X } from 'lucide-react';
import { useFamily } from '../../hooks/useFamily';
import ChatService from '../../services/ChatService';

const AllieChat = ({ onClose }) => {
  const { familyData } = useFamily();
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'allie',
      text: "Hi, I'm Allie! I can help answer questions about family balance, the app, or provide personalized advice. What would you like to know?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Send a message
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: input.trim(),
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Get AI response
      const aiResponse = await ChatService.getAIResponse(
        userMessage.text,
        familyData?.familyId,
        messages
      );
      
      // Add AI message
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'allie',
          text: aiResponse,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'allie',
          text: "I'm sorry, I encountered an error. Please try again.",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle input change
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };
  
  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };
  
  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-96 bg-white rounded-lg shadow-xl flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center">
          <Brain size={18} className="text-purple-600 mr-2" />
          <h3 className="font-medium">Ask Allie</h3>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <X size={16} />
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-xs p-3 rounded-lg ${
                message.sender === 'user' 
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t">
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your question..."
            className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:bg-blue-300"
            disabled={!input.trim() || isLoading}
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AllieChat;