// src/components/chat/ChatButton.jsx
import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import AllieChat from './AllieChat';

const ChatButton = () => {
  const [showChat, setShowChat] = useState(false);
  
  const toggleChat = () => {
    setShowChat(!showChat);
  };
  
  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 z-40 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700 transition-colors"
      >
        <MessageCircle size={20} />
      </button>
      
      {/* Chat window */}
      {showChat && (
        <AllieChat onClose={() => setShowChat(false)} />
      )}
    </>
  );
};

export default ChatButton;