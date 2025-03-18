// src/services/familyService.js

import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  getDocs,
  updateDoc
} from 'firebase/firestore';

// Create a new family with detailed logging
export const createFamily = async (familyData, userId) => {
  try {
    console.log('🔵 Creating family with data:', JSON.stringify(familyData, null, 2));
    console.log('🔵 Creator user ID:', userId);
    
    // Create a new document in the families collection
    const familyRef = doc(collection(db, 'families'));
    
    // Add the creator as the first family member if not already included
    const creatorExists = familyData.parents.some(parent => parent.id === userId);
    
    const familyMembers = [
      ...familyData.parents,
      ...(familyData.children || [])
    ];
    
    // Combined data to save
    const combinedData = {
      familyName: familyData.familyName,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      currentWeek: 1,
      completedWeeks: [],
      priorities: familyData.priorities || {
        highestPriority: 'Invisible Parental Tasks',
        secondaryPriority: 'Visible Parental Tasks',
        tertiaryPriority: 'Invisible Household Tasks'
      },
      familyMembers: familyMembers
    };
    
    console.log('🔵 Combined data for saving:', JSON.stringify(combinedData, null, 2));
    
    // Save to Firestore
    await setDoc(familyRef, combinedData);
    console.log('🔵 Family document created with ID:', familyRef.id);
    
    // Also add this family reference to the user's profile
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      families: [familyRef.id]
    }, { merge: true });
    
    console.log('🔵 Family reference added to user document');
    
    // Return the complete family data including ID
    const result = {
      familyId: familyRef.id,
      ...combinedData
    };
    
    console.log('🔵 Returning family data with ID');
    return result;
  } catch (error) {
    console.error('❌ Error creating family:', error);
    throw error;
  }
};

// Get a family by ID
export const getFamilyById = async (familyId) => {
  try {
    const familyRef = doc(db, 'families', familyId);
    const familySnapshot = await getDoc(familyRef);
    
    if (!familySnapshot.exists()) {
      throw new Error('Family not found');
    }
    
    return {
      familyId: familySnapshot.id,
      ...familySnapshot.data()
    };
  } catch (error) {
    console.error('Error getting family:', error);
    throw error;
  }
};

// Get all families for a user
export const getFamiliesByUserId = async (userId) => {
  try {
    // First get user document to find family IDs
    const userRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userRef);
    
    if (!userSnapshot.exists()) {
      return [];
    }
    
    const userData = userSnapshot.data();
    const familyIds = userData.families || [];
    
    // If no families, return empty array
    if (familyIds.length === 0) {
      return [];
    }
    
    // Get each family document
    const families = await Promise.all(
      familyIds.map(async (familyId) => {
        try {
          const family = await getFamilyById(familyId);
          return family;
        } catch (error) {
          console.error(`Error getting family ${familyId}:`, error);
          return null;
        }
      })
    );
    
    // Filter out any nulls (failed retrievals)
    return families.filter(Boolean);
  } catch (error) {
    console.error('Error getting families for user:', error);
    throw error;
  }
};

// Update family data
export const updateFamily = async (familyId, updates) => {
  try {
    const familyRef = doc(db, 'families', familyId);
    await updateDoc(familyRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating family:', error);
    throw error;
  }
};

// Add a member to a family
export const addFamilyMember = async (familyId, memberData) => {
  try {
    const familyRef = doc(db, 'families', familyId);
    const familySnapshot = await getDoc(familyRef);
    
    if (!familySnapshot.exists()) {
      throw new Error('Family not found');
    }
    
    const familyData = familySnapshot.data();
    const familyMembers = familyData.familyMembers || [];
    
    // Check if member already exists
    const exists = familyMembers.some(member => member.id === memberData.id);
    if (exists) {
      throw new Error('Member already exists in this family');
    }
    
    // Add new member to the array
    const updatedMembers = [...familyMembers, memberData];
    
    await updateDoc(familyRef, {
      familyMembers: updatedMembers,
      updatedAt: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Error adding family member:', error);
    throw error;
  }
};