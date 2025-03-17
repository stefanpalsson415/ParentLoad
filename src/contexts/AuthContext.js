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
    return authService.signOutUser();
  }

  // Create a new family
  async function createFamily(familyData) {
    try {
      console.log("AuthContext.createFamily called with:", 
        JSON.stringify({
          familyName: familyData.familyName,
          hasParentData: !!familyData.parentData,
          parentCount: familyData.parentData?.length || 0
        })
      );
      
      // Import the onboarding service to use its createFamilyFromOnboarding function
      const onboardingService = await import('../services/onboardingService');
      
      // Call the comprehensive family creation function that handles user accounts
      const result = await onboardingService.createFamilyFromOnboarding(familyData);
      
      console.log("Family created successfully:", result.familyId);
      
      // Important: Add a slight delay before trying to load the family
      // This gives Firebase time to propagate the new family data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store the family ID for later use
      if (result && result.familyId) {
        setFamilyData(result);
        localStorage.setItem('selectedFamilyId', result.familyId);
      }
      
      return result;
    } catch (error) {
      console.error("Error in AuthContext.createFamily:", error);
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

  // Load family data by ID or user ID
  async function loadFamilyData(familyId) {
    try {
      if (!familyId) {
        console.error("No family ID provided to loadFamilyData");
        return null;
      }
      
      console.log("AuthContext.loadFamilyData:", familyId);
      const data = await familyService.loadFamilyById(familyId);
      
      if (data) {
        console.log("Successfully loaded family data:", data.familyId);
        setFamilyData(data);
        
        // Update localStorage for persistence
        localStorage.setItem('selectedFamilyId', data.familyId);
      } else {
        console.error("Family data not found for ID:", familyId);
      }
      
      return data;
    } catch (error) {
      console.error("Error in loadFamilyData:", error);
      return null;
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
    let mounted = true;
    console.log("AuthContext initializing");
    
    // This function handles the entire authentication and data loading sequence
    const initializeAuth = async (user) => {
      try {
        if (user) {
          console.log("User authenticated:", user.uid);
          
          // Step 1: Load all families
          console.log("Loading all families for user:", user.uid);
          const families = await familyService.getAllFamiliesByUserId(user.uid);
          
          if (!mounted) return;
          setAvailableFamilies(families || []);
          
          // Step 2: Determine which family to load
          let familyToLoad = null;
          const storedFamilyId = localStorage.getItem('selectedFamilyId');
          
          if (storedFamilyId) {
            console.log("Found stored family ID:", storedFamilyId);
            familyToLoad = storedFamilyId;
          } else if (families && families.length > 0) {
            console.log("Using first available family:", families[0].familyId);
            familyToLoad = families[0].familyId;
            localStorage.setItem('selectedFamilyId', families[0].familyId);
          }
          
          // Step 3: Load the selected family data
          if (familyToLoad) {
            console.log("Loading family data for:", familyToLoad);
            const data = await familyService.loadFamilyById(familyToLoad);
            
            if (!mounted) return;
            
            if (data) {
              console.log("Successfully loaded family data:", data.familyId);
              setFamilyData(data);
            } else {
              console.error("Failed to load family data for ID:", familyToLoad);
              setFamilyData(null);
            }
          } else {
            console.log("No family to load");
            setFamilyData(null);
          }
        } else {
          // No user is logged in
          console.log("No authenticated user");
          setFamilyData(null);
          setAvailableFamilies([]);
        }
      } catch (error) {
        console.error("Error in auth initialization:", error);
        if (mounted) setFamilyData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    const unsubscribe = authService.observeAuthState((user) => {
      console.log("Auth state changed, user:", user ? "authenticated" : "unauthenticated");
      setCurrentUser(user);
      initializeAuth(user);
    });
    
    return () => {
      mounted = false;
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