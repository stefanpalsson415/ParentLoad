// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import DatabaseService from '../services/DatabaseService';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component that wraps the app and makes auth object available to any child component that calls useAuth()
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [familyData, setFamilyData] = useState(null);

  // Sign up function
  async function signup(email, password) {
    return DatabaseService.createUser(email, password);
  }

  // Login function
  async function login(email, password) {
    return DatabaseService.signIn(email, password);
  }

  // Logout function
  async function logout() {
    return DatabaseService.signOut();
  }

  // Create a new family
  async function createFamily(familyData) {
    return DatabaseService.createFamily(familyData);
  }

  // Load family data
  async function loadFamilyData(userId) {
    try {
      const data = await DatabaseService.loadFamilyByUserId(userId);
      setFamilyData(data);
      return data;
    } catch (error) {
      console.error("Error loading family data:", error);
      throw error;
    }
  }

  // Effect for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Load family data when user logs in
          await loadFamilyData(user.uid);
        } catch (error) {
          console.error("Error loading family data on auth change:", error);
        }
      } else {
        // Clear family data on logout
        setFamilyData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Context value
  const value = {
    currentUser,
    familyData,
    signup,
    login,
    logout,
    createFamily,
    loadFamilyData,
    reload: () => loadFamilyData(currentUser?.uid)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}