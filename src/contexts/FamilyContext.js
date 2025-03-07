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
      const newTasks = generateNewWeekTasks(nextWeek, currentTasks, weekData.surveyResponses);
      
      console.log("Saving updates to Firebase...", {
        completedWeeks: updatedCompletedWeeks,
        currentWeek: nextWeek,
        lastCompletedFullWeek: newLastCompletedWeek,
        tasks: newTasks
      });
      
      // 9. Save to Firebase
      await DatabaseService.saveFamilyData({
        weekHistory: updatedHistory,
        weekStatus: updatedStatus,
        lastCompletedFullWeek: newLastCompletedWeek,
        currentWeek: nextWeek,
        completedWeeks: updatedCompletedWeeks,
        tasks: newTasks, // Save the new tasks for the new week
        updatedAt: new Date().toISOString()
      }, familyId);
      
      // 10. Update state only after successful Firebase update
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
  const generateNewWeekTasks = (weekNumber, previousTasks, previousResponses) => {
    // Create a template for new tasks
    const taskTemplates = [
      // Papa tasks
      {
        id: `${weekNumber}-1`,
        title: "Meal Planning",
        description: "Take charge of planning family meals for the week",
        assignedTo: "Papa",
        assignedToName: "Papa",
        completed: false,
        completedDate: null,
        comments: [],
        subTasks: [
          {
            id: `${weekNumber}-1-1`,
            title: "Create shopping list",
            description: "Make a complete shopping list for the week's meals",
            completed: false,
            completedDate: null
          },
          {
            id: `${weekNumber}-1-2`, 
            title: "Schedule meal prep",
            description: "Decide which days to prepare which meals",
            completed: false,
            completedDate: null
          },
          {
            id: `${weekNumber}-1-3`,
            title: "Cook together",
            description: "Plan one meal to cook together as a family",
            completed: false,
            completedDate: null
          }
        ]
      },
      {
        id: `${weekNumber}-3`,
        title: "Family Calendar Management",
        description: "Coordinate and maintain the family's schedule",
        assignedTo: "Papa",
        assignedToName: "Papa",
        completed: false,
        completedDate: null,
        comments: [],
        subTasks: [
          {
            id: `${weekNumber}-3-1`,
            title: "Review upcoming events",
            description: "Look ahead at the next two weeks of activities",
            completed: false,
            completedDate: null
          },
          {
            id: `${weekNumber}-3-2`,
            title: "Coordinate transportation",
            description: "Plan who will drive to each activity",
            completed: false,
            completedDate: null
          },
          {
            id: `${weekNumber}-3-3`,
            title: "Share with family",
            description: "Make sure everyone knows the schedule",
            completed: false,
            completedDate: null
          }
        ]
      },
      // Mama tasks
      {
        id: `${weekNumber}-2`,
        title: "School Communication",
        description: "Handle communication with schools and teachers",
        assignedTo: "Mama",
        assignedToName: "Mama",
        completed: false,
        completedDate: null,
        comments: [],
        subTasks: [
          {
            id: `${weekNumber}-2-1`,
            title: "Check school emails",
            description: "Review and respond to school communications",
            completed: false,
            completedDate: null
          },
          {
            id: `${weekNumber}-2-2`,
            title: "Update calendar",
            description: "Add school events to the family calendar",
            completed: false,
            completedDate: null
          },
          {
            id: `${weekNumber}-2-3`,
            title: "Coordinate with teachers",
            description: "Reach out to teachers with any questions",
            completed: false,
            completedDate: null
          }
        ]
      },
      {
        id: `${weekNumber}-4`,
        title: "Morning Routine Help",
        description: "Take lead on getting kids ready in the morning",
        assignedTo: "Mama",
        assignedToName: "Mama",
        completed: false,
        completedDate: null,
        comments: [],
        subTasks: [
          {
            id: `${weekNumber}-4-1`,
            title: "Coordinate breakfast",
            description: "Prepare or oversee breakfast for the kids",
            completed: false,
            completedDate: null
          },
          {
            id: `${weekNumber}-4-2`,
            title: "Ensure backpacks are ready",
            description: "Check that homework and supplies are packed",
            completed: false,
            completedDate: null
          },
          {
            id: `${weekNumber}-4-3`,
            title: "Manage departure time",
            description: "Keep track of time to ensure on-time departure",
            completed: false,
            completedDate: null
          }
        ]
      }
    ];
    
    // For future versions, analyze previous responses to intelligently suggest tasks
    // that address the most imbalanced areas, but for now, we'll just use the template
    
    // Add week-specific adjustments to task titles or descriptions based on week number
    const adjustedTasks = taskTemplates.map(task => {
      if (weekNumber === 2) {
        return {
          ...task,
          description: `${task.description} (Week ${weekNumber} Focus)`
        };
      } else if (weekNumber > 2) {
        return {
          ...task,
          title: `Week ${weekNumber}: ${task.title}`,
          description: `${task.description} (Building on previous weeks)`
        };
      }
      return task;
    });
    
    // Add AI-powered task that adapts based on the week
    const aiTask = {
      id: `${weekNumber}-ai-1`,
      title: `Week ${weekNumber} Balance Challenge`,
      description: "This AI-generated task adapts to your family's unique balance needs",
      assignedTo: weekNumber % 2 === 0 ? "Mama" : "Papa", // Alternate between parents
      assignedToName: weekNumber % 2 === 0 ? "Mama" : "Papa",
      isAIGenerated: true,
      completed: false,
      completedDate: null,
      comments: [],
      insight: `Your family survey data shows progress, but there's an opportunity to improve balance in ${
        weekNumber % 2 === 0 ? "emotional support tasks" : "household planning tasks"
      }.`,
      subTasks: [
        {
          id: `${weekNumber}-ai-1-1`,
          title: "Review your current balance",
          description: "Look at your family dashboard to understand your current state",
          completed: false,
          completedDate: null
        },
        {
          id: `${weekNumber}-ai-1-2`,
          title: `Take over a specific ${weekNumber % 2 === 0 ? "parental" : "household"} task`,
          description: "Choose an area where you can make an immediate difference",
          completed: false,
          completedDate: null
        },
        {
          id: `${weekNumber}-ai-1-3`,
          title: "Discuss the impact with your family",
          description: "Share how taking on this task is affecting your family dynamic",
          completed: false,
          completedDate: null
        }
      ]
    };
    
    // Add the AI task to the list
    return [...adjustedTasks, aiTask];
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