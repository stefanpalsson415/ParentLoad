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
  const [familyPicture, setFamilyPicture] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [surveyResponses, setSurveyResponses] = useState({});
  const [completedWeeks, setCompletedWeeks] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [surveySchedule, setSurveySchedule] = useState({});
  const [weekHistory, setWeekHistory] = useState({}); // Store historical data for each week
  const [weekStatus, setWeekStatus] = useState({}); // Status of each week (survey complete, meeting complete, etc.)
  const [lastCompletedFullWeek, setLastCompletedFullWeek] = useState(0); // Last week that was fully completed (including meeting)

  // Initialize family data from auth context
  useEffect(() => {
    if (initialFamilyData) {
      setFamilyId(initialFamilyData.familyId);
      setFamilyName(initialFamilyData.familyName || '');
      setFamilyPicture(initialFamilyData.familyPicture || null);
      setFamilyMembers(initialFamilyData.familyMembers || []);
      setCompletedWeeks(initialFamilyData.completedWeeks || []);
      setCurrentWeek(initialFamilyData.currentWeek || 1);
      setSurveySchedule(initialFamilyData.surveySchedule || {});
      setSurveyResponses(initialFamilyData.surveyResponses || {});
      setWeekHistory(initialFamilyData.weekHistory || {});
      setWeekStatus(initialFamilyData.weekStatus || {});
      setLastCompletedFullWeek(initialFamilyData.lastCompletedFullWeek || 0);
      
      // Set document title with family name
      if (initialFamilyData.familyName) {
        document.title = `${initialFamilyData.familyName} Family AI Balancer`;
      }
      
      // Set favicon if family picture exists
      if (initialFamilyData.familyPicture) {
        updateFavicon(initialFamilyData.familyPicture);
      }
      
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

  // Update favicon helper function
  const updateFavicon = (imageUrl) => {
    let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = imageUrl;
    document.getElementsByTagName('head')[0].appendChild(link);
  };

  // Reset all family state
  const resetFamilyState = () => {
    setFamilyId(null);
    setFamilyName('');
    setFamilyPicture(null);
    setFamilyMembers([]);
    setSelectedUser(null);
    setSurveyResponses({});
    setCompletedWeeks([]);
    setCurrentWeek(1);
    setSurveySchedule({});
    setWeekHistory({});
    setWeekStatus({});
    setLastCompletedFullWeek(0);
    setError(null);
    
    // Reset document title
    document.title = 'ParentLoad';
    
    // Reset favicon
    let link = document.querySelector("link[rel*='icon']");
    if (link) {
      link.href = '/favicon.ico';
    }
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

  // Update family name
  const updateFamilyName = async (newName) => {
    try {
      if (!familyId) throw new Error("No family ID available");
      
      setFamilyName(newName);
      
      // Update document title
      document.title = `${newName} Family AI Balancer`;
      
      // Save to Firebase
      await DatabaseService.saveFamilyData({ familyName: newName }, familyId);
      
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Update family picture (favicon)
  const updateFamilyPicture = async (imageUrl) => {
    try {
      if (!familyId) throw new Error("No family ID available");
      
      setFamilyPicture(imageUrl);
      
      // Update favicon
      updateFavicon(imageUrl);
      
      // Save to Firebase
      await DatabaseService.saveFamilyData({ familyPicture: imageUrl }, familyId);
      
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Update survey schedule
  const updateSurveySchedule = async (weekNumber, dueDate) => {
    try {
      if (!familyId) throw new Error("No family ID available");
      
      const updatedSchedule = { ...surveySchedule, [weekNumber]: dueDate.toISOString() };
      setSurveySchedule(updatedSchedule);
      
      // Save to Firebase
      await DatabaseService.saveFamilyData({ surveySchedule: updatedSchedule }, familyId);
      
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
      
      // Store initial survey data in week history
      const allComplete = updatedMembers.every(member => member.completed);
      if (allComplete) {
        // Get all initial survey responses
        const initialResponses = await DatabaseService.getAllSurveyResponses(familyId, 'initial');
        
        // Create initial survey snapshot
        const initialSurveyData = {
          responses: initialResponses,
          completionDate: new Date().toISOString(),
          familyMembers: updatedMembers.map(m => ({
            id: m.id,
            name: m.name,
            role: m.role,
            completedDate: m.completedDate
          }))
        };
        
        // Update week history
        const updatedHistory = {
          ...weekHistory,
          initial: initialSurveyData
        };
        
        setWeekHistory(updatedHistory);
        
        // Save to Firebase
        await DatabaseService.saveFamilyData({ 
          weekHistory: updatedHistory
        }, familyId);
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
      
      console.log(`Completing weekly check-in for member ${memberId}, week ${weekNumber}`);
      
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
      
      // Check if all family members have completed this week's survey
      const allCompleted = updatedMembers.every(member => 
        member.weeklyCompleted?.[weekNumber - 1]?.completed
      );
      
      console.log(`All completed check for week ${weekNumber}:`, allCompleted);
      
      // If all completed and not already in completedWeeks, update
      if (allCompleted && !completedWeeks.includes(weekNumber)) {
        const newCompletedWeeks = [...completedWeeks, weekNumber];
        setCompletedWeeks(newCompletedWeeks);
        
        // Update week status to show surveys are complete
        const updatedStatus = {
          ...weekStatus,
          [weekNumber]: {
            ...weekStatus[weekNumber],
            surveysCompleted: true,
            surveyCompletionDate: new Date().toISOString()
          }
        };
        
        setWeekStatus(updatedStatus);
        
        // Save to Firebase
        await DatabaseService.saveFamilyData({
          completedWeeks: newCompletedWeeks,
          weekStatus: updatedStatus
        }, familyId);
        
        console.log(`Week ${weekNumber} surveys marked as completed`);
      }
      
      // Update selected user if that's the one completing the survey
      if (selectedUser && selectedUser.id === memberId) {
        const updatedWeeklyCompleted = [...(selectedUser.weeklyCompleted || [])];
        
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
        
        setSelectedUser({
          ...selectedUser,
          weeklyCompleted: updatedWeeklyCompleted
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error completing weekly check-in:", error);
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
      
      // Update week status to show meeting notes are saved
      const updatedStatus = {
        ...weekStatus,
        [weekNumber]: {
          ...weekStatus[weekNumber],
          meetingNotesCompleted: true,
          meetingNotesDate: new Date().toISOString()
        }
      };
      
      setWeekStatus(updatedStatus);
      
      // Save to Firebase
      await DatabaseService.saveFamilyData({
        weekStatus: updatedStatus
      }, familyId);
      
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Complete a week (after family meeting)
  const completeWeek = async (weekNumber) => {
    try {
      if (!familyId) throw new Error("No family ID available");
      
      console.log(`Completing week ${weekNumber}`);
      
      // 1. Get all data for this week
      const weekSurveyResponses = await DatabaseService.getAllSurveyResponses(familyId, `weekly-${weekNumber}`);
      const meetingNotes = await DatabaseService.getFamilyMeetingNotes(familyId, weekNumber);
      const taskData = await DatabaseService.getTasksForWeek(familyId, weekNumber);
      
      // 2. Create week history data
      const weekData = {
        weekNumber,
        responses: weekSurveyResponses,
        meetingNotes,
        tasks: taskData,
        familyMembers: familyMembers.map(m => ({
          id: m.id,
          name: m.name,
          role: m.role,
          completedDate: m.weeklyCompleted?.[weekNumber-1]?.date
        })),
        completionDate: new Date().toISOString()
      };
      
      // 3. Update week history
      const updatedHistory = {
        ...weekHistory,
        [`week${weekNumber}`]: weekData
      };
      
      setWeekHistory(updatedHistory);
      
      // 4. Update week status
      const updatedStatus = {
        ...weekStatus,
        [weekNumber]: {
          ...weekStatus[weekNumber],
          completed: true,
          completionDate: new Date().toISOString()
        }
      };
      
      setWeekStatus(updatedStatus);
      
      // 5. Update last completed full week
      setLastCompletedFullWeek(weekNumber);
      
      // 6. Update current week to the next week
      const nextWeek = weekNumber + 1;
      setCurrentWeek(nextWeek);
      
      // 7. Save to Firebase
      await DatabaseService.saveFamilyData({
        weekHistory: updatedHistory,
        weekStatus: updatedStatus,
        lastCompletedFullWeek: weekNumber,
        currentWeek: nextWeek
      }, familyId);
      
      console.log(`Week ${weekNumber} completed, moving to week ${nextWeek}`);
      
      return true;
    } catch (error) {
      console.error("Error completing week:", error);
      setError(error.message);
      throw error;
    }
  };

  // Get individual's survey responses
  const getMemberSurveyResponses = async (memberId, surveyType) => {
    try {
      if (!familyId) throw new Error("No family ID available");
      
      const responses = await DatabaseService.loadMemberSurveyResponses(familyId, memberId, surveyType);
      return responses;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Get historical data for a specific week
  const getWeekHistoryData = (weekNumber) => {
    if (weekNumber === 0) {
      return weekHistory.initial || null;
    } else {
      return weekHistory[`week${weekNumber}`] || null;
    }
  };

  // Get week status
  const getWeekStatus = (weekNumber) => {
    return weekStatus[weekNumber] || { 
      surveysCompleted: false,
      meetingNotesCompleted: false,
      completed: false
    };
  };

  // Context value
  const value = {
    familyId,
    familyName,
    familyPicture,
    familyMembers,
    selectedUser,
    surveyResponses,
    completedWeeks,
    currentWeek,
    surveySchedule,
    weekHistory,
    weekStatus,
    lastCompletedFullWeek,
    loading,
    error,
    selectFamilyMember,
    updateMemberProfile,
    updateFamilyName,
    updateFamilyPicture,
    updateSurveySchedule,
    completeInitialSurvey,
    completeWeeklyCheckIn,
    addTaskComment,
    updateTaskCompletion,
    saveFamilyMeetingNotes,
    completeWeek,
    getMemberSurveyResponses,
    getWeekHistoryData,
    getWeekStatus,
    resetFamilyState
  };

  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  );
}