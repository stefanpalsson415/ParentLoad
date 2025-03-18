// src/contexts/FamilyContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getFamilyById, getFamiliesByUserId, updateFamily } from '../services/familyService';

// Create the family context
const FamilyContext = createContext();

// Custom hook to use the family context
export function useFamily() {
  return useContext(FamilyContext);
}

// Provider component
export function FamilyProvider({ children }) {
  const { currentUser } = useAuth();
  
  // Family state
  const [currentFamily, setCurrentFamily] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [userFamilies, setUserFamilies] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Activity state
  const [currentWeek, setCurrentWeek] = useState(1);
  const [completedWeeks, setCompletedWeeks] = useState([]);
  const [taskRecommendations, setTaskRecommendations] = useState([]);
  
  // Load user's families when auth state changes
  useEffect(() => {
    const loadFamilies = async () => {
      if (currentUser) {
        try {
          setLoading(true);
          const families = await getFamiliesByUserId(currentUser.uid);
          setUserFamilies(families);
          
          // Auto-select first family if there is one and none is currently selected
          if (families.length > 0 && !currentFamily) {
            await selectFamily(families[0].familyId);
          } else {
            setLoading(false);
          }
        } catch (err) {
          console.error('Error loading families:', err);
          setError('Failed to load your families. Please try again.');
          setLoading(false);
        }
      } else {
        // Reset state when user logs out
        setCurrentFamily(null);
        setFamilyMembers([]);
        setUserFamilies([]);
        setSelectedMember(null);
        setCurrentWeek(1);
        setCompletedWeeks([]);
        setTaskRecommendations([]);
        setLoading(false);
      }
    };
    
    loadFamilies();
  }, [currentUser]);
  
  // Function to select a family
  const selectFamily = async (familyId) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch the family data
      const family = await getFamilyById(familyId);
      
      // Set current family
      setCurrentFamily(family);
      
      // Set family members
      setFamilyMembers(family.familyMembers || []);
      
      // Set current activity state
      setCurrentWeek(family.currentWeek || 1);
      setCompletedWeeks(family.completedWeeks || []);
      setTaskRecommendations(family.tasks || []);
      
      // Try to select the current user as the selected member
      if (currentUser) {
        const userMember = family.familyMembers?.find(member => member.id === currentUser.uid);
        if (userMember) {
          setSelectedMember(userMember);
        } else if (family.familyMembers?.length > 0) {
          // Default to first member if user is not a direct member
          setSelectedMember(family.familyMembers[0]);
        }
      }
      
      setLoading(false);
      return family;
    } catch (err) {
      console.error('Error selecting family:', err);
      setError('Failed to load family details. Please try again.');
      setLoading(false);
      return null;
    }
  };
  
  // Function to update family data
  const updateFamilyData = async (updates) => {
    if (!currentFamily?.familyId) {
      setError('No family selected');
      return false;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Update in database
      await updateFamily(currentFamily.familyId, updates);
      
      // Update local state
      const updatedFamily = {
        ...currentFamily,
        ...updates
      };
      
      setCurrentFamily(updatedFamily);
      
      // If family members are updated, update that state too
      if (updates.familyMembers) {
        setFamilyMembers(updates.familyMembers);
      }
      
      // If activity state is updated, update those states too
      if (updates.currentWeek !== undefined) {
        setCurrentWeek(updates.currentWeek);
      }
      
      if (updates.completedWeeks) {
        setCompletedWeeks(updates.completedWeeks);
      }
      
      if (updates.tasks) {
        setTaskRecommendations(updates.tasks);
      }
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error updating family:', err);
      setError('Failed to update family. Please try again.');
      setLoading(false);
      return false;
    }
  };
  
  // Function to select a family member
  const selectMember = (member) => {
    setSelectedMember(member);
    return member;
  };
  
  // Function to complete a week
  const completeWeek = async (weekNumber) => {
    if (!currentFamily?.familyId) {
      setError('No family selected');
      return false;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Here we'd typically have logic to process the week's data,
      // generate new tasks, etc. For now, we'll just update the state.
      
      // Add to completed weeks if not already there
      const updatedCompletedWeeks = [...completedWeeks];
      if (!updatedCompletedWeeks.includes(weekNumber)) {
        updatedCompletedWeeks.push(weekNumber);
      }
      
      // Increment current week
      const nextWeek = weekNumber + 1;
      
      // Update in database
      await updateFamily(currentFamily.familyId, {
        completedWeeks: updatedCompletedWeeks,
        currentWeek: nextWeek
      });
      
      // Update local state
      setCompletedWeeks(updatedCompletedWeeks);
      setCurrentWeek(nextWeek);
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error completing week:', err);
      setError('Failed to complete week. Please try again.');
      setLoading(false);
      return false;
    }
  };
  
  // Clear error state
  const clearError = () => {
    setError(null);
  };
  
  // Context value
  const value = {
    currentFamily,
    familyMembers,
    userFamilies,
    selectedMember,
    currentWeek,
    completedWeeks,
    taskRecommendations,
    loading,
    error,
    selectFamily,
    updateFamilyData,
    selectMember,
    completeWeek,
    clearError
  };
  
  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  );
}