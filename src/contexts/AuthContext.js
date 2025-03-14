// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';
import * as familyService from '../services/familyService';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component that wraps the app and makes auth object available
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [familyData, setFamilyData] = useState(null);
  const [availableFamilies, setAvailableFamilies] = useState([]);

  // Sign up function
  async function signup(email, password) {
    return authService.createUser(email, password);
  }

  // Login function
  async function login(email, password) {
    return authService.signIn(email, password);
  }

  // Logout function
  async function logout() {
    setFamilyData(null);
    setAvailableFamilies([]);
    return authService.signOut();
  }

  // Create a new family
  async function createFamily(familyData) {
    return familyService.createFamily(familyData);
  }

  // Load family data
  async function loadFamilyData(familyId) {
    try {
      // If no family ID is provided, try to load by user ID
      let data;
      if (familyId && typeof familyId === 'string') {
        data = await familyService.loadFamilyById(familyId);
      } else if (currentUser) {
        data = await familyService.loadFamilyByUserId(currentUser.uid);
      } else {
        throw new Error("No family ID or user ID available");
      }
      
      if (data) {
        setFamilyData(data);
      }
      
      return data;
    } catch (error) {
      console.error("Error loading family data:", error);
      throw error;
    }
  }

  // Load all families for a user
  async function loadAllFamilies(userId) {
    try {
      const families = await familyService.getAllFamiliesByUserId(userId || currentUser?.uid);
      setAvailableFamilies(families);
      return families;
    } catch (error) {
      console.error("Error loading all families:", error);
      throw error;
    }
  }

  // Ensure families are loaded
  async function ensureFamiliesLoaded(userId) {
    try {
      // First load all families
      const families = await loadAllFamilies(userId);
      
      // Then if there are families, load the primary family
      if (families && families.length > 0) {
        await loadFamilyData(families[0].familyId);
      }
      
      return families;
    } catch (error) {
      console.error("Error ensuring families are loaded:", error);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = authService.observeAuthState(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Load all families first
          await loadAllFamilies(user.uid);
          
          // Then load the primary family data if available
          await loadFamilyData(user.uid);
        } catch (error) {
          console.error("Error loading family data on auth change:", error);
        }
      } else {
        // Clear family data on logout
        setFamilyData(null);
        setAvailableFamilies([]);
      }
      
      setLoading(false);
    });
  
    // Add a timeout to prevent hanging indefinitely
    const timeout = setTimeout(() => {
      console.log("Auth loading timeout - forcing render");
      setLoading(false);
    }, 5000); // 5 seconds timeout
    
    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  // Context value
  const value = {
    currentUser,
    familyData,
    availableFamilies,
    signup,
    login,
    logout,
    createFamily,
    loadFamilyData,
    loadAllFamilies,
    ensureFamiliesLoaded,
    reload: () => loadFamilyData(currentUser?.uid)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}