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
    // This would be where our AI or algorithm would generate personalized tasks
    // based on the survey responses and family's history
    
    // For now, return some sample tasks
    return [
      {
        id: `${weekNumber}-1`,
        title: `Week ${weekNumber}: Meal Planning`,
        description: "Take charge of planning meals for the upcoming week",
        assignedTo: "Papa", // This would normally be determined by the algorithm
        assignedToName: "Papa",
        category: "Invisible Household Tasks",
        completed: false,
        completedDate: null,
        comments: [],
        subTasks: [
          {
            id: `${weekNumber}-1-1`,
            title: "Create weekly menu",
            description: "Plan meals for each day of the week",
            completed: false,
            completedDate: null
          },
          {
            id: `${weekNumber}-1-2`,
            title: "Make shopping list",
            description: "List all ingredients needed for the menu",
            completed: false,
            completedDate: null
          }
        ]
      },
      {
        id: `${weekNumber}-2`,
        title: `Week ${weekNumber}: Bedtime Routine`,
        description: "Take the lead on children's bedtime routine",
        assignedTo: "Mama",
        assignedToName: "Mama",
        category: "Visible Parental Tasks",
        completed: false,
        completedDate: null,
        comments: [],
        subTasks: [
          {
            id: `${weekNumber}-2-1`,
            title: "Bath time",
            description: "Supervise and assist with bath time",
            completed: false,
            completedDate: null
          },
          {
            id: `${weekNumber}-2-2`,
            title: "Bedtime stories",
            description: "Read bedtime stories",
            completed: false,
            completedDate: null
          }
        ]
      }
    ];
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