// src/services/surveyService.js
import { 
    doc, getDoc, setDoc, collection, 
    query, where, getDocs, serverTimestamp 
  } from 'firebase/firestore';
  import { db } from './firebase';
  import { createError, ErrorCodes, logError } from '../utils/errorHandling';
  
  /**
   * Save survey responses for a family member
   * @param {string} familyId Family ID
   * @param {string} memberId Member ID
   * @param {string} surveyType Type of survey (initial, weekly, etc.)
   * @param {Object} responses Survey question responses
   * @returns {Promise<boolean>} Success status
   */
  export async function saveSurveyResponses(familyId, memberId, surveyType, responses) {
    try {
      if (!familyId || !memberId || !surveyType) {
        throw createError(ErrorCodes.DATA_INVALID, "Missing required parameters");
      }
      
      const docRef = doc(db, "surveyResponses", `${familyId}-${memberId}-${surveyType}`);
      
      await setDoc(docRef, {
        familyId,
        memberId,
        surveyType,
        responses,
        completedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      logError("saveSurveyResponses", error);
      throw error;
    }
  }
  
  /**
   * Load survey responses for a family member
   * @param {string} familyId Family ID
   * @param {string} memberId Member ID
   * @param {string} surveyType Type of survey (initial, weekly, etc.)
   * @returns {Promise<Object>} Survey responses
   */
  export async function loadSurveyResponses(familyId, memberId, surveyType) {
    try {
      if (!familyId || !memberId || !surveyType) {
        throw createError(ErrorCodes.DATA_INVALID, "Missing required parameters");
      }
      
      const docRef = doc(db, "surveyResponses", `${familyId}-${memberId}-${surveyType}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data().responses || {};
      } else {
        return {};
      }
    } catch (error) {
      logError("loadSurveyResponses", error);
      throw error;
    }
  }
  
  /**
   * Get all survey responses for a family
   * @param {string} familyId Family ID
   * @returns {Promise<Object>} Combined survey responses
   */
  export async function getAllFamilySurveyResponses(familyId) {
    try {
      if (!familyId) {
        throw createError(ErrorCodes.DATA_INVALID, "Family ID is required");
      }
      
      const q = query(
        collection(db, "surveyResponses"), 
        where("familyId", "==", familyId)
      );
      
      const querySnapshot = await getDocs(q);
      
      const allResponses = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Merge all responses together
        if (data.responses) {
          Object.assign(allResponses, data.responses);
        }
      });
      
      return allResponses;
    } catch (error) {
      logError("getAllFamilySurveyResponses", error);
      throw error;
    }
  }
  
  /**
   * Update survey completion status for a family member
   * @param {string} familyId Family ID
   * @param {string} memberId Member ID
   * @param {string} surveyType Type of survey (initial, weekly, etc.)
   * @param {boolean} isCompleted Whether the survey is completed
   * @returns {Promise<boolean>} Success status
   */
  export async function updateSurveyCompletionStatus(familyId, memberId, surveyType, isCompleted) {
    try {
      if (!familyId || !memberId) {
        throw createError(ErrorCodes.DATA_INVALID, "Missing required parameters");
      }
      
      // Get the current family data
      const familyDocRef = doc(db, "families", familyId);
      const familyDoc = await getDoc(familyDocRef);
      
      if (!familyDoc.exists()) {
        throw createError(ErrorCodes.FAMILY_NOT_FOUND, "Family not found");
      }
      
      const familyData = familyDoc.data();
      
      // Find the member and update their completion status
      const updatedMembers = (familyData.familyMembers || []).map(member => {
        if (member.id === memberId) {
          if (surveyType === 'initial') {
            // Update initial survey completion
            return {
              ...member,
              completed: isCompleted,
              completedDate: isCompleted ? new Date().toISOString() : null
            };
          } else if (surveyType.startsWith('weekly-')) {
            // Update weekly survey completion
            const weekNumber = parseInt(surveyType.replace('weekly-', ''));
            const weeklyCompleted = [...(member.weeklyCompleted || [])];
            
            // Ensure we have entries for all weeks up to this one
            while (weeklyCompleted.length < weekNumber) {
              weeklyCompleted.push({
                completed: false,
                date: null
              });
            }
            
            // Update the specific week
            weeklyCompleted[weekNumber - 1] = {
              completed: isCompleted,
              date: isCompleted ? new Date().toISOString() : null
            };
            
            return {
              ...member,
              weeklyCompleted
            };
          }
        }
        return member;
      });
      
      // Update the family document
      await setDoc(familyDocRef, 
        { 
          familyMembers: updatedMembers,
          updatedAt: serverTimestamp()
        }, 
        { merge: true }
      );
      
      return true;
    } catch (error) {
      logError("updateSurveyCompletionStatus", error);
      throw error;
    }
  }
  
  /**
   * Generate survey questions based on the given parameters
   * @param {string} surveyType Type of survey (initial, weekly, etc.)
   * @param {number} weekNumber Week number for weekly surveys
   * @param {Object} familyData Family data for customization
   * @returns {Array} Array of survey questions
   */
  export function generateSurveyQuestions(surveyType, weekNumber = 1, familyData = {}) {
    // This function would generate the appropriate questions
    // based on survey type and family data
    // In a real implementation, this might pull from a database or API
    
    // For now, return some sample questions
    const baseQuestions = [
      {
        id: 'q1',
        text: 'Who is primarily responsible for meal planning in your household?',
        category: 'Invisible Household Tasks',
        options: ['Mama', 'Papa', 'Shared', 'Not Applicable']
      },
      {
        id: 'q2',
        text: 'Who typically prepares breakfast for the family?',
        category: 'Visible Household Tasks',
        options: ['Mama', 'Papa', 'Shared', 'Not Applicable']
      },
      {
        id: 'q3',
        text: 'Who usually puts the children to bed?',
        category: 'Visible Parental Tasks',
        options: ['Mama', 'Papa', 'Shared', 'Not Applicable']
      },
      {
        id: 'q4',
        text: 'Who keeps track of children\'s activities and schedules?',
        category: 'Invisible Parental Tasks',
        options: ['Mama', 'Papa', 'Shared', 'Not Applicable']
      }
    ];
    
    if (surveyType === 'initial') {
      // Return full set of questions for initial survey
      return baseQuestions.concat([
        // Add more questions for initial survey
      ]);
    } else if (surveyType.startsWith('weekly')) {
      // Return a subset of questions for weekly check-in
      // We could vary these based on the week number
      return baseQuestions.slice(0, 2).concat([
        {
          id: `week-${weekNumber}-q1`,
          text: 'How balanced do you feel the workload was this week?',
          category: 'Perception',
          options: ['Very Unbalanced', 'Somewhat Unbalanced', 'Neutral', 'Somewhat Balanced', 'Very Balanced']
        }
      ]);
    }
    
    return baseQuestions;
  }