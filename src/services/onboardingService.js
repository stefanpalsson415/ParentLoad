// src/services/onboardingService.js
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import * as familyService from './familyService';
import { createError, ErrorCodes, logError } from '../utils/errorHandling';

/**
 * Create a new family during onboarding
 * @param {Object} onboardingData Complete onboarding data
 * @returns {Promise<Object>} Created family data
 */
export async function createFamilyFromOnboarding(onboardingData) {
  try {
    const { familyName, parentData, childrenData, priorities } = onboardingData;
    
    console.log("Creating family with data:", { 
      familyName, 
      parentData: parentData ? `${parentData.length} parents` : 'none',
      childrenData: childrenData ? `${childrenData.length} children` : 'none',
      priorities
    });
    
    if (!familyName || !parentData || !Array.isArray(parentData) || parentData.length === 0) {
      throw createError(ErrorCodes.DATA_INVALID, "Missing required family information");
    }
    
    // Create user accounts for parents
    const parentUsers = [];
    for (const parent of parentData) {
      if (parent.email && parent.password) {
        try {
          console.log(`Attempting to create user for ${parent.role} with email: ${parent.email}`);
          
          // Use Firebase auth directly since we're handling this specially
          const userCredential = await createUserWithEmailAndPassword(auth, parent.email, parent.password);
          const user = userCredential.user;
          
          parentUsers.push({
            uid: user.uid,
            email: parent.email,
            role: parent.role
          });
          console.log(`Successfully created user for ${parent.role}:`, user.uid);
        } catch (error) {
          console.error(`Error creating user for ${parent.role}:`, error.code, error.message);
          
          // Specific handling for common Firebase auth errors
          if (error.code === 'auth/email-already-in-use') {
            throw createError(
              ErrorCodes.AUTH_EMAIL_ALREADY_IN_USE, 
              `The email ${parent.email} is already in use. Please use a different email or log in.`
            );
          } else if (error.code === 'auth/invalid-email') {
            throw createError(
              ErrorCodes.AUTH_INVALID_EMAIL, 
              `The email address ${parent.email} is not valid.`
            );
          } else if (error.code === 'auth/weak-password') {
            throw createError(
              ErrorCodes.AUTH_WEAK_PASSWORD, 
              "Password is too weak. Please use at least 6 characters."
            );
          } else if (error.code === 'auth/network-request-failed') {
            throw createError(
              ErrorCodes.NETWORK_OFFLINE, 
              "Network error. Please check your internet connection and try again."
            );
          }
          
          // For other errors, continue with other parents
          console.warn(`Continuing with other parents after error for ${parent.role}`);
        }
      }
    }
    
    // Rest of the function...
    
    if (parentUsers.length === 0) {
      throw createError(
        ErrorCodes.DATA_INVALID, 
        "No parent users could be created. Please check email and password information."
      );
    }
    
    // Generate a family ID
    const familyId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    console.log("Generated family ID:", familyId);
    
    // Create family members array
    const familyMembers = [
      ...parentData.map((parent, index) => {
        const userId = parentUsers[index]?.uid || `${parent.role.toLowerCase()}-${familyId}`;
        return {
          id: userId,
          name: parent.name,
          role: 'parent',
          roleType: parent.role,
          email: parent.email,
          completed: false,
          completedDate: null,
          weeklyCompleted: [],
          profilePicture: '/api/placeholder/150/150' // Default placeholder
        };
      }),
      ...(childrenData || []).map(child => {
        const childId = `${child.name.toLowerCase()}-${familyId}`;
        return {
          id: childId,
          name: child.name,
          role: 'child',
          age: child.age,
          completed: false,
          completedDate: null,
          weeklyCompleted: [],
          profilePicture: '/api/placeholder/150/150' // Default placeholder
        };
      })
    ];
    
    // Prepare family document data
    const familyDoc = {
      familyId,
      familyName,
      familyMembers,
      tasks: [],
      completedWeeks: [],
      currentWeek: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      memberIds: parentUsers.map(user => user.uid),
      priorities: priorities || {
        highestPriority: "Invisible Parental Tasks",
        secondaryPriority: "Visible Parental Tasks",
        tertiaryPriority: "Invisible Household Tasks"
      },
      surveySchedule: {}, 
      familyPicture: null
    };
    
    console.log("Creating family document:", familyId);
    
    // Save the family document
    await familyService.createFamily(familyDoc);
    console.log("Family document created successfully");
    
    return familyDoc;
  } catch (error) {
    console.error("Error in createFamilyFromOnboarding:", error);
    logError("createFamilyFromOnboarding", error);
    throw error;
  }
}

/**
 * Validate and process onboarding data for each step
 * @param {string} step Onboarding step name
 * @param {Object} data Step data to validate
 * @returns {Object} Validated and processed data
 */
export function validateOnboardingStep(step, data) {
  console.log(`Validating step ${step} with data:`, data);
  
  switch (step) {
    case 'familyName':
      if (!data.familyName || data.familyName.trim() === '') {
        throw createError(
          ErrorCodes.DATA_INVALID, 
          "Family name is required"
        );
      }
      return { familyName: data.familyName.trim() };
      
    case 'parentData':
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw createError(
          ErrorCodes.DATA_INVALID, 
          "At least one parent is required"
        );
      }
      
      // Validate each parent
      data.forEach(parent => {
        if (!parent.name || !parent.role || !parent.email || !parent.password) {
          throw createError(
            ErrorCodes.DATA_INVALID, 
            "Each parent must have a name, role, email, and password"
          );
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(parent.email)) {
          throw createError(
            ErrorCodes.DATA_INVALID, 
            `Invalid email format: ${parent.email}`
          );
        }
        
        // Validate password strength
        if (parent.password.length < 6) {
          throw createError(
            ErrorCodes.DATA_INVALID, 
            "Password must be at least 6 characters long"
          );
        }
      });
      
      return { parentData: data };
      
    case 'children':
      // Children are optional, but if provided must be valid
      if (data.children && Array.isArray(data.children)) {
        data.children.forEach(child => {
          if (!child.name) {
            throw createError(
              ErrorCodes.DATA_INVALID, 
              "Each child must have a name"
            );
          }
          
          // If age is provided, ensure it's a number
          if (child.age !== undefined && (isNaN(child.age) || child.age < 0)) {
            throw createError(
              ErrorCodes.DATA_INVALID, 
              "Child's age must be a valid number"
            );
          }
        });
      }
      
      return { childrenData: data.children || [] };
      
      case 'priorities':
        // Validate that priorities are set correctly
        let prioritiesObj;
        
        if (data.priorities) {
          // If data has a priorities property, use that
          prioritiesObj = data.priorities;
        } else if (data.highestPriority) {
          // If data directly contains the priority properties, use data itself
          prioritiesObj = data;
        } else {
          // Set default priorities if none provided
          return {
            priorities: {
              highestPriority: "Invisible Parental Tasks",
              secondaryPriority: "Visible Parental Tasks",
              tertiaryPriority: "Invisible Household Tasks"
            }
          };
        }
        
        const validCategories = [
          "Visible Household Tasks",
          "Invisible Household Tasks",
          "Visible Parental Tasks",
          "Invisible Parental Tasks"
        ];
        
        // Check that priorities are valid categories
        ['highestPriority', 'secondaryPriority', 'tertiaryPriority'].forEach(priority => {
          if (prioritiesObj[priority] && !validCategories.includes(prioritiesObj[priority])) {
            throw createError(
              ErrorCodes.DATA_INVALID, 
              `Invalid priority category: ${prioritiesObj[priority]}`
            );
          }
        });
        
        return { priorities: prioritiesObj };
      
    default:
      console.warn(`Unknown onboarding step: ${step}`);
      throw createError(
        ErrorCodes.DATA_INVALID, 
        `Unknown onboarding step: ${step}`
      );
  }
}