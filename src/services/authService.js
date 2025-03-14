// src/services/authService.js
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged
  } from 'firebase/auth';
  import { auth } from './firebase';
  
  /**
   * Create a new user account
   * @param {string} email User email
   * @param {string} password User password
   * @returns {Promise<UserCredential>} Firebase user credential
   */
  export async function createUser(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
  
  /**
   * Sign in existing user
   * @param {string} email User email
   * @param {string} password User password
   * @returns {Promise<UserCredential>} Firebase user credential
   */
  export async function signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  }
  
  /**
   * Sign out current user
   * @returns {Promise<void>}
   */
  export async function signOut() {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }
  
  /**
   * Get the current authenticated user
   * @returns {User|null} Current user or null if not authenticated
   */
  export function getCurrentUser() {
    return auth.currentUser;
  }
  
  /**
   * Set up an observer on user authentication state
   * @param {Function} callback Function to call when auth state changes
   * @returns {Function} Unsubscribe function
   */
  export function observeAuthState(callback) {
    return onAuthStateChanged(auth, callback);
  }