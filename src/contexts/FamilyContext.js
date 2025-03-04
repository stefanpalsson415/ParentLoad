// src/contexts/FamilyContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import DatabaseService from '../services/DatabaseService';

// Create the family context
const FamilyContext = createContext();

// Custom hook to use the family context
export function useFamily() {
  return useContext(FamilyContext);
}

// Provider component
export function FamilyProvider({ children }) {
  const { currentUser, familyData: initialFamilyData } = useAuth();
  
  const [familyId, setFamilyId] = useState(null);
  const [familyName, setFamilyName] = useState('');
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [surveyResponses, setSurveyResponses] = useState({});
  const [completedWeeks, setCompletedWeeks] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize family data from auth context
  useEffect(() => {
    if (initialFamilyData) {
      setFamilyId(initialFamilyData.familyId);
      setFamilyName(initialFamilyData.familyName || '');
      setFamilyMembers(initialFamilyData.familyMembers || []);
      setCompletedWeeks(initialFamilyData.completedWeeks || []);
      setCurrentWeek(initialFamilyData.currentWeek || 1);
      
      // Try to set the selected user to the current authenticated user
      if (currentUser) {
        const userMember = initialFamilyData.familyMembers?.find(
          member => member.id === currentUser.uid
        );
        if (userMember) {
          setSelectedUser(userMember);
        }
      }
      
      setLoading(false);
    } else if (!currentUser) {
      // Reset state if no user is logged in
      resetFamilyState();
      setLoading(false);
    }
  }, [initialFamilyData, currentUser]);

  // Reset all family state
  const resetFamilyState = () => {
    setFamilyId(null);
    setFamilyName('');
    setFamilyMembers([]);
    setSelectedUser(null);
    setSurveyResponses({});
    setCompletedWeeks([]);
    setCurrentWeek(1);
    setError(null);
  };

  // Select a family member
  const selectFamilyMember = (member) => {
    setSelectedUser(member);
    return member;
  };

  // Update member profile
  const updateMemberProfile = async (memberId, data) => {
    try {
      if (!familyId) throw new Error("No family ID available");
      
      const updatedMembers = familyMembers.map(member => 
        member.id === memberId ? { ...member, ...data } : member
      );
      
      setFamilyMembers(updatedMembers);
      
      // Save to Firebase
      await DatabaseService.saveFamilyData({ familyMembers: updatedMembers }, familyId);
      
      // Update selected user if that's the one being modified
      if (selectedUser && selectedUser.id === memberId) {
        setSelectedUser({ ...selectedUser, ...data });
      }
      
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Complete initial survey
  const completeInitialSurvey = async (memberId, responses) => {
    try {
      if (!familyId) throw new Error("No family ID available");
      
      // Update local state
      const updatedMembers = familyMembers.map(member => {
        if (member.id === memberId) {
          return {
            ...member,
            completed: true,
            completedDate: new Date().toISOString().split('T')[0]
          };
        }
        return member;
      });
      
      setFamilyMembers(updatedMembers);
      setSurveyResponses({ ...surveyResponses, ...responses });
      
      // Update Firebase
      await DatabaseService.updateMemberSurveyCompletion(familyId, memberId, 'initial', true);
      await DatabaseService.saveSurveyResponses(familyId, memberId, 'initial', responses);
      
      // Update selected user if that's the one completing the survey
      if (selectedUser && selectedUser.id === memberId) {
        setSelectedUser({
          ...selectedUser,
          completed: true,
          completedDate: new Date().toISOString().split('T')[0]
        });
      }
      
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Complete weekly check-in
  const completeWeeklyCheckIn = async (memberId, weekNumber, responses) => {
    try {
      if (!familyId) throw new Error("No family ID available");
      
      // Update local state
      const updatedMembers = familyMembers.map(member => {
        if (member.id === memberId) {
          const updatedWeeklyCompleted = [...(member.weeklyCompleted || [])];
          
          // Make sure array has enough elements
          while (updatedWeeklyCompleted.length < weekNumber) {
            updatedWeeklyCompleted.push({
              id: updatedWeeklyCompleted.length + 1,
              completed: false,
              date: null
            });
          }
          
          updatedWeeklyCompleted[weekNumber - 1] = {
            id: weekNumber,
            completed: true,
            date: new Date().toISOString().split('T')[0]
          };
          
          return {
            ...member,
            weeklyCompleted: updatedWeeklyCompleted
          };
        }
        return member;
      });
      
      setFamilyMembers(updatedMembers);
      
      // Save to Firebase
      await DatabaseService.updateMemberSurveyCompletion(
        familyId, 
        memberId, 
        `weekly-${weekNumber}`, 
        true
      );
      
      await DatabaseService.saveSurveyResponses(
        familyId,
        memberId,
        `weekly-${weekNumber}`,
        responses
      );
      
      // Check if all family members have completed this week
      const allCompleted = updatedMembers.every(member => 
        member.weeklyCompleted?.[weekNumber - 1]?.completed
      );
      
      // If all completed and not already in completedWeeks, update
      if (allCompleted && !completedWeeks.includes(weekNumber)) {
        const newCompletedWeeks = [...completedWeeks, weekNumber];
        setCompletedWeeks(newCompletedWeeks);
        setCurrentWeek(weekNumber + 1);
        
        // Update in Firebase
        await DatabaseService.saveFamilyData({
          completedWeeks: newCompletedWeeks,
          currentWeek: weekNumber + 1
        }, familyId);
      }
      
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Add comment to task
  const addTaskComment = async (taskId, text) => {
    try {
      if (!familyId || !selectedUser) throw new Error("No family ID or user selected");
      
      const comment = await DatabaseService.addTaskComment(
        familyId,
        taskId,
        selectedUser.id,
        selectedUser.name,
        text
      );
      
      return comment;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Update task completion
  const updateTaskCompletion = async (taskId, isCompleted) => {
    try {
      if (!familyId) throw new Error("No family ID available");
      
      await DatabaseService.updateTaskCompletion(familyId, taskId, isCompleted);
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Save family meeting notes
  const saveFamilyMeetingNotes = async (weekNumber, notes) => {
    try {
      if (!familyId) throw new Error("No family ID available");
      
      await DatabaseService.saveFamilyMeetingNotes(familyId, weekNumber, notes);
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Context value
  const value = {
    familyId,
    familyName,
    familyMembers,
    selectedUser,
    surveyResponses,
    completedWeeks,
    currentWeek,
    loading,
    error,
    selectFamilyMember,
    updateMemberProfile,
    completeInitialSurvey,
    completeWeeklyCheckIn,
    addTaskComment,
    updateTaskCompletion,
    saveFamilyMeetingNotes,
    resetFamilyState
  };

  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  );
}