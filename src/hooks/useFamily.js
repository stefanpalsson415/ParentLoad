// src/hooks/useFamily.js
import { useState, useCallback } from 'react';
import * as familyService from '../services/familyService';
import { getUserFriendlyError } from '../utils/errorHandling';
import { useAuth } from './useAuth';

/**
 * Hook for family data management
 * @returns {Object} Family methods and state
 */
export function useFamily() {
  const { currentUser } = useAuth();
  const [familyData, setFamilyData] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [availableFamilies, setAvailableFamilies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load family by ID
  const loadFamily = useCallback(async (familyId) => {
    setError(null);
    try {
      setLoading(true);
      // If no family ID is provided, try to load by user ID
      let data;
      if (familyId && typeof familyId === 'string') {
        data = await familyService.getFamilyById(familyId);
      } else if (currentUser) {
        data = await familyService.getFamilyById(currentUser.uid);

      } else {
        throw new Error("No family ID or user ID available");
      }
      
      if (data) {
        setFamilyData(data);
        setFamilyMembers(data.familyMembers || []);
      }
      
      return data;
    } catch (err) {
      const errorMessage = getUserFriendlyError(err);
      setError(errorMessage);
      console.error("Error loading family:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Load all families for current user
  const loadAllFamilies = useCallback(async () => {
    if (!currentUser) return [];
    
    setError(null);
    try {
      setLoading(true);
      const families = await familyService.getFamiliesByUserId(currentUser.uid);

      setAvailableFamilies(families);
      return families;
    } catch (err) {
      const errorMessage = getUserFriendlyError(err);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Create a new family
  const createFamily = useCallback(async (familyData) => {
    setError(null);
    try {
      setLoading(true);
      const newFamily = await familyService.createFamily(familyData);
      return newFamily;
    } catch (err) {
      const errorMessage = getUserFriendlyError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update family data
  const updateFamilyData = useCallback(async (data) => {
    if (!familyData?.familyId) {
      setError("No family selected");
      return false;
    }
    
    setError(null);
    try {
      setLoading(true);
      await familyService.updateFamily(familyData.familyId, data);

      
      // Update local state
      setFamilyData(prev => ({
        ...prev,
        ...data
      }));
      
      // Update family members if they were updated
      if (data.familyMembers) {
        setFamilyMembers(data.familyMembers);
      }
      
      return true;
    } catch (err) {
      const errorMessage = getUserFriendlyError(err);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [familyData]);

  // Select a family member
  const selectFamilyMember = useCallback((memberId) => {
    const member = familyMembers.find(m => m.id === memberId);
    if (member) {
      setSelectedMember(member);
      return member;
    }
    return null;
  }, [familyMembers]);

  // Reset error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    familyData,
    familyMembers,
    selectedMember,
    availableFamilies,
    loading,
    error,
    loadFamily,
    loadAllFamilies,
    createFamily,
    updateFamilyData,
    selectFamilyMember,
    clearError
  };
}