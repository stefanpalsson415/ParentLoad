// src/services/familyService.js
import { 
    doc, getDoc, setDoc, updateDoc, 
    query, collection, where, getDocs,
    serverTimestamp 
  } from 'firebase/firestore';
  import { db } from './firebase';
  
  /**
   * Load a family by ID
   * @param {string} familyId The ID of the family to load
   * @returns {Promise<Object>} Family data
   */
  export async function loadFamilyById(familyId) {
    try {
      if (!familyId) throw new Error("No family ID provided");
      
      const docRef = doc(db, "families", familyId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          familyId,
          ...docSnap.data()
        };
      } else {
        throw new Error("Family not found");
      }
    } catch (error) {
      console.error("Error loading family:", error);
      throw error;
    }
  }
  
  /**
   * Load a family by user ID
   * @param {string} userId The ID of the user
   * @returns {Promise<Object>} Family data
   */
  export async function loadFamilyByUserId(userId) {
    try {
      if (!userId) throw new Error("No user ID provided");
      
      const q = query(collection(db, "families"), where("memberIds", "array-contains", userId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const familyId = querySnapshot.docs[0].id;
        const familyData = querySnapshot.docs[0].data();
        
        return {
          ...familyData,
          familyId
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error loading family by user:", error);
      throw error;
    }
  }
  
  /**
   * Get all families for a user
   * @param {string} userId The ID of the user
   * @returns {Promise<Array>} Array of family data objects
   */
  export async function getAllFamiliesByUserId(userId) {
    try {
      if (!userId) throw new Error("No user ID provided");
      
      const q = query(collection(db, "families"), where("memberIds", "array-contains", userId));
      const querySnapshot = await getDocs(q);
      
      const families = [];
      querySnapshot.forEach((doc) => {
        families.push({
          ...doc.data(),
          familyId: doc.id
        });
      });
      
      return families;
    } catch (error) {
      console.error("Error loading all families by user:", error);
      throw error;
    }
  }
  
  /**
   * Create a new family
   * @param {Object} familyData Family information
   * @returns {Promise<Object>} Created family data
   */
  export async function createFamily(familyData) {
    try {
      // Validate required fields
      if (!familyData.familyName) {
        throw new Error("Family name is required");
      }
      
      // Generate a simple family ID
      const familyId = Date.now().toString(36) + Math.random().toString(36).substring(2);
      
      // Prepare family document data
      const familyDoc = {
        ...familyData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Create the family document
      await setDoc(doc(db, "families", familyId), familyDoc);
      
      return {
        familyId,
        ...familyData
      };
    } catch (error) {
      console.error("Error creating family:", error);
      throw error;
    }
  }
  
  /**
   * Update family data
   * @param {string} familyId The ID of the family
   * @param {Object} data Data to update
   * @returns {Promise<boolean>} Success status
   */
  export async function updateFamilyData(familyId, data) {
    try {
      if (!familyId) throw new Error("No family ID provided");
      
      const docRef = doc(db, "families", familyId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error("Error updating family data:", error);
      throw error;
    }
  }