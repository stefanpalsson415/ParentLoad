// Server: claudeService.js
const axios = require('axios');
require('dotenv').config();

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

async function generateChatResponse(userMessage, chatHistory, familyData) {
  try {
    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: "claude-3-7-sonnet-20250219",
        messages: formatMessages(chatHistory, userMessage),
        system: generateSystemPrompt(familyData),
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );
    
    return response.data.content[0].text;
  } catch (error) {
    console.error('Claude API error:', error);
    return "I'm having trouble connecting. Please try again later.";
  }
}

function formatMessages(chatHistory, currentMessage) {
  // Format chat history for Claude API
  const messages = chatHistory.map(msg => ({
    role: msg.isUser ? "user" : "assistant",
    content: msg.text
  }));
  
  // Add current message
  messages.push({
    role: "user",
    content: currentMessage
  });
  
  return messages;
}

function generateSystemPrompt(familyData) {
  return `You are Allie, an AI coach helping families balance responsibilities. 
  
Family Name: ${familyData.familyName}
Family Members: ${JSON.stringify(familyData.familyMembers)}
Current Week: ${familyData.currentWeek}
Survey Responses: ${JSON.stringify(familyData.surveyResponses)}

Provide personalized advice based on this family's data. Be supportive, practical, and focus on balanced workload distribution.`;
}

module.exports = { generateChatResponse };