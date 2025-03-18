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
    console.log(`Saving survey responses for ${memberId} in family ${familyId}`, responses);
    
    if (!familyId || !memberId || !surveyType) {
      throw createError(ErrorCodes.DATA_INVALID, "Missing required parameters");
    }
    
    // Create document reference with a specific format
    const docRef = doc(db, "surveyResponses", `${familyId}-${memberId}-${surveyType}`);
    
    // Save the data with additional metadata
    await setDoc(docRef, {
      familyId,
      memberId,
      surveyType,
      responses,
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log(`Survey responses saved successfully for ${memberId}`);
    return true;
  } catch (error) {
    console.error("Error saving survey responses:", error);
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
  // This is a simplified implementation - in a real version, you would
  // fetch questions from your database or use a more robust system
  
  // For initial survey, provide a comprehensive set of questions
  if (surveyType === 'initial') {
    return [
      {
        id: 'q1',
        text: 'Who is primarily responsible for meal planning in your household?',
        category: 'Invisible Household Tasks',
        explanation: 'This question helps us understand who is primarily handling invisible household tasks in your family.'
      },
      {
        id: 'q2',
        text: 'Who typically prepares breakfast for the family?',
        category: 'Visible Household Tasks',
        explanation: 'This question helps us understand who is primarily handling visible household tasks in your family.'
      },
      {
        id: 'q3',
        text: 'Who usually does laundry in your home?',
        category: 'Visible Household Tasks',
        explanation: 'Laundry is a recurring visible task that takes significant time.'
      },
      {
        id: 'q4',
        text: 'Who manages children\'s schedules and activities?',
        category: 'Invisible Parental Tasks',
        explanation: 'This is an important invisible task that requires significant planning.'
      },
      {
        id: 'q5',
        text: 'Who handles emotional support for children?',
        category: 'Invisible Parental Tasks',
        explanation: 'Emotional labor is an often overlooked but critical parental task.'
      }
    ];
  } 
  // For weekly survey, provide a smaller subset of key questions
  else if (surveyType.startsWith('weekly')) {
    return [
      {
        id: `week${weekNumber}-q1`,
        text: 'Who handled meal planning this week?',
        category: 'Invisible Household Tasks',
        weeklyExplanation: 'Tracking this task helps us see if the workload distribution is changing.'
      },
      {
        id: `week${weekNumber}-q2`,
        text: 'Who managed most of the household cleaning this week?',
        category: 'Visible Household Tasks',
        weeklyExplanation: 'Regular tracking of visible tasks shows progress in balance.'
      },
      {
        id: `week${weekNumber}-q3`,
        text: 'Who coordinated children\'s activities this week?',
        category: 'Invisible Parental Tasks',
        weeklyExplanation: 'This helps track changes in invisible parental work.'
      }
    ];
  }
  
  // Fallback to sample questions if something goes wrong
  return [
    {
      id: 'sample-q1',
      text: 'Who handles most household planning?',
      category: 'Invisible Household Tasks',
      explanation: 'This helps us understand the mental load distribution.'
    },
    {
      id: 'sample-q2',
      text: 'Who does most visible household chores?',
      category: 'Visible Household Tasks',
      explanation: 'This tracks the physical workload balance.'
    }
  ];
}
    