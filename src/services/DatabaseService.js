// src/services/DatabaseService.js
import { 
  collection, doc, setDoc, getDoc, updateDoc, 
  getDocs, addDoc, query, where, serverTimestamp,
  arrayUnion
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from './firebase';

class DatabaseService {
  constructor() {
    this.db = db;
    this.auth = auth;
    this.storage = storage;
  }

  // ---- Authentication Methods ----

  // Create a new user account
  async createUser(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  // Sign in existing user
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  }

  // Sign out current user
  async signOut() {
    try {
      await signOut(this.auth);
      return true;
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser() {
    return this.auth.currentUser;
  }

  // ---- Storage Methods ----

  // Upload image to Firebase Storage
  async uploadProfileImage(userId, file) {
    try {
      // Create a unique path for the file
      const storageRef = ref(this.storage, `profile-pictures/${userId}_${Date.now()}`);
      
      // Upload the file to Firebase Storage
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }

  // ---- Family Data Methods ----

  // Load family data from Firestore
  async loadFamilyData(familyId) {
    try {
      const docRef = doc(this.db, "families", familyId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        // Get survey responses for this family
        const surveyResponsesQuery = query(
          collection(this.db, "surveyResponses"), 
          where("familyId", "==", familyId)
        );
        const surveyResponsesSnapshot = await getDocs(surveyResponsesQuery);
        
        // Process survey responses
        const surveyResponses = {};
        surveyResponsesSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.responses) {
            // Merge all responses together
            Object.assign(surveyResponses, data.responses);
          }
        });
        
        return {
          ...docSnap.data(),
          surveyResponses: surveyResponses
        };
      } else {
        console.log("No such family document!");
        return null;
      }
    } catch (error) {
      console.error("Error loading family data:", error);
      throw error;
    }
  }

  // Load family by user ID
  async loadFamilyByUserId(userId) {
    try {
      const q = query(collection(this.db, "families"), where("memberIds", "array-contains", userId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const familyId = querySnapshot.docs[0].id;
        const familyData = querySnapshot.docs[0].data();
        
        // Get survey responses for this family
        const surveyResponsesQuery = query(
          collection(this.db, "surveyResponses"), 
          where("familyId", "==", familyId)
        );
        const surveyResponsesSnapshot = await getDocs(surveyResponsesQuery);
        
        // Process survey responses
        const surveyResponses = {};
        surveyResponsesSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.responses) {
            // Merge all responses together
            Object.assign(surveyResponses, data.responses);
          }
        });
        
        return {
          ...familyData,
          familyId: familyId,
          surveyResponses: surveyResponses
        };
      } else {
        console.log("No family found for this user!");
        return null;
      }
    } catch (error) {
      console.error("Error loading family by user:", error);
      throw error;
    }
  }

  // Save family data to Firestore
  async saveFamilyData(data, familyId) {
    try {
      const docRef = doc(this.db, "families", familyId);
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (error) {
      console.error("Error saving family data:", error);
      throw error;
    }
  }

  // Store email for weekly updates
  async saveEmailForUpdates(email, familyId) {
    try {
      const docRef = doc(this.db, "emailSubscriptions", familyId);
      await setDoc(docRef, {
        email,
        familyId,
        updatedAt: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (error) {
      console.error("Error saving email:", error);
      throw error;
    }
  }

  // Update member survey completion
  async updateMemberSurveyCompletion(familyId, memberId, surveyType, isCompleted) {
    try {
      const docRef = doc(this.db, "families", familyId);
      const familyData = await getDoc(docRef);
      
      if (familyData.exists()) {
        const updatedMembers = familyData.data().familyMembers.map(member => {
          if (member.id === memberId) {
            if (surveyType === 'initial') {
              return {
                ...member,
                completed: isCompleted,
                completedDate: new Date().toISOString().split('T')[0]
              };
            } else if (surveyType.startsWith('weekly-')) {
              const weekIndex = parseInt(surveyType.replace('weekly-', '')) - 1;
              const updatedWeeklyCompleted = [...(member.weeklyCompleted || [])];
              
              while (updatedWeeklyCompleted.length <= weekIndex) {
                updatedWeeklyCompleted.push({
                  id: updatedWeeklyCompleted.length + 1,
                  completed: false,
                  date: null
                });
              }
              
              updatedWeeklyCompleted[weekIndex] = {
                ...updatedWeeklyCompleted[weekIndex],
                completed: isCompleted,
                date: new Date().toISOString().split('T')[0]
              };
              
              return {
                ...member,
                weeklyCompleted: updatedWeeklyCompleted
              };
            }
          }
          return member;
        });
        
        await updateDoc(docRef, {
          familyMembers: updatedMembers,
          updatedAt: serverTimestamp()
        });
        
        return true;
      } else {
        throw new Error("Family not found");
      }
    } catch (error) {
      console.error("Error updating member completion:", error);
      throw error;
    }
  }

  // Save survey responses
  async saveSurveyResponses(familyId, memberId, surveyType, responses) {
    try {
      const docRef = doc(this.db, "surveyResponses", `${familyId}-${memberId}-${surveyType}`);
      await setDoc(docRef, {
        familyId,
        memberId,
        surveyType,
        responses,
        completedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Error saving survey responses:", error);
      throw error;
    }
  }

  // Add task comment
  async addTaskComment(familyId, taskId, userId, userName, text) {
    try {
      const docRef = doc(this.db, "families", familyId);
      const familyData = await getDoc(docRef);
      
      if (familyData.exists()) {
        const comment = {
          id: Date.now(),
          userId,
          userName,
          text,
          timestamp: new Date().toLocaleString()
        };
        
        const taskData = familyData.data().tasks || [];
        const updatedTasks = taskData.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              comments: [...(task.comments || []), comment]
            };
          }
          return task;
        });
        
        await updateDoc(docRef, {
          tasks: updatedTasks,
          updatedAt: serverTimestamp()
        });
        
        return comment;
      } else {
        throw new Error("Family not found");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  }

  // Update task completion
  async updateTaskCompletion(familyId, taskId, isCompleted) {
    try {
      const docRef = doc(this.db, "families", familyId);
      const familyData = await getDoc(docRef);
      
      if (familyData.exists()) {
        const taskData = familyData.data().tasks || [];
        const updatedTasks = taskData.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              completed: isCompleted,
              completedDate: isCompleted ? new Date().toISOString().split('T')[0] : null
            };
          }
          return task;
        });
        
        await updateDoc(docRef, {
          tasks: updatedTasks,
          updatedAt: serverTimestamp()
        });
        
        return true;
      } else {
        throw new Error("Family not found");
      }
    } catch (error) {
      console.error("Error updating task completion:", error);
      throw error;
    }
  }

  // Save family meeting notes
  async saveFamilyMeetingNotes(familyId, weekNumber, notes) {
    try {
      const docRef = doc(this.db, "familyMeetings", `${familyId}-week${weekNumber}`);
      await setDoc(docRef, {
        familyId,
        weekNumber,
        notes,
        completedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Error saving family meeting notes:", error);
      throw error;
    }
  }

  // Create a new family
  async createFamily(familyData) {
    try {
      const { familyName, parentData, childrenData } = familyData;
      
      // Create user accounts for parents
      const parentUsers = [];
      for (const parent of parentData) {
        if (parent.email && parent.password) {
          try {
            const user = await this.createUser(parent.email, parent.password);
            parentUsers.push({
              uid: user.uid,
              email: parent.email,
              role: parent.role
            });
            console.log(`Created user for ${parent.role}:`, user.uid);
          } catch (error) {
            console.error(`Error creating user for ${parent.role}:`, error);
            // Continue with other parents even if one fails
          }
        }
      }
      
      if (parentUsers.length === 0) {
        throw new Error("No parent users could be created");
      }
      
      // Generate a simple family ID instead of using addDoc
      const familyId = Date.now().toString(36) + Math.random().toString(36).substring(2);
      console.log("Generated familyId:", familyId);
      
      // Create family members array
      const familyMembers = [
        ...parentData.map((parent, index) => {
          const userId = parentUsers[index]?.uid || `${parent.role.toLowerCase()}-${familyId}`;
          console.log(`Creating family member for ${parent.name} with ID ${userId}`);
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
        ...childrenData.map(child => {
          const childId = `${child.name.toLowerCase()}-${familyId}`;
          console.log(`Creating family member for child ${child.name} with ID ${childId}`);
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
        createdAt: new Date(),
        updatedAt: new Date(),
        memberIds: parentUsers.map(user => user.uid)
      };
      
      console.log("Attempting to save family document:", familyId);
      
      // Create the family document directly with a specific ID
      await setDoc(doc(this.db, "families", familyId), familyDoc);
      console.log("Family document created successfully");
      
      return familyDoc;
    } catch (error) {
      console.error("Error in createFamily:", error);
      throw error;
    }
  }

  // Update family member profile picture
  async updateMemberProfilePicture(familyId, memberId, file) {
    try {
      // Upload the image to Firebase Storage
      const downloadURL = await this.uploadProfileImage(memberId, file);
      
      // Update the family member's profile picture URL in Firestore
      const docRef = doc(this.db, "families", familyId);
      const familyData = await getDoc(docRef);
      
      if (!familyData.exists()) {
        throw new Error("Family not found");
      }
      
      const updatedMembers = familyData.data().familyMembers.map(member => {
        if (member.id === memberId) {
          return {
            ...member,
            profilePicture: downloadURL
          };
        }
        return member;
      });
      
      await updateDoc(docRef, {
        familyMembers: updatedMembers,
        updatedAt: serverTimestamp()
      });
      
      return downloadURL;
    } catch (error) {
      console.error("Error updating profile picture:", error);
      throw error;
    }
  }
}

export default new DatabaseService();