import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

class ChatService {
  // Load messages for a family
  async loadMessages(familyId) {
    try {
      const q = query(
        collection(db, "chatMessages"),
        where("familyId", "==", familyId),
        orderBy("timestamp", "asc")
      );
      
      const querySnapshot = await getDocs(q);
      const messages = [];
      
      querySnapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return messages;
    } catch (error) {
      console.error("Error loading messages:", error);
      throw error;
    }
  }
  
  // Save a message to the database
  async saveMessage(message) {
    try {
      await addDoc(collection(db, "chatMessages"), {
        ...message,
        createdAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error("Error saving message:", error);
      throw error;
    }
  }
  
  // Get AI response from Claude
  async getAIResponse(text, familyId, previousMessages) {
    try {
      // In a production app, you would call your backend API that interfaces with Claude
      // For now, we'll simulate a response with a placeholder
      
      // Create a conversation history for context
      const conversationHistory = previousMessages
        .slice(-10) // Last 10 messages for context
        .map(msg => ({
          role: msg.sender === 'allie' ? 'assistant' : 'user',
          content: msg.text
        }));
      
      // Add the current message
      conversationHistory.push({
        role: 'user',
        content: text
      });
      
      // For demo purposes, we'll return a simulated response
      // In production, you'd send this conversation to your backend API
      // which would call Claude and return the response
      
      console.log("Would send to Claude API:", {
        familyId,
        messages: conversationHistory
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a contextual response based on the question
      let response;
      
      if (text.toLowerCase().includes("why") && text.toLowerCase().includes("allie")) {
        response = "Allie was created to help families balance responsibilities more fairly. Our mission is to reduce relationship strain and create healthier, happier families through better workload balance.";
      } else if (text.toLowerCase().includes("how") && text.toLowerCase().includes("use")) {
        response = "To get the most out of Allie, start with the initial survey for all family members. Then use the weekly check-ins to track progress. The dashboard shows your family's balance data, and our AI provides personalized recommendations for improvement.";
      } else if (text.toLowerCase().includes("survey")) {
        response = "Your family's survey results help us understand your unique situation. Based on responses so far, I can see areas where you might want to focus on balancing workload. Would you like specific insights about a particular category of tasks?";
      } else {
        response = "I'm here to help your family achieve better balance! I can answer questions about how to use the app, provide insights from your survey data, or offer research-backed parenting advice. What would you like to know more about?";
      }
      
      return response;
    } catch (error) {
      console.error("Error getting AI response:", error);
      return "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.";
    }
  }
}

export default new ChatService();