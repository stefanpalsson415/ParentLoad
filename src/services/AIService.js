// src/services/aiService.js
import axios from 'axios';

/**
 * Claude AI integration service for various AI-powered features
 */
class AIService {
  constructor() {
    this.API_KEY = process.env.REACT_APP_CLAUDE_API_KEY;
    this.API_URL = 'https://api.anthropic.com/v1/messages';
    this.MODEL = 'claude-3-haiku-20240307'; // The fastest, cheapest model (change to opus or sonnet if needed)
  }

  /**
   * Call Claude API
   * @param {string} systemPrompt The system prompt
   * @param {string} userPrompt The user's message
   * @param {Array} history Previous conversation history (optional)
   * @returns {Promise<string>} The response from Claude
   */
  async callClaudeAPI(systemPrompt, userPrompt, history = []) {
    try {
      // Check if API key is available
      if (!this.API_KEY) {
        console.warn("Claude API key not found. Using simulated responses.");
        return null;
      }

      // Format history if provided
      const messages = [...history];
      
      // Add the current message
      messages.push({
        role: 'user',
        content: userPrompt
      });

      // Call Claude API
      const response = await axios.post(
        this.API_URL,
        {
          model: this.MODEL,
          messages: messages,
          system: systemPrompt,
          max_tokens: 1000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.API_KEY,
            'anthropic-version': '2023-06-01'
          }
        }
      );

      // Extract and return the response text
      return response.data.content[0].text;
    } catch (error) {
      console.error("Claude API error:", error);
      return null;
    }
  }

  /**
   * Generate insights based on family data
   * @param {Object} familyData Family data including surveys and tasks
   * @returns {Promise<Object>} AI-generated insights
   */
  async generateInsights(familyData) {
    // Generate system prompt
    const systemPrompt = this.generateFamilySystemPrompt(
      familyData.familyId,
      {
        familyName: familyData.familyName,
        parents: familyData.familyMembers.filter(m => m.role === 'parent'),
        children: familyData.familyMembers.filter(m => m.role === 'child'),
        balance: familyData.balance || { mama: 50, papa: 50 },
        categoryBalance: familyData.categoryBalance || {},
        priorities: familyData.priorities || {}
      },
      {
        currentWeek: familyData.currentWeek || 1,
        completedTasks: familyData.tasks?.filter(t => t.completed) || [],
        taskEffectiveness: familyData.taskEffectiveness || [],
        relationshipData: familyData.relationshipData || {}
      }
    );
    
    // User prompt asking for insights
    const userPrompt = "Generate insights and recommendations based on this family's data.";
    
    // Call Claude API
    const response = await this.callClaudeAPI(systemPrompt, userPrompt);
    
    // If API call failed, use simulated insights
    if (!response) {
      return this.simulateInsights(familyData);
    }
    
    // Process response to extract insights
    try {
      // Try to parse as JSON if Claude returned structured data
      if (response.includes('{') && response.includes('}')) {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonData = JSON.parse(jsonMatch[0]);
          return jsonData;
        }
      }
      
      // Otherwise, parse it manually into our expected format
      const insights = [];
      
      // Split by headers or paragraph breaks
      const paragraphs = response.split(/\n\n|\r\n\r\n/);
      
      for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i];
        if (paragraph.trim() === '') continue;
        
        // Look for a title/header pattern
        const titleMatch = paragraph.match(/^(.*?)[:\.]/);
        if (titleMatch) {
          const title = titleMatch[1].trim();
          // Find the content (current paragraph minus title, or next paragraph)
          const content = paragraph.substring(titleMatch[0].length).trim() || 
                        (i < paragraphs.length - 1 ? paragraphs[i+1] : '');
          
          // Determine insight type based on keywords
          let type = 'insight';
          if (paragraph.toLowerCase().includes('challeng') || 
              paragraph.toLowerCase().includes('imbalanc')) {
            type = 'challenge';
          } else if (paragraph.toLowerCase().includes('progress') || 
                    paragraph.toLowerCase().includes('improv')) {
            type = 'progress';
          }
          
          insights.push({ title, content, type });
          
          // Skip the next paragraph if we used it as content
          if (content === paragraphs[i+1]) i++;
        } else {
          // If no title pattern, just use first few words as title
          const words = paragraph.split(' ');
          const title = words.slice(0, 3).join(' ') + '...';
          insights.push({ 
            title, 
            content: paragraph,
            type: 'insight'
          });
        }
        
        // Only collect 3-4 insights
        if (insights.length >= 3) break;
      }
      
      return { insights };
    } catch (error) {
      console.error("Error parsing Claude response:", error);
      return this.simulateInsights(familyData);
    }
  }
  
  /**
   * Generate task recommendations using AI
   * @param {Object} familyData Family data 
   * @param {Object} balanceData Current balance metrics
   * @param {Array} previousTasks Previously completed tasks
   * @param {number} weekNumber Current week number
   * @returns {Promise<Array>} AI-generated task recommendations
   */
  async generateTaskRecommendations(familyData, balanceData, previousTasks, weekNumber) {
    // Generate prompt
    const systemPrompt = this.generateTaskRecommendationPrompt(
      familyData,
      balanceData,
      previousTasks,
      weekNumber
    );
    
    // User prompt asking for task recommendations
    const userPrompt = `Generate 3 specific, actionable tasks for Week ${weekNumber} that will help improve family balance.`;
    
    // Call Claude API
    const response = await this.callClaudeAPI(systemPrompt, userPrompt);
    
    // If API call failed, use simulated tasks
    if (!response) {
      return this.simulateTaskRecommendations(familyData, balanceData, weekNumber);
    }
    
    // Process response to extract tasks
    try {
      // Try to convert unstructured text into our task format
      const tasks = [];
      const sections = response.split(/\n\s*\n/); // Split by empty lines
      
      for (let i = 0; i < sections.length && tasks.length < 3; i++) {
        const section = sections[i].trim();
        if (!section) continue;
        
        // Look for a task title pattern (numbered or with a header)
        const titleMatch = section.match(/^(?:Task\s*\d+:|#|\d+\.)\s*(.*?)[:\.]/i) || 
                          section.match(/^([^:\.]+)[:\.]/);
                          
        if (titleMatch) {
          const title = `Week ${weekNumber}: ${titleMatch[1].trim()}`;
          
          // Find description
          const descriptionStart = section.indexOf(titleMatch[0]) + titleMatch[0].length;
          let description = section.substring(descriptionStart).trim();
          
          // If no description or it's too short, look for more text in the next section
          if (description.length < 30 && i < sections.length - 1) {
            description = sections[i+1].trim();
          }
          
          // Determine task category
          const categoryMap = {
            'visible household': 'Visible Household Tasks',
            'invisible household': 'Invisible Household Tasks',
            'visible parent': 'Visible Parental Tasks',
            'invisible parent': 'Invisible Parental Tasks',
            'meal': 'Invisible Household Tasks',
            'clean': 'Visible Household Tasks',
            'child': 'Visible Parental Tasks',
            'emotion': 'Invisible Parental Tasks',
            'school': 'Invisible Parental Tasks'
          };
          
          let category = 'Visible Household Tasks'; // Default
          for (const [keyword, mappedCategory] of Object.entries(categoryMap)) {
            if (title.toLowerCase().includes(keyword) || description.toLowerCase().includes(keyword)) {
              category = mappedCategory;
              break;
            }
          }
          
          // Determine who to assign to based on balance data
          const assignTo = (tasks.length === 0 || tasks.length === 1) ? 
            (balanceData.overallBalance.mama > balanceData.overallBalance.papa ? 'Papa' : 'Mama') : 
            (balanceData.overallBalance.mama > balanceData.overallBalance.papa ? 'Mama' : 'Papa');
          
          // Create subtasks by identifying bullet points or numbered lists in the description
          const subtasksMatch = description.match(/[\n\r][-*•].*|[\n\r]\d+\..*/g);
          const subtasks = subtasksMatch ? 
            subtasksMatch.map((st, index) => ({
              id: `${weekNumber}-${tasks.length+1}-${index+1}`,
              title: st.replace(/^[\n\r][-*•\d.]+\s*/, '').trim(),
              description: '',
              completed: false,
              completedDate: null
            })) : 
            [
              {
                id: `${weekNumber}-${tasks.length+1}-1`,
                title: "Plan the task",
                description: "Determine specific steps needed",
                completed: false,
                completedDate: null
              },
              {
                id: `${weekNumber}-${tasks.length+1}-2`,
                title: "Execute the plan",
                description: "Carry out the planned steps",
                completed: false,
                completedDate: null
              },
              {
                id: `${weekNumber}-${tasks.length+1}-3`,
                title: "Follow up",
                description: "Ensure all aspects are completed",
                completed: false,
                completedDate: null
              }
            ];
          
          // Extract any AI insight/explanation
          let aiInsight = '';
          if (i < sections.length - 1) {
            const nextSection = sections[i+1];
            if (nextSection.toLowerCase().includes('this task') || 
                nextSection.toLowerCase().includes('this will help') ||
                nextSection.toLowerCase().includes('this addresses')) {
              aiInsight = nextSection.trim();
            }
          }
          
          tasks.push({
            id: `${weekNumber}-${tasks.length+1}`,
            title,
            description,
            assignedTo: assignTo,
            assignedToName: assignTo,
            category,
            priority: tasks.length === 0 ? "High" : "Medium",
            completed: false,
            completedDate: null,
            comments: [],
            aiInsight,
            subTasks: subtasks
          });
        }
      }
      
      // If we couldn't parse enough tasks, fill with simulated ones
      if (tasks.length < 3) {
        const simulatedTasks = this.simulateTaskRecommendations(familyData, balanceData, weekNumber);
        while (tasks.length < 3) {
          tasks.push(simulatedTasks[tasks.length]);
        }
      }
      
      return tasks;
    } catch (error) {
      console.error("Error parsing Claude task response:", error);
      return this.simulateTaskRecommendations(familyData, balanceData, weekNumber);
    }
  }
  
  /**
   * Generate family meeting agenda
   * @param {Object} familyData Family data
   * @param {number} weekNumber Current week number 
   * @returns {Promise<Object>} AI-generated meeting agenda
   */
  async generateMeetingAgenda(familyData, weekNumber) {
    // Generate prompt
    const systemPrompt = this.generateMeetingAgendaPrompt(familyData, weekNumber);
    
    // User prompt asking for a meeting agenda
    const userPrompt = `Create a detailed family meeting agenda for Week ${weekNumber} with specific discussion topics, a suggested date, and time allocations.`;
    
    // Call Claude API
    const response = await this.callClaudeAPI(systemPrompt, userPrompt);
    
    // If API call failed, use simulated agenda
    if (!response) {
      return this.simulateMeetingAgenda(familyData, weekNumber);
    }
    
    // Process response to extract agenda
    try {
      // Start with some defaults
      const agenda = {
        weekNumber,
        suggestedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        suggestedDuration: "30 minutes",
        sections: []
      };
      
      // Parse date and duration if provided
      const dateMatch = response.match(/date:?\s*([^,\n]*)/i);
      if (dateMatch) agenda.suggestedDate = dateMatch[1].trim();
      
      const durationMatch = response.match(/duration:?\s*([^,\n]*)/i);
      if (durationMatch) agenda.suggestedDuration = durationMatch[1].trim();
      
      // Split into sections by headers
      const sections = response.split(/\n\s*#+\s*|\n\s*\d+\.\s*/);
      
      for (let i = 1; i < sections.length; i++) {  // Start from 1 to skip intro
        const section = sections[i].trim();
        if (!section) continue;
        
        // Extract section title
        const titleMatch = section.match(/^([^(\n:]+)(?:\s*\(([^)]+)\))?[:]/);
        if (!titleMatch) continue;
        
        const title = titleMatch[1].trim();
        const duration = titleMatch[2] || "5-10 minutes";  // Default if not provided
        
        // Extract description and details
        const content = section.substring(titleMatch[0].length).trim();
        const paragraphs = content.split(/\n\s*\n/);
        
        const description = paragraphs[0].trim();
        
        // Look for bullet points for details
        const detailsMatch = content.match(/[\n\r][-*•].*|[\n\r]\d+\..*/g);
        const details = detailsMatch ? 
          detailsMatch.map(d => d.replace(/^[\n\r][-*•\d.]+\s*/, '').trim()) : 
          paragraphs.slice(1).map(p => p.trim()).filter(p => p);
        
        agenda.sections.push({
          title,
          duration,
          description,
          details: details.length > 0 ? details : [
            "Discuss progress made in this area",
            "Share perspectives from each family member",
            "Identify next steps or improvements"
          ]
        });
        
        // Limit to 4 sections
        if (agenda.sections.length >= 4) break;
      }
      
      // Ensure we have at least 2 sections
      if (agenda.sections.length < 2) {
        const fallbackAgenda = this.simulateMeetingAgenda(familyData, weekNumber);
        while (agenda.sections.length < 2) {
          agenda.sections.push(fallbackAgenda.sections[agenda.sections.length]);
        }
      }
      
      return agenda;
    } catch (error) {
      console.error("Error parsing Claude meeting agenda response:", error);
      return this.simulateMeetingAgenda(familyData, weekNumber);
    }
  }
  
  /**
   * Get AI response for chat
   * @param {string} text User message
   * @param {Object} familyData Family context data
   * @param {Array} chatHistory Previous messages
   * @returns {Promise<string>} AI response
   */
  async getChatResponse(text, familyData, chatHistory) {
    // Generate system prompt
    const systemPrompt = this.generateChatSystemPrompt(familyData);
    
    // Format previous messages for context
    const formattedHistory = chatHistory.map(msg => ({
      role: msg.sender === 'allie' ? 'assistant' : 'user',
      content: msg.text
    })).slice(-10); // Last 10 messages
    
    // Call Claude API
    const response = await this.callClaudeAPI(systemPrompt, text, formattedHistory);
    
    // If API call failed, use simulated response
    if (!response) {
      return this.simulateChatResponse(text, familyData);
    }
    
    return response;
  }
  
  // System prompt generators
  
  /**
   * Generate system prompt for family insights
   */
  generateFamilySystemPrompt(familyId, familyInfo, historyData) {
    return `
You are Allie, an AI designed to analyze family workload balance and provide insights and recommendations.

## Family Information
Family Name: ${familyInfo.familyName || 'Family'}
Parents: ${familyInfo.parents?.map(p => `${p.name} (${p.roleType})`).join(', ') || 'Mama and Papa'}
Children: ${familyInfo.children?.map(c => `${c.name} (${c.age || 'age unknown'})`).join(', ') || 'None'}
Current Week: ${historyData.currentWeek || 1}
Family Priorities: ${JSON.stringify(familyInfo.priorities || {})}

## Survey Results
Overall Balance: Mama: ${Math.round(familyInfo.balance.mama)}%, Papa: ${Math.round(familyInfo.balance.papa)}%

Category Distribution:
${Object.entries(familyInfo.categoryBalance || {}).map(([category, balance]) => 
  `- ${category}: Mama: ${Math.round(balance.mama || 0)}%, Papa: ${Math.round(balance.papa || 0)}%`
).join('\n')}

## Task History
Completed Tasks: ${historyData.completedTasks?.map(t => t.title).join(', ') || 'None yet'}
Task Effectiveness: ${JSON.stringify(historyData.taskEffectiveness || {})}

## Relationship Data
Satisfaction Trend: ${historyData.relationshipData?.satisfactionTrend || 'Not enough data'}
Communication Quality: ${historyData.relationshipData?.communicationQuality || 'Not enough data'}

## Your Tasks
1. Identify the most significant imbalances in this family's workload distribution
2. Generate 3-4 specific insights about their workload balance
3. Provide thoughtful analysis of balance patterns and potential impacts
4. Consider the family's history and priorities

Your analysis should incorporate the following considerations:
- Tasks with high invisibility factors (1.35x-1.5x) are often overlooked but create significant mental load
- Tasks with high emotional labor (1.3x-1.4x) create disproportionate stress
- Tasks impacting child development (1.15x-1.25x) have long-term importance
- Tasks that align with family priorities should be weighted accordingly (1.1x-1.5x)
`;
  }
  
  /**
   * Generate system prompt for task recommendations
   */
  generateTaskRecommendationPrompt(familyData, balanceData, previousTasks, weekNumber) {
    return `
You are Allie, an AI designed to generate personalized task recommendations to help families achieve better workload balance.

## Family Information
Family Name: ${familyData.familyName || 'Family'}
Current Week: ${weekNumber}
Balance: Mama: ${Math.round(balanceData.overallBalance.mama)}%, Papa: ${Math.round(balanceData.overallBalance.papa)}%

## Category Balance
${Object.entries(balanceData.categoryBalance || {}).map(([category, imbalance]) => 
  `- ${category}: ${imbalance.toFixed(2)} imbalance score`
).join('\n')}

## Previous Tasks
${previousTasks.map(task => 
  `- ${task.title} (${task.completed ? 'Completed' : 'Incomplete'}) - Assigned to: ${task.assignedTo}`
).join('\n')}

## Your Task
Generate 3 balanced, effective tasks for Week ${weekNumber} that will help this family achieve better balance:

1. Create tasks that address the most imbalanced areas first
2. Task 1 and 2 should typically be assigned to the parent handling fewer tasks (${balanceData.overallBalance.mama > balanceData.overallBalance.papa ? 'Papa' : 'Mama'})
3. Task 3 can be assigned to the other parent
4. Include a title, clear description, and 2-3 subtasks for each task
5. For each task, explain how it addresses the family's balance needs

Each task should fit into one of these categories:
- Visible Household Tasks (cleaning, cooking, repairs)
- Invisible Household Tasks (planning, scheduling, finances)
- Visible Parental Tasks (direct childcare, activities with children)
- Invisible Parental Tasks (emotional support, educational planning)
`;
  }
  
  /**
   * Generate system prompt for meeting agenda
   */
  generateMeetingAgendaPrompt(familyData, weekNumber) {
    return `
You are Allie, an AI designed to facilitate productive family meetings about workload balance.

## Family Information
Family Name: ${familyData?.familyName || 'Family'}
Current Week: ${weekNumber}
Balance: Mama: ${Math.round(familyData?.balance?.mama || 50)}%, Papa: ${Math.round(familyData?.balance?.papa || 50)}%

## Meeting Context
The family is in Week ${weekNumber} of their balance journey. They need a structured agenda for their family meeting to discuss progress, challenges, and next steps in balancing parental responsibilities.

The family has completed ${familyData?.tasks?.filter(t => t.completed)?.length || 0} tasks this week out of ${familyData?.tasks?.length || 0} assigned tasks.

## Your Task
Create a structured family meeting agenda that includes:
1. A suggested date and duration for the meeting
2. 3-4 main sections with specific discussion topics
3. Time allocations for each section (30 minutes total)
4. Bullet points of specific talking points for each section
5. A clear focus on workload balance improvement

Include these standard sections:
- Review of completed tasks and survey data
- Celebration of wins and improvements
- Discussion of challenges and obstacles
- Setting goals for the coming week
`;
  }
  
  /**
   * Generate system prompt for chat
   */
  generateChatSystemPrompt(familyData) {
    return `
You are Allie, an AI coach helping families balance responsibilities. 
  
Family Name: ${familyData?.familyName || 'Family'}
Family Members: ${JSON.stringify(familyData?.familyMembers || [])}
Current Week: ${familyData?.currentWeek || 1}

Provide personalized advice based on this family's data. Be supportive, practical, and focus on balanced workload distribution. Keep your answers concise but warm and helpful. You specialize in understanding both visible tasks (like cleaning) and invisible labor (like planning and emotional work).
`;
  }
  
  // Fallback simulation methods (used if API calls fail)
  
  /**
   * Simulate AI-generated insights
   */
  simulateInsights(familyData) {
    return {
      insights: [
        {
          title: "Invisible Task Imbalance",
          content: "There's a significant imbalance in invisible household tasks, with Mama handling 72% of these responsibilities. This creates mental load disparity.",
          type: "challenge",
          recommendation: "Focus on redistributing meal planning and appointment scheduling to create better balance."
        },
        {
          title: "Child Development Impact",
          content: "Tasks visible to children currently show a 65/35 split. This impacts how children view gender roles and future expectations.",
          type: "insight",
          recommendation: "Having Papa handle more visible childcare tasks can positively shape children's perceptions."
        },
        {
          title: "Emotional Labor Distribution",
          content: "High emotional labor tasks (comforting children, managing family conflicts) are currently 70% handled by Mama.",
          type: "insight",
          recommendation: "Balancing emotional support responsibilities can reduce stress and improve relationship satisfaction."
        }
      ]
    };
  }
  
  // Include other simulation methods from previous code for fallback...
  simulateTaskRecommendations(familyData, balanceData, weekNumber) {
    // Same implementation as before
    return [
      {
        id: `${weekNumber}-1`,
        title: `Week ${weekNumber}: Childcare Morning Routine`,
        description: "Take the lead on children's morning routine this week, including breakfast preparation, getting dressed, and school preparation.",
        assignedTo: "Papa",
        assignedToName: "Papa",
        category: "Visible Parental Tasks",
        priority: "High",
        completed: false,
        completedDate: null,
        comments: [],
        aiInsight: "This task addresses the visible parental task imbalance and helps children see both parents in caregiving roles.",
        subTasks: [
          {
            id: `${weekNumber}-1-1`,
            title: "Breakfast preparation",
            description: "Prepare and serve breakfast for the children",
            completed: false,
            completedDate: null
          },
          {
            id: `${weekNumber}-1-2`,
            title: "Morning hygiene routine",
            description: "Help with teeth brushing and getting dressed",
            completed: false,
            completedDate: null
          },
          {
            id: `${weekNumber}-1-3`,
            title: "School/daycare preparation",
            description: "Ensure backpacks are packed and ready",
            completed: false,
            completedDate: null
          }
        ]
      },
      // Rest of the simulated tasks
      {
        id: `${weekNumber}-2`,
        title: `Week ${weekNumber}: Weekly Meal Planning`,
        description: "Take charge of planning meals for the upcoming week, creating a shopping list, and coordinating food preparation.",
        assignedTo: "Papa",
        assignedToName: "Papa",
        category: "Invisible Household Tasks",
        priority: "Medium",
        completed: false,
        completedDate: null,
        comments: [],
        aiInsight: "Meal planning is a high mental load task that's often invisible. This helps balance the 72% imbalance in invisible household tasks.",
        subTasks: [
          {
            id: `${weekNumber}-2-1`,
            title: "Create weekly menu",
            description: "Plan meals for each day of the week",
            completed: false,
            completedDate: null
          },
          {
            id: `${weekNumber}-2-2`,
            title: "Make shopping list",
            description: "List all ingredients needed for the menu",
            completed: false,
            completedDate: null
          },
          {
            id: `${weekNumber}-2-3`,
            title: "Coordinate food preparation",
            description: "Plan who will cook which meals and when",
            completed: false,
            completedDate: null
          }
        ]
      },
      {
        id: `${weekNumber}-3`,
        title: `Week ${weekNumber}: Home Maintenance Task`,
        description: "Handle a home maintenance task that Mama usually manages, such as changing filters, light bulbs, or basic repairs.",
        assignedTo: "Mama",
        assignedToName: "Mama",
        category: "Visible Household Tasks",
        priority: "Medium",
        completed: false,
        completedDate: null,
        comments: [],
        aiInsight: "This task helps maintain balance by recognizing that some visible household tasks are handled primarily by Papa.",
        subTasks: [
          {
            id: `${weekNumber}-3-1`,
            title: "Identify maintenance needs",
            description: "Make a list of current home maintenance requirements",
            completed: false,
            completedDate: null
          },
          {
            id: `${weekNumber}-3-2`,
            title: "Gather necessary supplies",
            description: "Purchase or locate required tools and materials",
            completed: false,
            completedDate: null
          },
          {
            id: `${weekNumber}-3-3`,
            title: "Complete maintenance tasks",
            description: "Handle the identified maintenance needs",
            completed: false,
            completedDate: null
          }
        ]
      }
    ];
  }
  
  simulateMeetingAgenda(familyData, weekNumber) {
    // Same implementation as before
    return {
      weekNumber,
      suggestedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      suggestedDuration: "30 minutes",
      sections: [
        {
          title: "Review Progress",
          duration: "10 minutes",
          description: "Discuss task completion and survey responses",
          details: [
            "Review completed tasks and any challenges with incomplete tasks",
            "Discuss survey responses from family members",
            "Examine balance metrics for Week " + weekNumber
          ]
        },
        {
          title: "Celebrate Wins",
          duration: "5 minutes",
          description: "Recognize improvements and efforts",
          details: [
            "Acknowledge completed tasks and effort in balancing responsibilities",
            "Celebrate any improved balance metrics",
            "Recognize positive changes in family dynamics"
          ]
        },
        {
          title: "Address Challenges",
          duration: "10 minutes",
          description: "Discuss obstacles and find solutions",
          details: [
            "Identify ongoing imbalance areas",
            "Brainstorm solutions for difficult tasks",
            "Address any communication issues"
          ]
        },
        {
          title: "Set Next Week's Goals",
          duration: "5 minutes",
          description: "Agree on focus areas for the coming week",
          details: [
            "Set specific goals for Week " + (weekNumber + 1),
            "Assign new rebalancing tasks",
            "Schedule next family meeting"
          ]
        }
      ]
    };
  }
  
  simulateChatResponse(text, familyData) {
    if (text.toLowerCase().includes("why") && text.toLowerCase().includes("allie")) {
      return "Allie was created to help families balance responsibilities more fairly. Our mission is to reduce relationship strain and create healthier, happier families through better workload balance.";
    } else if (text.toLowerCase().includes("how") && text.toLowerCase().includes("use")) {
      return "To get the most out of Allie, start with the initial survey for all family members. Then use the weekly check-ins to track progress. The dashboard shows your family's balance data, and our AI provides personalized recommendations for improvement.";
    } else if (text.toLowerCase().includes("survey")) {
      return "Your family's survey results help us understand your unique situation. Based on responses so far, I can see areas where you might want to focus on balancing workload. Would you like specific insights about a particular category of tasks?";
    } else {
      return "I'm here to help your family achieve better balance! I can answer questions about how to use the app, provide insights from your survey data, or offer research-backed parenting advice. What would you like to know more about?";
    }
  }
}

export default new AIService();