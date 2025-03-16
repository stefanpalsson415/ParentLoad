// src/services/onboardingService.js
import { db, auth } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';

/**
 * Validate onboarding step data
 * @param {string} step The current step
 * @param {Object} data The step data
 * @returns {Object} The validated data
 */
export function validateOnboardingStep(step, data) {
  console.log(`Validating step: ${step} with data:`, data);
  
  switch (step) {
    case 'familyName':
      if (!data || !data.familyName || data.familyName.trim() === '') {
        throw new Error('Family name is required');
      }
      return { familyName: data.familyName.trim() };
      
    case 'parentData':
      // Ensure data is an array
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.error('Invalid parent data:', data);
        throw new Error('At least one parent is required');
      }
      
      // Check each parent for required fields
      data.forEach((parent, index) => {
        if (!parent.name || !parent.email || !parent.password) {
          throw new Error(`Parent ${index + 1} is missing required information`);
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(parent.email)) {
          throw new Error(`Invalid email format for ${parent.name || 'Parent ' + (index + 1)}`);
        }
        
        // Validate password strength
        if (parent.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
      });
      
      return { parentData: data };
      
    case 'children':
      // Children are optional, but if provided must be valid
      if (data && Array.isArray(data.children)) {
        data.children.forEach((child, index) => {
          if (!child.name) {
            throw new Error(`Each child must have a name (Child ${index + 1})`);
          }
          
          // If age is provided, ensure it's a number
          if (child.age !== undefined && (isNaN(child.age) || child.age < 0)) {
            throw new Error(`Child's age must be a valid number (${child.name})`);
          }
        });
      }
      
      return { childrenData: data.children || [] };
      
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
          throw new Error(`Invalid priority category: ${data.priorities[priority]}`);
        }
      });
      
      return { priorities: data.priorities };
      
    default:
      throw new Error(`Unknown onboarding step: ${step}`);
  }
}

/**
 * Create a new family from onboarding data
 * @param {Object} onboardingData The collected onboarding data
 * @returns {Promise<Object>} Created family data
 */
export async function createFamilyFromOnboarding(onboardingData) {
  try {
    console.log("Starting family creation with data:", {
      familyName: onboardingData.familyName,
      parentData: onboardingData.parentData?.map(p => ({...p, password: '****'})), // Log without passwords
      childrenData: onboardingData.childrenData,
      priorities: onboardingData.priorities
    });
    
    if (!onboardingData.familyName || !onboardingData.parentData || !Array.isArray(onboardingData.parentData)) {
      throw new Error("Missing required family data");
    }
    
    // Create user accounts for parents
    const parentUsers = [];
    for (const parent of onboardingData.parentData) {
      if (parent.email && parent.password) {
        try {
          console.log(`Creating user account for ${parent.name} (${parent.role})`);
          const userCredential = await createUserWithEmailAndPassword(auth, parent.email, parent.password);
          
          parentUsers.push({
            uid: userCredential.user.uid,
            email: parent.email,
            name: parent.name,
            role: parent.role
          });
          
          console.log(`Created user for ${parent.role}:`, userCredential.user.uid);
        } catch (error) {
          console.error(`Error creating user for ${parent.role}:`, error);
          // Continue with other parents even if one fails
        }
      }
    }
    
    if (parentUsers.length === 0) {
      throw new Error("No parent users could be created. Please check email and password information.");
    }
    
    // Generate a family ID
    const familyId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    console.log("Generated familyId:", familyId);
    
    // Create family members array
    const familyMembers = [
      ...onboardingData.parentData.map((parent, index) => {
        // Try to match with created user account
        const user = parentUsers.find(u => u.email === parent.email);
        const userId = user ? user.uid : `${parent.role.toLowerCase()}-${familyId}`;
        
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
      ...(onboardingData.childrenData || []).map(child => {
        const childId = `${child.name.toLowerCase().replace(/\s+/g, '-')}-${familyId}`;
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
      familyName: onboardingData.familyName,
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
    
    // Save the family document to Firestore
    console.log("Attempting to save family document:", familyId);
    await setDoc(doc(db, "families", familyId), familyDoc);
    console.log("Family document created successfully");
    
    return {
      familyId,
      familyName: onboardingData.familyName,
      memberIds: parentUsers.map(user => user.uid)
    };
  } catch (error) {
    console.error("Error in createFamilyFromOnboarding:", error);
    throw error;
  }
}