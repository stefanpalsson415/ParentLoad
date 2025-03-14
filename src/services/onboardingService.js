// src/services/onboardingService.js
import { createError, ErrorCodes, logError } from '../utils/errorHandling';
import * as familyService from './familyService';
import * as authService from './authService';

/**
 * Create a new family during onboarding
 * @param {Object} onboardingData Complete onboarding data
 * @returns {Promise<Object>} Created family data
 */
export async function createFamilyFromOnboarding(onboardingData) {
  try {
    const { familyName, parentData, childrenData } = onboardingData;
    
    if (!familyName || !parentData || !Array.isArray(parentData) || parentData.length === 0) {
      throw createError(ErrorCodes.DATA_INVALID, "Missing required family information");
    }
    
    // Create user accounts for parents
    const parentUsers = [];
    for (const parent of parentData) {
      if (parent.email && parent.password) {
        try {
          const user = await authService.createUser(parent.email, parent.password);
          parentUsers.push({
            uid: user.uid,
            email: parent.email,
            role: parent.role
          });
          console.log(`Created user for ${parent.role}:`, user.uid);
        } catch (error) {
          logError(`Creating user for ${parent.role}`, error);
          // Continue with other parents even if one fails
        }
      }
    }
    
    if (parentUsers.length === 0) {
      throw createError(
        ErrorCodes.DATA_INVALID, 
        "No parent users could be created. Please check email and password information."
      );
    }
    
    // Generate a family ID
    const familyId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    
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
      priorities: onboardingData.priorities || {
        highestPriority: "Invisible Parental Tasks",
        secondaryPriority: "Visible Parental Tasks",
        tertiaryPriority: "Invisible Household Tasks"
      },
      surveySchedule: {}, 
      familyPicture: null
    };
    
    // Save the family document
    await familyService.createFamily(familyDoc);
    
    return familyDoc;
  } catch (error) {
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
  switch (step) {
    case 'familyName':
      if (!data.familyName || data.familyName.trim() === '') {
        throw createError(
          ErrorCodes.DATA_INVALID, 
          "Family name is required"
        );
      }
      return { familyName: data.familyName.trim() };
      
    case 'parents':
      if (!data.parents || !Array.isArray(data.parents) || data.parents.length === 0) {
        throw createError(
          ErrorCodes.DATA_INVALID, 
          "At least one parent is required"
        );
      }
      
      // Validate each parent
      data.parents.forEach(parent => {
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
      
      return { parents: data.parents };
      
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
      
      return { children: data.children || [] };
      
    case 'priorities':
      // Validate that priorities are set correctly
      if (!data.priorities) {
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
        if (data.priorities[priority] && !validCategories.includes(data.priorities[priority])) {
          throw createError(
            ErrorCodes.DATA_INVALID, 
            `Invalid priority category: ${data.priorities[priority]}`
          );
        }
      });
      
      return { priorities: data.priorities };
      
    default:
      throw createError(
        ErrorCodes.DATA_INVALID, 
        `Unknown onboarding step: ${step}`
      );
  }
}