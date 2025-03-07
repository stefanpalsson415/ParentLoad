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
  const [taskRecommendations, setTaskRecommendations] = useState([]); // Store task recommendations

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
      setTaskRecommendations(initialFamilyData.tasks || []);
      
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
    setTaskRecommendations([]);
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
      
      // Also update any other related state like weekStatus
      const updatedStatus = {...weekStatus};
      if (updatedStatus[weekNumber]) {
        updatedStatus[weekNumber].scheduledDate = dueDate.toISOString();
      } else {
        updatedStatus[weekNumber] = {
          scheduledDate: dueDate.toISOString(),
          surveysCompleted: false,
          meetingNotesCompleted: false,
          completed: false
        };
      }
      setWeekStatus(updatedStatus);
      
      // Save to Firebase
      await DatabaseService.saveFamilyData({ 
        surveySchedule: updatedSchedule,
        weekStatus: updatedStatus
      }, familyId);
      
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
  const completeWeeklyCheckIn = async (memberId, weekNum, responses) => {
    try {
      if (!familyId) throw new Error("No family ID available");
      
      // Create a prefix for the responses to identify the week
      const prefixedResponses = {};
      Object.entries(responses).forEach(([key, value]) => {
        prefixedResponses[`week-${weekNum}-${key}`] = value;
      });
      
      // Update local state
      setSurveyResponses({
        ...surveyResponses,
        ...prefixedResponses
      });
      
      // Update member completion status
      const updatedMembers = familyMembers.map(member => {
        if (member.id === memberId) {
          const weeklyCompleted = [...(member.weeklyCompleted || [])];
          
          // Make sure there's an entry for each week up to the current one
          while (weeklyCompleted.length < weekNum) {
            weeklyCompleted.push({
              completed: false,
              date: null
            });
          }
          
          // Update the current week's status
          weeklyCompleted[weekNum - 1] = {
            completed: true,
            date: new Date().toISOString().split('T')[0]
          };
          
          return {
            ...member,
            weeklyCompleted
          };
        }
        return member;
      });
      
      setFamilyMembers(updatedMembers);
      
      // Update Firebase
      await DatabaseService.updateMemberSurveyCompletion(familyId, memberId, `weekly-${weekNum}`, true);
      await DatabaseService.saveSurveyResponses(familyId, memberId, `weekly-${weekNum}`, responses);
      await DatabaseService.saveFamilyData({ familyMembers: updatedMembers }, familyId);
      
      // Update selected user if that's the one completing the check-in
      if (selectedUser && selectedUser.id === memberId) {
        const weeklyCompleted = [...(selectedUser.weeklyCompleted || [])];
        
        while (weeklyCompleted.length < weekNum) {
          weeklyCompleted.push({
            completed: false,
            date: null
          });
        }
        
        weeklyCompleted[weekNum - 1] = {
          completed: true,
          date: new Date().toISOString().split('T')[0]
        };
        
        setSelectedUser({
          ...selectedUser,
          weeklyCompleted
        });
      }
      
      // Check if all members have completed this week's check-in
      const allCompleted = updatedMembers.every(member => 
        member.weeklyCompleted && 
        member.weeklyCompleted[weekNum - 1] && 
        member.weeklyCompleted[weekNum - 1].completed
      );
      
      if (allCompleted) {
        // Update week status
        const updatedStatus = {
          ...weekStatus,
          [weekNum]: {
            ...weekStatus[weekNum],
            surveysCompleted: true,
            surveyCompletedDate: new Date().toISOString()
          }
        };
        
        setWeekStatus(updatedStatus);
        
        // Save to Firebase
        await DatabaseService.saveFamilyData({
          weekStatus: updatedStatus
        }, familyId);
      }
      
      return {
        success: true,
        allCompleted
      };
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Complete a week (after family meeting)
  const completeWeek = async (weekNumber) => {
    try {
      if (!familyId) throw new Error("No family ID available");
      
      console.log(`Starting completion process for week ${weekNumber}`);
      
      // Create a backup of the current tasks
      const currentTasks = [...taskRecommendations];
      console.log("Current tasks for backup:", currentTasks.length);
      
      // 1. Get meeting notes if available
      let meetingNotes = {};
      try {
        meetingNotes = await DatabaseService.getFamilyMeetingNotes(familyId, weekNumber) || {};
        console.log("Meeting notes retrieved");
      } catch (notesError) {
        console.warn("Could not retrieve meeting notes, using empty object instead:", notesError);
      }
      
    
      const weekData = {
        weekNumber,
        familyMembers: familyMembers.map(m => ({
          id: m.id,
          name: m.name,
          role: m.role,
          completedDate: m.weeklyCompleted?.[weekNumber-1]?.date
        })),
        meetingNotes: meetingNotes,
        tasks: currentTasks,
        completionDate: new Date().toISOString(),
        surveyResponses: {}
      };

     // Collect ALL survey responses for this week
console.log(`Collecting survey responses for Week ${weekNumber}`);
console.log("Available responses:", Object.keys(surveyResponses).length);

// First, add all general survey responses (without week prefix)
Object.keys(surveyResponses).forEach(key => {
  // Include all question responses (both with and without week prefix)
  if (key.startsWith('q') || key.includes(`q`)) {
    weekData.surveyResponses[key] = surveyResponses[key];
  }
});

// Then add specific week-prefixed responses
Object.keys(surveyResponses).forEach(key => {
  if (key.includes(`week-${weekNumber}`) || 
      key.includes(`weekly-${weekNumber}`) || 
      (key.includes(`week${weekNumber}`) || 
      (weekNumber === 1 && (key.includes('weekly') || key.includes('week1'))))) {
    weekData.surveyResponses[key] = surveyResponses[key];
  }
});

console.log(`Collected ${Object.keys(weekData.surveyResponses).length} responses for Week ${weekNumber}`);


            
      console.log("Week data prepared:", weekData);
      
      // 3. Update week history
      const updatedHistory = {
        ...weekHistory,
        [`week${weekNumber}`]: weekData
      };
      
      // 4. Update week status
      const updatedStatus = {
        ...weekStatus,
        [weekNumber]: {
          ...weekStatus[weekNumber],
          completed: true,
          completionDate: new Date().toISOString()
        }
      };
      
      // 5. Update completed weeks (if not already included)
      let updatedCompletedWeeks = [...completedWeeks];
      if (!updatedCompletedWeeks.includes(weekNumber)) {
        updatedCompletedWeeks.push(weekNumber);
      }
      
      // 6. Update last completed full week
      const newLastCompletedWeek = Math.max(lastCompletedFullWeek, weekNumber);
      
      // 7. Calculate the next week number
      const nextWeek = weekNumber + 1;
      
      // 8. Generate fresh tasks for the new week
// Generate new tasks for the next week
const newTasks = generateNewWeekTasks(nextWeek, currentTasks, weekData.surveyResponses);

console.log("Saving updates to Firebase...", {
  completedWeeks: updatedCompletedWeeks,
  currentWeek: nextWeek,
  lastCompletedFullWeek: newLastCompletedWeek,
  tasks: newTasks
});

// Reset weekly completion status for the new week
const updatedMembers = familyMembers.map(member => {
  // Ensure the weeklyCompleted array exists and has an entry for the next week
  let weeklyCompleted = [...(member.weeklyCompleted || [])];
  
  // Add entries for any missing weeks including the new one
  while (weeklyCompleted.length < nextWeek) {
    weeklyCompleted.push({
      completed: false,
      date: null
    });
  }
  
  return {
    ...member,
    weeklyCompleted
  };
});

// 9. Save everything to Firebase
await DatabaseService.saveFamilyData({
  weekHistory: updatedHistory,
  weekStatus: updatedStatus,
  lastCompletedFullWeek: newLastCompletedWeek,
  currentWeek: nextWeek,
  completedWeeks: updatedCompletedWeeks,
  familyMembers: updatedMembers, // Update family members with reset completion status
  tasks: newTasks, // Save the new tasks for the new week
  surveySchedule: updatedSurveySchedule, // Add the updated schedule
  updatedAt: new Date().toISOString()
}, familyId);

// 10. Update all state variables
setWeekHistory(updatedHistory);
setWeekStatus(updatedStatus);
setLastCompletedFullWeek(newLastCompletedWeek);
setCurrentWeek(nextWeek);
setCompletedWeeks(updatedCompletedWeeks);
setFamilyMembers(updatedMembers); // Update family members state too
setTaskRecommendations(newTasks); // Update tasks with the new ones
      
      // 10. Update state only after successful Firebase update
      setSurveySchedule(updatedSurveySchedule); // Add this line

      setWeekHistory(updatedHistory);
      setWeekStatus(updatedStatus);
      setLastCompletedFullWeek(newLastCompletedWeek);
      setCurrentWeek(nextWeek);
      setCompletedWeeks(updatedCompletedWeeks);
      setTaskRecommendations(newTasks); // Update tasks with the new ones
      
      console.log(`Week ${weekNumber} completed successfully, moving to week ${nextWeek}`);
      
      return true;
    } catch (error) {
      console.error("Error completing week:", error);
      setError(error.message);
      throw error;
    }
  };

  // Helper function to generate new tasks for the next week
// Helper function to generate new tasks for the next week based on family data
const generateNewWeekTasks = (weekNumber, previousTasks, previousResponses) => {
  console.log(`Generating AI-driven tasks for Week ${weekNumber} based on family data`);
  
  // First, analyze the survey responses to find imbalances and patterns
  const categoryImbalances = analyzeImbalancesByCategory(previousResponses);
  console.log("Category imbalances detected:", categoryImbalances);
  
  // Track which areas have been addressed in previous weeks
  const previousFocusAreas = previousTasks
    .filter(task => task.isAIGenerated)
    .map(task => task.focusArea);
  
  // Determine priority areas to focus on this week
  const priorityAreas = determinePriorityAreas(categoryImbalances, previousFocusAreas);
  console.log("Priority areas for this week:", priorityAreas);
  
  // Generate tasks based on the family's specific needs
  const tasks = [];
  
  // Add Papa's tasks based on analysis results
  const papaFocusAreas = priorityAreas.filter(area => area.assignTo === "Papa");
  papaFocusAreas.slice(0, 2).forEach((area, index) => {
    tasks.push(generateTaskForArea(`${weekNumber}-${index*2+1}`, "Papa", area, weekNumber));
  });
  
  // Add Mama's tasks based on analysis results
  const mamaFocusAreas = priorityAreas.filter(area => area.assignTo === "Mama");
  mamaFocusAreas.slice(0, 2).forEach((area, index) => {
    tasks.push(generateTaskForArea(`${weekNumber}-${index*2+2}`, "Mama", area, weekNumber));
  });
  
  // Add AI-driven insight tasks for both parents
  const papaInsightTask = generateAIInsightTask(`${weekNumber}-ai-1`, "Papa", priorityAreas, weekNumber);
  const mamaInsightTask = generateAIInsightTask(`${weekNumber}-ai-2`, "Mama", priorityAreas, weekNumber);
  
  return [...tasks, papaInsightTask, mamaInsightTask];
};

// Helper function to analyze survey responses and identify imbalances
const analyzeImbalancesByCategory = (responses) => {
  // Categories we track
  const categories = {
    "Visible Household Tasks": { mama: 0, papa: 0, total: 0 },
    "Invisible Household Tasks": { mama: 0, papa: 0, total: 0 },
    "Visible Parental Tasks": { mama: 0, papa: 0, total: 0 },
    "Invisible Parental Tasks": { mama: 0, papa: 0, total: 0 }
  };
  
  // Count responses by category
  Object.entries(responses || {}).forEach(([key, value]) => {
    // Extract the question ID and find its category
    let category = null;
    
    // Handle different question ID formats
    if (key.includes('q')) {
      const questionId = key.includes('-') ? key.split('-').pop() : key;
      
      // Find the question in our question set
      const question = fullQuestionSet.find(q => q.id === questionId);
      if (question) {
        category = question.category;
      }
    }
    
    // Update counts if we found a valid category
    if (category && categories[category]) {
      categories[category].total++;
      if (value === 'Mama') {
        categories[category].mama++;
      } else if (value === 'Papa') {
        categories[category].papa++;
      }
    }
  });
  
  // Calculate imbalance scores and percentages
  const imbalances = [];
  
  Object.entries(categories).forEach(([category, counts]) => {
    if (counts.total > 0) {
      const mamaPercent = Math.round((counts.mama / counts.total) * 100);
      const papaPercent = Math.round((counts.papa / counts.total) * 100);
      const imbalanceScore = Math.abs(mamaPercent - papaPercent);
      
      imbalances.push({
        category,
        mamaPercent,
        papaPercent,
        imbalanceScore,
        // Determine who should take on more in this category
        assignTo: mamaPercent > papaPercent ? "Papa" : "Mama"
      });
    }
  });
  
  // If we don't have enough data, provide some default imbalances
  if (imbalances.length === 0 || imbalances.every(i => i.imbalanceScore === 0)) {
    return [
      { 
        category: "Invisible Household Tasks", 
        mamaPercent: 75, 
        papaPercent: 25, 
        imbalanceScore: 50, 
        assignTo: "Papa" 
      },
      { 
        category: "Invisible Parental Tasks", 
        mamaPercent: 70, 
        papaPercent: 30, 
        imbalanceScore: 40, 
        assignTo: "Papa" 
      },
      { 
        category: "Visible Household Tasks", 
        mamaPercent: 60, 
        papaPercent: 40, 
        imbalanceScore: 20, 
        assignTo: "Papa" 
      },
      { 
        category: "Visible Parental Tasks", 
        mamaPercent: 55, 
        papaPercent: 45, 
        imbalanceScore: 10, 
        assignTo: "Papa" 
      }
    ];
  }
  
  // Sort by imbalance score (highest first)
  return imbalances.sort((a, b) => b.imbalanceScore - a.imbalanceScore);
};

// Function to determine priority areas based on imbalances and previous focus
const determinePriorityAreas = (imbalances, previousFocusAreas) => {
  // First, break down into specific task areas for each category
  const taskAreas = [];
  
  imbalances.forEach(imbalance => {
    if (imbalance.category === "Visible Household Tasks") {
      taskAreas.push(
        { 
          ...imbalance, 
          focusArea: "Meal Planning",
          description: "Take charge of planning family meals for the week",
          insight: `Survey data shows ${imbalance.assignTo === "Papa" ? "Mama is handling" : "Papa is handling"} ${imbalance.assignTo === "Papa" ? imbalance.mamaPercent : imbalance.papaPercent}% of meal planning tasks.`
        },
        { 
          ...imbalance, 
          focusArea: "Cleaning Coordination",
          description: "Manage household cleaning responsibilities",
          insight: `Your family's data indicates an imbalance in household maintenance tasks.`
        },
        { 
          ...imbalance, 
          focusArea: "Home Maintenance",
          description: "Handle household repairs and upkeep",
          insight: `Survey results show that visible household tasks like repairs need better balance.`
        }
      );
    }
    else if (imbalance.category === "Invisible Household Tasks") {
      taskAreas.push(
        { 
          ...imbalance, 
          focusArea: "Family Calendar",
          description: "Manage the family's schedule and appointments",
          insight: `Data shows ${imbalance.assignTo === "Papa" ? "Mama is handling" : "Papa is handling"} ${imbalance.assignTo === "Papa" ? imbalance.mamaPercent : imbalance.papaPercent}% of calendar management.`
        },
        { 
          ...imbalance, 
          focusArea: "Financial Planning",
          description: "Take the lead on family budget and financial decisions",
          insight: `Your surveys indicate an imbalance in who handles financial planning.`
        },
        { 
          ...imbalance, 
          focusArea: "Household Supplies",
          description: "Monitor and restock household necessities",
          insight: `Data indicates one parent is handling most of the invisible household management.`
        }
      );
    }
    else if (imbalance.category === "Visible Parental Tasks") {
      taskAreas.push(
        { 
          ...imbalance, 
          focusArea: "Homework Support",
          description: "Take a more active role in children's schoolwork",
          insight: `Survey results show a ${imbalance.imbalanceScore}% imbalance in who helps with children's educational needs.`
        },
        { 
          ...imbalance, 
          focusArea: "Morning Routines",
          description: "Help children prepare for school in the mornings",
          insight: `Data indicates morning routines are managed predominantly by one parent.`
        },
        { 
          ...imbalance, 
          focusArea: "Bedtime Routines",
          description: "Take the lead on nighttime rituals and sleep schedules",
          insight: `Surveys show an imbalance in who manages children's bedtime routines.`
        }
      );
    }
    else if (imbalance.category === "Invisible Parental Tasks") {
      taskAreas.push(
        { 
          ...imbalance, 
          focusArea: "Emotional Support",
          description: "Provide more emotional guidance for the children",
          insight: `Family data shows ${imbalance.assignTo === "Papa" ? "Mama is handling" : "Papa is handling"} ${imbalance.assignTo === "Papa" ? imbalance.mamaPercent : imbalance.papaPercent}% of emotional support tasks.`
        },
        { 
          ...imbalance, 
          focusArea: "School Communication",
          description: "Manage interactions with teachers and school staff",
          insight: `Survey results indicate an imbalance in communication with schools.`
        },
        { 
          ...imbalance, 
          focusArea: "Social Planning",
          description: "Arrange playdates and social activities",
          insight: `Data shows social planning is primarily handled by one parent.`
        }
      );
    }
  });
  
  // Prioritization algorithm:
  // 1. Sort by imbalance score
  // 2. Boost areas not previously addressed
  // 3. Ensure both parents get assigned tasks
  
  // First, sort by imbalance score
  taskAreas.sort((a, b) => b.imbalanceScore - a.imbalanceScore);
  
  // Boost score for areas not recently addressed
  taskAreas.forEach(area => {
    // If this focus area hasn't been addressed in previous weeks, increase its priority
    if (!previousFocusAreas.includes(area.focusArea)) {
      area.priorityBoost = 20;
    } else {
      area.priorityBoost = 0;
    }
  });
  
  // Create final priority list based on imbalance + priority boost
  return taskAreas
    .sort((a, b) => (b.imbalanceScore + b.priorityBoost) - (a.imbalanceScore + a.priorityBoost))
    // Make sure we have tasks for both parents
    .filter((area, index, self) => {
      // Keep this area if:
      // 1. It's one of the first 4 highest priority areas, OR
      // 2. We need more tasks for this parent (ensure at least 2 for each)
      const papaTasks = self.filter(a => a.assignTo === "Papa" && self.indexOf(a) < index);
      const mamaTasks = self.filter(a => a.assignTo === "Mama" && self.indexOf(a) < index);
      
      return (
        index < 4 || 
        (area.assignTo === "Papa" && papaTasks.length < 2) || 
        (area.assignTo === "Mama" && mamaTasks.length < 2)
      );
    });
};

// Generate a normal task for a specific focus area
const generateTaskForArea = (taskId, assignedTo, areaData, weekNumber) => {
  // Create subtasks specific to this focus area
  const subTasks = [];
  
  if (areaData.focusArea === "Meal Planning") {
    subTasks.push(
      { title: "Create weekly menu", description: "Plan meals for each day of the week" },
      { title: "Make shopping list", description: "List all ingredients needed for the menu" },
      { title: "Coordinate with family", description: "Get input on meal preferences" }
    );
  } 
  else if (areaData.focusArea === "Family Calendar") {
    subTasks.push(
      { title: "Review upcoming events", description: "Look at the family's schedule for the next two weeks" },
      { title: "Update shared calendar", description: "Make sure all events are properly recorded" },
      { title: "Communicate schedule", description: "Make sure everyone knows what's happening" }
    );
  }
  else if (areaData.focusArea === "Emotional Support") {
    subTasks.push(
      { title: "Have one-on-one talks", description: "Check in with each child individually" },
      { title: "Notice emotional needs", description: "Pay attention to cues that children need support" },
      { title: "Validate feelings", description: "Acknowledge emotions without dismissing them" }
    );
  }
  else if (areaData.focusArea === "Homework Support") {
    subTasks.push(
      { title: "Create study space", description: "Set up a quiet area for homework" },
      { title: "Review assignments", description: "Know what homework is due and when" },
      { title: "Provide assistance", description: "Be available to help with questions" }
    );
  }
  else if (areaData.focusArea === "School Communication") {
    subTasks.push(
      { title: "Check school messages", description: "Review emails and notices from school" },
      { title: "Respond to teachers", description: "Reply to any communications from staff" },
      { title: "Share info with family", description: "Keep everyone informed about school news" }
    );
  }
  else {
    // Generic subtasks for any other focus area
    subTasks.push(
      { title: "Assess current situation", description: `Evaluate how ${areaData.focusArea} is currently handled` },
      { title: "Make an action plan", description: "Develop a strategy for taking more responsibility" },
      { title: "Implement changes", description: "Put your plan into action consistently" }
    );
  }
  
  // Map subtasks to the correct format with IDs
  const formattedSubTasks = subTasks.map((subTask, index) => ({
    id: `${taskId}-${index+1}`,
    title: subTask.title,
    description: subTask.description,
    completed: false,
    completedDate: null
  }));
  
  // Create the task with AI-driven insight
  return {
    id: taskId,
    title: `${weekNumber > 1 ? `Week ${weekNumber}: ` : ""}${areaData.focusArea}`,
    description: areaData.description,
    assignedTo: assignedTo,
    assignedToName: assignedTo,
    focusArea: areaData.focusArea, 
    category: areaData.category,
    completed: false,
    completedDate: null,
    comments: [],
    aiInsight: areaData.insight,
    subTasks: formattedSubTasks
  };
};

// Generate special AI insight task
const generateAIInsightTask = (taskId, assignedTo, priorityAreas, weekNumber) => {
  // Find relevant insights for this parent
  const parentAreas = priorityAreas.filter(area => area.assignTo === assignedTo);
  const otherParent = assignedTo === "Mama" ? "Papa" : "Mama";
  
  // Create insights based on the parent's highest priority areas
  let insight = `Our AI analysis shows that `;
  let title, description, taskType;
  
  if (parentAreas.length > 0) {
    const topArea = parentAreas[0];
    
    if (topArea.category.includes("Invisible")) {
      taskType = "invisible";
      insight += `there's a significant imbalance in ${topArea.category}. ${assignedTo} could take on more responsibility in this area to create better balance.`;
      title = `${assignedTo}'s Invisible Work Challenge`;
      description = `Address the imbalance in ${topArea.category.toLowerCase()} based on family survey data`;
    } else {
      taskType = "visible";
      insight += `${otherParent} is handling ${assignedTo === "Mama" ? topArea.papaPercent : topArea.mamaPercent}% of tasks in ${topArea.category}, creating an opportunity for more balanced sharing.`;
      title = `${assignedTo}'s Balance Challenge`;
      description = `Create better balance in ${topArea.category.toLowerCase()} with your partner`;
    }
  } else {
    // Fallback if no specific areas for this parent
    taskType = "general";
    insight += `maintaining open communication about workload is key to a balanced family life.`;
    title = `${assignedTo}'s Family Check-in`;
    description = `Have a conversation about how responsibilities are currently shared`;
  }
  
  // Create subtasks based on task type
  let subTasks = [];
  
  if (taskType === "invisible") {
    subTasks = [
      { title: "Identify invisible work", description: "Notice tasks that often go unrecognized or unappreciated" },
      { title: "Take initiative", description: "Proactively handle a task that's usually done by your partner" },
      { title: "Create a system", description: "Develop a way to ensure this task remains balanced" }
    ];
  } else if (taskType === "visible") {
    subTasks = [
      { title: "Observe current patterns", description: "Notice how visible tasks are currently divided" },
      { title: "Schedule shared work", description: "Plan time to work alongside your partner on tasks" },
      { title: "Trade responsibilities", description: "Switch who does which tasks occasionally" }
    ];
  } else {
    subTasks = [
      { title: "Schedule a discussion", description: "Set aside time to talk about family balance" },
      { title: "Express appreciation", description: "Acknowledge the work your partner does" },
      { title: "Plan adjustments", description: "Identify ways to improve balance going forward" }
    ];
  }
  
  // Format subtasks with IDs
  const formattedSubTasks = subTasks.map((subTask, index) => ({
    id: `${taskId}-${index+1}`,
    title: subTask.title,
    description: subTask.description,
    completed: false,
    completedDate: null
  }));
  
  // Create the AI insight task
  return {
    id: taskId,
    title: `Week ${weekNumber}: ${title}`,
    description: description,
    assignedTo: assignedTo,
    assignedToName: assignedTo,
    isAIGenerated: true,
    hiddenWorkloadType: parentAreas.length > 0 ? parentAreas[0].category : "Family Balance",
    completed: false,
    completedDate: null,
    comments: [],
    insight: insight,
    subTasks: formattedSubTasks
  };
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
      
      console.log(`Updating task ${taskId} completion to: ${isCompleted}`);
      
      const completedDate = isCompleted ? new Date().toISOString() : null;
      
      // Update the task in the database
      await DatabaseService.updateTaskCompletion(familyId, taskId, isCompleted, completedDate);
      
      // Also update local state so it persists between tab switches
      const updatedTasks = taskRecommendations.map(task => {
        if (task.id.toString() === taskId.toString()) {
          return {
            ...task,
            completed: isCompleted,
            completedDate: completedDate
          };
        }
        return task;
      });
      
      setTaskRecommendations(updatedTasks);
      
      // Save updated tasks to Firebase to ensure they persist
      await DatabaseService.saveFamilyData({
        tasks: updatedTasks,
        updatedAt: new Date().toISOString()
      }, familyId);
      
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Update subtask completion
  const updateSubtaskCompletion = async (taskId, subtaskId, isCompleted) => {
    try {
      if (!familyId) throw new Error("No family ID available");
      
      const completedDate = isCompleted ? new Date().toISOString() : null;
      
      // Update subtask in database
      await DatabaseService.updateSubtaskCompletion(familyId, taskId, subtaskId, isCompleted, completedDate);
      
      // Create a deep copy of the task array to ensure state updates properly
      const updatedTasks = JSON.parse(JSON.stringify(taskRecommendations));
      
      // Find and update the specific task and subtask
      const taskIndex = updatedTasks.findIndex(t => t.id.toString() === taskId.toString());
      if (taskIndex !== -1) {
        const task = updatedTasks[taskIndex];
        const subtaskIndex = task.subTasks.findIndex(st => st.id === subtaskId);
        
        if (subtaskIndex !== -1) {
          // Update the subtask
          task.subTasks[subtaskIndex].completed = isCompleted;
          task.subTasks[subtaskIndex].completedDate = completedDate;
          
          // Check if all subtasks are completed
          const allComplete = task.subTasks.every(st => st.completed);
          
          // Update main task status
          task.completed = allComplete;
          task.completedDate = allComplete ? new Date().toISOString() : null;
        }
      }
      
      // Update state with the modified copy
      setTaskRecommendations(updatedTasks);
      
      // Save updated tasks to Firebase
      await DatabaseService.saveFamilyData({
        tasks: updatedTasks,
        updatedAt: new Date().toISOString()
      }, familyId);
      
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

  // Load tasks for the current week
  const loadCurrentWeekTasks = async () => {
    try {
      if (!familyId) throw new Error("No family ID available");
      
      const tasks = await DatabaseService.getTasksForWeek(familyId, currentWeek);
      if (tasks && tasks.length > 0) {
        setTaskRecommendations(tasks);
      }
      return tasks;
    } catch (error) {
      console.error("Error loading current week tasks:", error);
      setError(error.message);
      return null;
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
    taskRecommendations,
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
    updateSubtaskCompletion,
    saveFamilyMeetingNotes,
    completeWeek,
    getMemberSurveyResponses,
    getWeekHistoryData,
    getWeekStatus,
    loadCurrentWeekTasks,
    resetFamilyState
  };

  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  );
}