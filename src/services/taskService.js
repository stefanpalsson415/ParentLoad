// src/services/taskService.js
import { 
    doc, getDoc, updateDoc, arrayUnion, serverTimestamp 
  } from 'firebase/firestore';
  import { db } from './firebase';
  import { createError, ErrorCodes, logError } from '../utils/errorHandling';
  
  /**
   * Get all tasks for a family
   * @param {string} familyId Family ID
   * @returns {Promise<Array>} Array of tasks
   */
  export async function getTasks(familyId) {
    try {
      if (!familyId) {
        throw createError(ErrorCodes.DATA_INVALID, "Family ID is required");
      }
      
      const docRef = doc(db, "families", familyId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data().tasks || [];
      } else {
        throw createError(ErrorCodes.FAMILY_NOT_FOUND, "Family not found");
      }
    } catch (error) {
      logError("getTasks", error);
      throw error;
    }
  }
  
  /**
   * Update task completion status
   * @param {string} familyId Family ID
   * @param {string} taskId Task ID
   * @param {boolean} isCompleted Whether the task is completed
   * @param {string} completedDate ISO date string of completion
   * @returns {Promise<boolean>} Success status
   */
  export async function updateTaskCompletion(familyId, taskId, isCompleted, completedDate = null) {
    try {
      if (!familyId || !taskId) {
        throw createError(ErrorCodes.DATA_INVALID, "Missing required parameters");
      }
      
      const docRef = doc(db, "families", familyId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw createError(ErrorCodes.FAMILY_NOT_FOUND, "Family not found");
      }
      
      const familyData = docSnap.data();
      
      // Find and update the task
      const updatedTasks = (familyData.tasks || []).map(task => {
        if (task.id.toString() === taskId.toString()) {
          return {
            ...task,
            completed: isCompleted,
            completedDate: isCompleted ? (completedDate || new Date().toISOString()) : null
          };
        }
        return task;
      });
      
      // Update the family document
      await updateDoc(docRef, {
        tasks: updatedTasks,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      logError("updateTaskCompletion", error);
      throw error;
    }
  }
  
  /**
   * Update subtask completion status
   * @param {string} familyId Family ID
   * @param {string} taskId Parent task ID
   * @param {string} subtaskId Subtask ID
   * @param {boolean} isCompleted Whether the subtask is completed
   * @param {string} completedDate ISO date string of completion
   * @returns {Promise<boolean>} Success status
   */
  export async function updateSubtaskCompletion(familyId, taskId, subtaskId, isCompleted, completedDate = null) {
    try {
      if (!familyId || !taskId || !subtaskId) {
        throw createError(ErrorCodes.DATA_INVALID, "Missing required parameters");
      }
      
      const docRef = doc(db, "families", familyId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw createError(ErrorCodes.FAMILY_NOT_FOUND, "Family not found");
      }
      
      const familyData = docSnap.data();
      
      // Find the task and update the subtask
      const updatedTasks = (familyData.tasks || []).map(task => {
        if (task.id.toString() === taskId.toString()) {
          // Update the subtask
          const updatedSubtasks = (task.subTasks || []).map(subtask => {
            if (subtask.id === subtaskId) {
              return {
                ...subtask,
                completed: isCompleted,
                completedDate: isCompleted ? (completedDate || new Date().toISOString()) : null
              };
            }
            return subtask;
          });
          
          // Check if all subtasks are completed
          const allSubtasksComplete = updatedSubtasks.every(st => st.completed);
          
          // Update the main task if all subtasks are complete
          return {
            ...task,
            subTasks: updatedSubtasks,
            completed: allSubtasksComplete,
            completedDate: allSubtasksComplete ? new Date().toISOString() : null
          };
        }
        return task;
      });
      
      // Update the family document
      await updateDoc(docRef, {
        tasks: updatedTasks,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      logError("updateSubtaskCompletion", error);
      throw error;
    }
  }
  
  /**
   * Add a comment to a task
   * @param {string} familyId Family ID
   * @param {string} taskId Task ID
   * @param {string} userId User ID who is commenting
   * @param {string} userName Name of the user commenting
   * @param {string} text Comment text
   * @returns {Promise<Object>} Created comment
   */
  export async function addTaskComment(familyId, taskId, userId, userName, text) {
    try {
      if (!familyId || !taskId || !userId || !text) {
        throw createError(ErrorCodes.DATA_INVALID, "Missing required parameters");
      }
      
      const docRef = doc(db, "families", familyId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw createError(ErrorCodes.FAMILY_NOT_FOUND, "Family not found");
      }
      
      const familyData = docSnap.data();
      
      // Create the comment object
      const comment = {
        id: Date.now().toString(),
        userId,
        userName,
        text,
        timestamp: new Date().toISOString()
      };
      
      // Find the task and add the comment
      const updatedTasks = (familyData.tasks || []).map(task => {
        if (task.id.toString() === taskId.toString()) {
          return {
            ...task,
            comments: [...(task.comments || []), comment]
          };
        }
        return task;
      });
      
      // Update the family document
      await updateDoc(docRef, {
        tasks: updatedTasks,
        updatedAt: serverTimestamp()
      });
      
      return comment;
    } catch (error) {
      logError("addTaskComment", error);
      throw error;
    }
  }
  
  /**
   * Generate tasks based on survey results
   * @param {number} weekNumber Current week number
   * @param {Array} previousTasks Previously completed tasks
   * @param {Object} surveyResponses Survey responses
   * @returns {Array} Generated tasks
   */
  export function generateTasks(weekNumber, previousTasks = [], surveyResponses = {}) {
    // Analyze survey responses to determine imbalances
    const mamaResponses = Object.values(surveyResponses).filter(v => v === 'Mama').length;
    const papaResponses = Object.values(surveyResponses).filter(v => v === 'Papa').length;
    const totalResponses = mamaResponses + papaResponses;
    
    // Calculate basic balance percentages
    const mamaPercentage = totalResponses ? (mamaResponses / totalResponses) * 100 : 50;
    const papaPercentage = totalResponses ? (papaResponses / totalResponses) * 100 : 50;
    
    // Determine which categories have the biggest imbalances
    const categoryImbalances = analyzeCategoryImbalances(surveyResponses);
    
    // Default role assignment will be to the parent doing fewer tasks
    const defaultAssignee = mamaPercentage > papaPercentage ? "Papa" : "Mama";
    const otherAssignee = defaultAssignee === "Mama" ? "Papa" : "Mama";
    
    // Task template library based on categories
    const taskTemplates = {
      "Visible Household Tasks": [
        {
          title: "Deep Clean Common Areas",
          description: "Take charge of thoroughly cleaning one common living area this week",
          category: "Visible Household Tasks",
          subTasks: [
            { title: "Dust all surfaces", description: "Including shelves, tables, and electronics" },
            { title: "Vacuum or mop floors", description: "Make sure to get under furniture" },
            { title: "Clean windows/mirrors", description: "Use appropriate glass cleaner" }
          ]
        },
        {
          title: "Laundry Management",
          description: "Manage the family's laundry from start to finish this week",
          category: "Visible Household Tasks",
          subTasks: [
            { title: "Gather and sort laundry", description: "Separate by color and fabric type" },
            { title: "Wash and dry clothes", description: "Follow care instructions for each load" },
            { title: "Fold and put away", description: "Return all items to their proper places" }
          ]
        }
      ],
      "Invisible Household Tasks": [
        {
          title: "Meal Planning",
          description: "Take charge of planning meals for the upcoming week",
          category: "Invisible Household Tasks",
          subTasks: [
            { title: "Create weekly menu", description: "Plan meals for each day of the week" },
            { title: "Make shopping list", description: "List all ingredients needed for the menu" },
            { title: "Check pantry inventory", description: "Note what items you already have" }
          ]
        },
        {
          title: "Budget Review",
          description: "Review and manage family finances this week",
          category: "Invisible Household Tasks",
          subTasks: [
            { title: "Review recent expenses", description: "Identify any unusual spending" },
            { title: "Update budget spreadsheet", description: "Ensure all transactions are recorded" },
            { title: "Plan for upcoming expenses", description: "Note any bills or purchases needed" }
          ]
        }
      ],
      "Visible Parental Tasks": [
        {
          title: "Bedtime Routine",
          description: "Take the lead on children's bedtime routine this week",
          category: "Visible Parental Tasks",
          subTasks: [
            { title: "Bath time", description: "Supervise and assist with bath time" },
            { title: "Bedtime stories", description: "Read bedtime stories" },
            { title: "Teeth brushing", description: "Ensure proper dental care" }
          ]
        },
        {
          title: "Weekend Activity Planning",
          description: "Plan and lead a family activity this weekend",
          category: "Visible Parental Tasks",
          subTasks: [
            { title: "Research options", description: "Find age-appropriate activities" },
            { title: "Prepare necessary items", description: "Gather supplies or pack bags" },
            { title: "Lead the activity", description: "Take charge during the activity" }
          ]
        }
      ],
      "Invisible Parental Tasks": [
        {
          title: "School Communication",
          description: "Manage school-related communications this week",
          category: "Invisible Parental Tasks",
          subTasks: [
            { title: "Check school emails/notices", description: "Review all communications" },
            { title: "Respond to requests", description: "Complete forms or reply to messages" },
            { title: "Update family calendar", description: "Note important dates and events" }
          ]
        },
        {
          title: "Gift Planning",
          description: "Take charge of upcoming gift needs (birthdays, holidays)",
          category: "Invisible Parental Tasks",
          subTasks: [
            { title: "Create gift list", description: "Note upcoming occasions and gift ideas" },
            { title: "Research gift options", description: "Find appropriate gifts within budget" },
            { title: "Track gift inventory", description: "Note what you already have on hand" }
          ]
        }
      ]
    };
    
    // Select tasks based on imbalances - prioritize the most imbalanced categories
    const sortedCategories = Object.keys(categoryImbalances).sort(
      (a, b) => categoryImbalances[b] - categoryImbalances[a]
    );
    
    // Prepare the task list - 2 tasks for the parent doing less, 1 for the other
    const tasks = [];
    
    // Add 2 tasks for the parent doing fewer tasks overall
    for (let i = 0; i < 2; i++) {
      if (sortedCategories[i]) {
        const category = sortedCategories[i];
        const templates = taskTemplates[category];
        
        if (templates && templates.length > 0) {
          // Pick a template (randomly or based on previous tasks)
          const templateIndex = Math.floor(Math.random() * templates.length);
          const template = templates[templateIndex];
          
          // Create the task
          tasks.push({
            id: `${weekNumber}-${i+1}`,
            title: `Week ${weekNumber}: ${template.title}`,
            description: template.description,
            assignedTo: defaultAssignee,
            assignedToName: defaultAssignee,
            category: template.category,
            priority: i === 0 ? "High" : "Medium", // First task is high priority
            completed: false,
            completedDate: null,
            comments: [],
            subTasks: template.subTasks.map((st, stIndex) => ({
              id: `${weekNumber}-${i+1}-${stIndex+1}`,
              title: st.title,
              description: st.description,
              completed: false,
              completedDate: null
            }))
          });
        }
      }
    }
    
    // Add 1 task for the other parent (in a category they handle more)
    // Find a category where the other parent has higher percentage
    const otherParentCategory = findCategoryForOtherParent(categoryImbalances, defaultAssignee);
    
    if (otherParentCategory && taskTemplates[otherParentCategory]) {
      const templates = taskTemplates[otherParentCategory];
      const templateIndex = Math.floor(Math.random() * templates.length);
      const template = templates[templateIndex];
      
      tasks.push({
        id: `${weekNumber}-3`,
        title: `Week ${weekNumber}: ${template.title}`,
        description: template.description,
        assignedTo: otherAssignee,
        assignedToName: otherAssignee,
        category: template.category,
        priority: "Medium",
        completed: false,
        completedDate: null,
        comments: [],
        subTasks: template.subTasks.map((st, stIndex) => ({
          id: `${weekNumber}-3-${stIndex+1}`,
          title: st.title,
          description: st.description,
          completed: false,
          completedDate: null
        }))
      });
    }
    
    return tasks;
  }
  
  // Helper function to analyze imbalances by category
  function analyzeCategoryImbalances(surveyResponses) {
    const categories = {
      "Visible Household Tasks": { mama: 0, papa: 0 },
      "Invisible Household Tasks": { mama: 0, papa: 0 },
      "Visible Parental Tasks": { mama: 0, papa: 0 },
      "Invisible Parental Tasks": { mama: 0, papa: 0 }
    };
    
    // Count responses by category
    Object.entries(surveyResponses).forEach(([key, value]) => {
      // Check if the key includes a category identifier (you might need to adjust this logic)
      // For example, if your keys have category info embedded
      const categoryKey = getCategoryFromResponseKey(key);
      
      if (categories[categoryKey]) {
        if (value === 'Mama') {
          categories[categoryKey].mama++;
        } else if (value === 'Papa') {
          categories[categoryKey].papa++;
        }
      }
    });
    
    // Calculate imbalance for each category
    const imbalances = {};
    Object.entries(categories).forEach(([category, counts]) => {
      const total = counts.mama + counts.papa;
      if (total > 0) {
        // Calculate how far from 50/50 this category is
        imbalances[category] = Math.abs((counts.mama / total) - 0.5);
      } else {
        imbalances[category] = 0;
      }
    });
    
    return imbalances;
  }
  
  // Helper to determine category from response key
  function getCategoryFromResponseKey(key) {
    // This is a simplified example - you might need to adjust based on your actual data structure
    if (key.includes('visible') && key.includes('household')) {
      return "Visible Household Tasks";
    } else if (key.includes('invisible') && key.includes('household')) {
      return "Invisible Household Tasks";
    } else if (key.includes('visible') && key.includes('parental')) {
      return "Visible Parental Tasks";
    } else if (key.includes('invisible') && key.includes('parental')) {
      return "Invisible Parental Tasks";
    }
    
    // Default to a random category if we can't determine
    const allCategories = ["Visible Household Tasks", "Invisible Household Tasks", 
                          "Visible Parental Tasks", "Invisible Parental Tasks"];
    return allCategories[Math.floor(Math.random() * allCategories.length)];
  }
  
  // Helper to find a category where the other parent has higher percentage
  function findCategoryForOtherParent(imbalances, defaultAssignee) {
    // This is simplified logic - in a real implementation, we would look at 
    // which categories each parent handles more
    const categories = Object.keys(imbalances);
    return categories[Math.floor(Math.random() * categories.length)];
  }
  
  /**
   * Save family meeting notes
   * @param {string} familyId Family ID
   * @param {number} weekNumber Week number
   * @param {Object} notes Meeting notes
   * @returns {Promise<boolean>} Success status
   */
  export async function saveFamilyMeetingNotes(familyId, weekNumber, notes) {
    try {
      if (!familyId || !weekNumber) {
        throw createError(ErrorCodes.DATA_INVALID, "Missing required parameters");
      }
      
      const docRef = doc(db, "familyMeetings", `${familyId}-week${weekNumber}`);
      
      await setDoc(docRef, {
        familyId,
        weekNumber,
        notes,
        completedAt: serverTimestamp()
      });
      
      // Also update the week status to indicate the meeting is complete
      const familyDocRef = doc(db, "families", familyId);
      const familyDoc = await getDoc(familyDocRef);
      
      if (familyDoc.exists()) {
        const weekStatus = familyDoc.data().weekStatus || {};
        
        await updateDoc(familyDocRef, {
          [`weekStatus.${weekNumber}.meetingNotesCompleted`]: true,
          [`weekStatus.${weekNumber}.meetingNotesDate`]: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      return true;
    } catch (error) {
      logError("saveFamilyMeetingNotes", error);
      throw error;
    }
  }

  /**
 * Track task effectiveness
 * @param {string} familyId Family ID
 * @param {string} taskId Task ID
 * @param {number} effectivenessScore Score from 1-10
 * @param {string} feedback Optional feedback text
 * @returns {Promise<boolean>} Success status
 */
export async function trackTaskEffectiveness(familyId, taskId, effectivenessScore, feedback = '') {
  try {
    if (!familyId || !taskId) {
      throw createError(ErrorCodes.DATA_INVALID, "Missing required parameters");
    }
    
    const docRef = doc(db, "taskEffectiveness", `${familyId}-${taskId}`);
    
    await setDoc(docRef, {
      familyId,
      taskId,
      effectivenessScore,
      feedback,
      recordedAt: serverTimestamp()
    });
    
    // Also update the family document to track overall effectiveness data
    const familyDocRef = doc(db, "families", familyId);
    const familyDoc = await getDoc(familyDocRef);
    
    if (familyDoc.exists()) {
      // Get the task details first
      const familyData = familyDoc.data();
      const task = familyData.tasks?.find(t => t.id === taskId);
      
      if (task) {
        // Update effectiveness data
        await updateDoc(familyDocRef, {
          taskEffectiveness: arrayUnion({
            taskId,
            category: task.category,
            title: task.title,
            effectivenessScore,
            date: serverTimestamp()
          }),
          updatedAt: serverTimestamp()
        });
      }
    }
    
    return true;
  } catch (error) {
    logError("trackTaskEffectiveness", error);
    throw error;
  }
}