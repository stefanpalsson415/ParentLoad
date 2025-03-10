import React, { useState, useEffect, useRef } from 'react';
import { Users, Calendar, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Sparkles, Brain, Info, Edit, CheckCircle2, Target } from 'lucide-react';
import { useFamily } from '../../../contexts/FamilyContext';
import { useSurvey } from '../../../contexts/SurveyContext';
import DatabaseService from '../../../services/DatabaseService';

// AI-powered task generation based on survey data
const analyzeTaskImbalances = (surveyResponses, fullQuestionSet) => {
  const categories = {
    "Visible Household": { mama: 0, papa: 0, total: 0, imbalance: 0 },
    "Invisible Household": { mama: 0, papa: 0, total: 0, imbalance: 0 },
    "Visible Parental": { mama: 0, papa: 0, total: 0, imbalance: 0 },
    "Invisible Parental": { mama: 0, papa: 0, total: 0, imbalance: 0 }
  };
  
  // Count responses by category and parent
  Object.entries(surveyResponses).forEach(([key, value]) => {
    if (!key.includes('q')) return; // Skip non-question keys
    
    // Extract question ID
    const questionId = key.includes('-') ? key.split('-').pop() : key;
    const question = fullQuestionSet.find(q => q.id === questionId);
    
    if (!question) return;
    
    const category = question.category;
    if (categories[category]) {
      categories[category].total++;
      if (value === 'Mama') categories[category].mama++;
      else if (value === 'Papa') categories[category].papa++;
    }
  });
  
  // Calculate imbalance scores for each category
  Object.keys(categories).forEach(category => {
    const data = categories[category];
    if (data.total === 0) return;
    
    const mamaPercent = (data.mama / data.total) * 100;
    const papaPercent = (data.papa / data.total) * 100;
    
    // Imbalance score - higher means more unequal
    data.imbalance = Math.abs(mamaPercent - papaPercent);
    data.mamaPercent = mamaPercent;
    data.papaPercent = papaPercent;
  });
  
  return categories;
};

// Fallback task generator for when no tasks are available
const generateTaskRecommendations = (weekNumber = 1) => {
  // Generate sample tasks when no tasks are available from other sources
  const taskPrefix = weekNumber ? `${weekNumber}-` : "";
  const sampleTasks = [
    {
      id: `${taskPrefix}1`,
      title: `${weekNumber ? `Week ${weekNumber}: ` : ""}Meal Planning`,
      description: `Take charge of planning family meals for the week${weekNumber ? ` (Week ${weekNumber} Focus)` : ""}`,
      assignedTo: "Papa",
      assignedToName: "Papa",
      taskType: "survey", // Marking this as survey-based
      completed: false,
      completedDate: null,
      comments: [],
      subTasks: [
        {
          id: `${taskPrefix}1-1`,
          title: "Create shopping list",
          description: "Make a complete shopping list for the week's meals",
          completed: false,
          completedDate: null,
          comments: []
        },
        {
          id: `${taskPrefix}1-2`,
          title: "Schedule meal prep",
          description: "Decide which days to prepare which meals",
          completed: false,
          completedDate: null,
          comments: []
        },
        {
          id: `${taskPrefix}1-3`,
          title: "Cook together",
          description: "Plan one meal to cook together as a family",
          completed: false,
          completedDate: null,
          comments: []
        }
      ]
    },
    {
      id: `${taskPrefix}2`,
      title: `${weekNumber ? `Week ${weekNumber}: ` : ""}Papa's AI Challenge`,
      description: `Discover and address hidden family workload patterns${weekNumber ? ` (Week ${weekNumber} Focus)` : ""}`,
      assignedTo: "Papa",
      assignedToName: "Papa",
      taskType: "ai", // Marking this as AI-based
      isAIGenerated: true,
      hiddenWorkloadType: "Invisible Parental Tasks",
      completed: false,
      completedDate: null,
      comments: [],
      insight: "Our AI analysis detected that Papa could help more with emotional support tasks.",
      subTasks: [
        {
          id: `${taskPrefix}2-1`,
          title: "Notice emotional needs",
          description: "Pay attention to when family members need support",
          completed: false,
          completedDate: null,
          comments: []
        },
        {
          id: `${taskPrefix}2-2`,
          title: "Have meaningful conversations",
          description: "Schedule one-on-one time with each child",
          completed: false,
          completedDate: null,
          comments: []
        },
        {
          id: `${taskPrefix}2-3`,
          title: "Create support system",
          description: "Develop a way to ensure ongoing emotional support",
          completed: false,
          completedDate: null,
          comments: []
        }
      ]
    },
    {
      id: `${taskPrefix}3`,
      title: `${weekNumber ? `Week ${weekNumber}: ` : ""}School Communication`,
      description: `Handle communication with schools and teachers${weekNumber ? ` (Week ${weekNumber} Focus)` : ""}`,
      assignedTo: "Mama",
      assignedToName: "Mama",
      taskType: "survey", // Marking this as survey-based
      completed: false,
      completedDate: null,
      comments: [],
      subTasks: [
        {
          id: `${taskPrefix}3-1`,
          title: "Check school emails",
          description: "Review and respond to school communications",
          completed: false,
          completedDate: null,
          comments: []
        },
        {
          id: `${taskPrefix}3-2`,
          title: "Update calendar",
          description: "Add school events to the family calendar",
          completed: false,
          completedDate: null,
          comments: []
        },
        {
          id: `${taskPrefix}3-3`,
          title: "Coordinate with teachers",
          description: "Reach out to teachers with any questions",
          completed: false,
          completedDate: null,
          comments: []
        }
      ]
    },
    {
      id: `${taskPrefix}4`,
      title: `${weekNumber ? `Week ${weekNumber}: ` : ""}Mama's AI Challenge`,
      description: `Discover and implement better household task delegation${weekNumber ? ` (Week ${weekNumber} Focus)` : ""}`,
      assignedTo: "Mama",
      assignedToName: "Mama",
      taskType: "ai", // Marking this as AI-based
      isAIGenerated: true,
      hiddenWorkloadType: "Invisible Household Tasks",
      completed: false,
      completedDate: null,
      comments: [],
      insight: "Our AI analysis found that Mama could benefit from sharing more household planning responsibilities.",
      subTasks: [
        {
          id: `${taskPrefix}4-1`,
          title: "Identify invisible tasks",
          description: "List household tasks that often go unnoticed",
          completed: false,
          completedDate: null,
          comments: []
        },
        {
          id: `${taskPrefix}4-2`,
          title: "Create delegation plan",
          description: "Determine which tasks can be shared with others",
          completed: false,
          completedDate: null,
          comments: []
        },
        {
          id: `${taskPrefix}4-3`,
          title: "Implement sharing system",
          description: "Put your plan into action and follow up",
          completed: false,
          completedDate: null,
          comments: []
        }
      ]
    }
  ];
  
  return sampleTasks;
};

const TasksTab = ({ onStartWeeklyCheckIn, onOpenFamilyMeeting }) => {
  const { 
    selectedUser, 
    familyMembers,
    currentWeek,
    completedWeeks,
    familyId,
    addTaskComment,
    updateTaskCompletion,
    updateSubtaskCompletion,
    surveySchedule,
    updateSurveySchedule,
    taskRecommendations: initialTaskRecommendations,
    loadCurrentWeekTasks,
    surveyResponses,
    getWeekHistoryData
  } = useFamily();

  const { fullQuestionSet } = useSurvey();
  
  // State to track when everyone completed initial survey
  const [allInitialComplete, setAllInitialComplete] = useState(false);
  const [daysUntilCheckIn, setDaysUntilCheckIn] = useState(6);
  const [canStartCheckIn, setCanStartCheckIn] = useState(false);
  
  // Calculate due date based on survey schedule if available
  const calculateDueDate = () => {
    if (surveySchedule && surveySchedule[currentWeek]) {
      return new Date(surveySchedule[currentWeek]);
    } else {
      // Default to 7 days from the start of the week
      // For a new week, this should be ~7 days from when the week started
      let date = new Date();
      
      // If we have completed the previous week, use that as reference
      if (completedWeeks.includes(currentWeek - 1)) {
        // Try to get completion date of previous week
        const prevWeekData = getWeekHistoryData(currentWeek - 1);
        if (prevWeekData && prevWeekData.completionDate) {
          date = new Date(prevWeekData.completionDate);
        }
      }
      
      date.setDate(date.getDate() + 7);
      return date;
    }
  };

  // Calculate days until check-in
  const calculateDaysUntilCheckIn = () => {
    const today = new Date();
    const dueDate = checkInDueDate;
    
    // Calculate difference in days
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };
  
  // State for dates
  const [checkInDueDate, setCheckInDueDate] = useState(calculateDueDate());
  const [currentDate] = useState(new Date());
  
  // State for date input
  const [checkInDueDateInput, setCheckInDueDateInput] = useState(
    checkInDueDate ? checkInDueDate.toISOString().split('T')[0] : ''
  );

  // Update input when due date changes
  useEffect(() => {
    if (checkInDueDate) {
      setCheckInDueDateInput(checkInDueDate.toISOString().split('T')[0]);
    }
  }, [checkInDueDate]);

  // Effect to recalculate check-in availability immediately after date changes
  useEffect(() => {
    // Update days until check-in
    setDaysUntilCheckIn(calculateDaysUntilCheckIn());
    
    // Determine if check-in can be started
    const canStart = calculateDaysUntilCheckIn() <= 2;
    setCanStartCheckIn(canStart);
  }, [checkInDueDateInput]); // Re-run when date input changes

  // Function to handle date update
  const handleUpdateCheckInDate = async () => {
    try {
      const newDate = new Date(checkInDueDateInput);
      if (isNaN(newDate.getTime())) {
        alert("Please enter a valid date");
        return;
      }
      
      await updateSurveySchedule(currentWeek, newDate);
      
      // Update local state for immediate UI refresh
      setCheckInDueDate(newDate);
      
      // Force recalculation of availability
      const newDaysUntil = Math.ceil((newDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      setDaysUntilCheckIn(Math.max(0, newDaysUntil));
      setCanStartCheckIn(newDaysUntil <= 2);
      
      // Alert in app rather than browser
      const alertDiv = document.createElement('div');
      alertDiv.className = 'fixed top-4 right-4 bg-green-100 border border-green-500 text-green-700 px-4 py-3 rounded z-50';
      alertDiv.innerHTML = 'Check-in date updated successfully!';
      document.body.appendChild(alertDiv);
      
      // Remove after 3 seconds
      setTimeout(() => {
        alertDiv.remove();
      }, 3000);
    } catch (error) {
      console.error("Error updating check-in date:", error);
      alert("Failed to update check-in date. Please try again.");
    }
  };
  
  // State for task recommendations
  const [taskRecommendations, setTaskRecommendations] = useState([]);
  
  // State for AI recommendations
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [isLoadingAiRecommendations, setIsLoadingAiRecommendations] = useState(false);
  
  // Task recommendations for the current week
  const [expandedTasks, setExpandedTasks] = useState({});
  
  // State for comment form
  const [commentTask, setCommentTask] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  // Kids tasks state
  const [kidTasksCompleted, setKidTasksCompleted] = useState({});
  const [taskReactions, setTaskReactions] = useState({});
  const [selectedTaskForEmoji, setSelectedTaskForEmoji] = useState(null);
  const [kidTaskComments, setKidTaskComments] = useState({});
  
  // Effect to update check-in status when survey schedule or current week changes
  useEffect(() => {
    // Update check-in due date
    setCheckInDueDate(calculateDueDate());
    
    // Update days until check-in
    setDaysUntilCheckIn(calculateDaysUntilCheckIn());
    
    // Determine if check-in can be started
    // Allow check-in if it's due within 2 days
    const canStart = calculateDaysUntilCheckIn() <= 2;
    setCanStartCheckIn(canStart);
    
  }, [surveySchedule, currentWeek]); // Re-run when schedule or week changes
  
  // Load tasks for the current week
  useEffect(() => {
    const loadTasks = async () => {
      try {
        console.log(`Loading tasks for Week ${currentWeek}, user:`, selectedUser?.name);
        console.log('Completed weeks:', completedWeeks);
        
        // Regular task loading logic for all weeks
        let tasks = [];
        
        if (familyId) {
          try {
            tasks = await DatabaseService.getTasksForWeek(familyId, currentWeek);
            console.log(`Tasks loaded from Firebase for Week ${currentWeek}:`, tasks?.length || 0);
            
            // Also load kid tasks from Firebase
            const familyData = await DatabaseService.loadFamilyData(familyId);
            if (familyData && familyData.kidTasks) {
              setKidTasksCompleted(familyData.kidTasks);
              console.log("Kid tasks loaded:", familyData.kidTasks);
            }
          } catch (error) {
            console.error("Error loading tasks:", error);
          }
        }
        
        if (tasks && tasks.length > 0) {
          setTaskRecommendations(tasks);
        } else {
          // Fallback to default tasks
          console.log("Using fallback tasks");
          setTaskRecommendations(generateTaskRecommendations(currentWeek));
        }
        
      } catch (error) {
        console.error(`Error in loadTasks for Week ${currentWeek}:`, error);
        setTaskRecommendations(generateTaskRecommendations(currentWeek));
      }
    };
    
    loadTasks();
    
  }, [familyId, currentWeek, completedWeeks]);

  // Effect to force reload tasks when component becomes visible again
  useEffect(() => {
    // Function to reload tasks from Firebase
    const reloadTasks = async () => {
      console.log(`Reloading tasks for Week ${currentWeek} from visibility change`);
      try {
        if (familyId) {
          const freshTasks = await DatabaseService.getTasksForWeek(familyId, currentWeek);
          console.log(`Fresh tasks loaded for Week ${currentWeek}:`, freshTasks?.length || 0);
          if (freshTasks && freshTasks.length > 0) {
            setTaskRecommendations(freshTasks);
          }
          
          // Also reload kid tasks
          const familyData = await DatabaseService.loadFamilyData(familyId);
          if (familyData && familyData.kidTasks) {
            setKidTasksCompleted(familyData.kidTasks);
          }
        }
      } catch (error) {
        console.error(`Error reloading tasks for Week ${currentWeek}:`, error);
      }
    };

    // Set up visibility change listener
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        reloadTasks();
      }
    };

    // Add event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also reload when the component mounts
    reloadTasks();

    // Clean up
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [familyId, currentWeek, surveyResponses, fullQuestionSet]); // <-- Updated dependencies

  // Load AI task recommendations
  const loadAiRecommendations = async () => {
    if (!familyId) return;
    
    setIsLoadingAiRecommendations(true);
    try {
      const recommendations = await DatabaseService.generateAITaskRecommendations(familyId);
      setAiRecommendations(recommendations);
    } catch (error) {
      console.error("Error loading AI recommendations:", error);
    } finally {
      setIsLoadingAiRecommendations(false);
    }
  };
  
  // Check if weekly check-in is completed for this week
  const weeklyCheckInCompleted = familyMembers.every(member => 
    member.weeklyCompleted && member.weeklyCompleted[currentWeek-1]?.completed
  );
  
  // Toggle task expansion
  const toggleTaskExpansion = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };
  
  // Check if enough tasks are completed for family meeting
  const countCompletedTasks = () => {
    let count = 0;
    taskRecommendations.forEach(task => {
      if (task.subTasks && task.subTasks.every(subtask => subtask.completed)) {
        count++;
      } else if (task.completed) {
        // For AI tasks without subtasks
        count++;
      }
    });
    
    // Also count completed kid tasks
    Object.values(kidTasksCompleted).forEach(taskData => {
      if (taskData?.completed) count += 0.5; // Kid tasks count as half a task
    });
    
    return count;
  };
  
  const enoughTasksCompleted = countCompletedTasks() >= 3;
  
  // Whether family meeting can be started
  const canStartFamilyMeeting = weeklyCheckInCompleted && enoughTasksCompleted;
  
  // Check if all subtasks are completed
  const areAllSubtasksComplete = (task) => {
    if (!task.subTasks || task.subTasks.length === 0) {
      return task.completed;
    }
    return task.subTasks.every(subtask => subtask.completed);
  };
  
  // Check if user can complete a task
  const canCompleteTask = (task) => {
    // Only a parent can complete tasks assigned to their role type (Mama or Papa)
    return selectedUser && 
           selectedUser.role === 'parent' && 
           (selectedUser.name === task.assignedToName || 
            selectedUser.roleType === task.assignedTo);
  };
  
  // Handle kid task completion with observations
  const handleCompleteKidTask = async (taskId, kidId, isCompleted, observations = null) => {
    try {
      // Allow any child to complete any task
      if (selectedUser && selectedUser.role === 'child') {
        const completedDate = isCompleted ? new Date().toISOString() : null;
        
        // Update local state
        setKidTasksCompleted(prev => ({
          ...prev,
          [taskId]: {
            completed: isCompleted,
            completedDate: completedDate,
            completedBy: selectedUser.id,
            completedByName: selectedUser.name,
            observations: observations
          }
        }));
        
        // Save to database
        if (familyId) {
          // Get existing kid tasks
          const familyData = await DatabaseService.loadFamilyData(familyId);
          const existingKidTasks = (familyData && familyData.kidTasks) || {};
          
          // Create updated kid tasks object
          const updatedKidTasks = {
            ...existingKidTasks,
            [taskId]: {
              completed: isCompleted,
              completedDate: completedDate,
              completedBy: selectedUser.id,
              completedByName: selectedUser.name,
              observations: observations
            }
          };
          
          await DatabaseService.saveFamilyData({
            kidTasks: updatedKidTasks
          }, familyId);
          
          console.log(`Kid task ${taskId} saved to database: ${isCompleted} by ${selectedUser.name}`);
        }
      } else if (selectedUser.role !== 'child') {
        alert("Only children can complete kid tasks.");
      }
    } catch (error) {
      console.error("Error saving kid task:", error);
      alert("There was an error saving your task. Please try again.");
    }
  };
  
  // Handle adding a comment to a task or subtask
  const handleAddComment = (taskId, subtaskId = null) => {
    if (subtaskId) {
      setCommentTask(`${taskId}-${subtaskId}`);
    } else {
      setCommentTask(taskId);
    }
    setCommentText('');
  };
  
  // Handle submitting a comment
  const handleSubmitComment = async () => {
    if (commentText.trim() === '' || isSubmittingComment) return;
    
    setIsSubmittingComment(true);
    
    try {
      // Save comment to database
      // In a real app this would use the correct ID structure to save to the database
      const result = await addTaskComment(commentTask, commentText);
      
      // Update local state
      if (commentTask.toString().includes('-')) {
        // It's a subtask comment
        const [taskId, subtaskId] = commentTask.split('-');
        
        const updatedTasks = taskRecommendations.map(task => {
          if (task.id.toString() === taskId) {
            return {
              ...task,
              subTasks: task.subTasks.map(subtask => {
                if (subtask.id === `${taskId}-${subtaskId}`) {
                  return {
                    ...subtask,
                    comments: [...(subtask.comments || []), {
                      id: result.id || Date.now(),
                      userId: selectedUser.id,
                      userName: selectedUser.name,
                      text: commentText,
                      timestamp: new Date().toLocaleString()
                    }]
                  };
                }
                return subtask;
              })
            };
          }
          return task;
        });
        
        setTaskRecommendations(updatedTasks);
      } else if (commentTask.toString().startsWith('kid-task')) {
        // It's a kid task comment
        setKidTaskComments(prev => ({
          ...prev,
          [commentTask]: [...(prev[commentTask] || []), {
            id: result.id || Date.now(),
            userId: selectedUser.id,
            userName: selectedUser.name,
            text: commentText,
            timestamp: new Date().toLocaleString()
          }]
        }));
      } else {
        // It's a main task comment
        const updatedTasks = taskRecommendations.map(task => {
          if (task.id.toString() === commentTask.toString()) {
            return {
              ...task,
              comments: [...(task.comments || []), {
                id: result.id || Date.now(),
                userId: selectedUser.id,
                userName: selectedUser.name,
                text: commentText,
                timestamp: new Date().toLocaleString()
              }]
            };
          }
          return task;
        });
        
        setTaskRecommendations(updatedTasks);
      }
      
      // Reset form
      setCommentTask(null);
      setCommentText('');
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("There was an error adding your comment. Please try again.");
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  // Open emoji picker
  const openEmojiPicker = (taskId) => {
    setSelectedTaskForEmoji(taskId);
  };

  // Add reaction/cheer to a task
  const addReaction = (taskId, emoji) => {
    // Create a new reaction
    const reaction = {
      emoji,
      from: selectedUser.name,
      timestamp: new Date().toISOString()
    };
    
    // Add it to the task's reactions
    setTaskReactions(prev => ({
      ...prev,
      [taskId]: [...(prev[taskId] || []), reaction]
    }));
    
    // Close the emoji picker
    setSelectedTaskForEmoji(null);
    
    // In a real implementation, you would save this to the database
    console.log(`Added reaction ${emoji} to task ${taskId} from ${selectedUser.name}`);
  };
  
  // Handle completion of AI task
  const handleCompleteAiTask = async (taskId, isCompleted) => {
    const task = aiRecommendations.find(t => t.id === taskId);
    
    // Check permissions - only assigned parent can complete tasks
    if (canCompleteTask(task)) {
      try {
        // Prepare updated task with completion status and timestamp
        const completedDate = isCompleted ? new Date().toISOString() : null;
        
        // Update task in database
        await DatabaseService.updateTaskCompletion(familyId, taskId, isCompleted, completedDate);
        
        // Update local state
        const updatedTasks = aiRecommendations.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              completed: isCompleted,
              completedDate: completedDate
            };
          }
          return task;
        });
        
        setAiRecommendations(updatedTasks);
      } catch (error) {
        console.error("Error updating AI task:", error);
        alert("There was an error updating the task. Please try again.");
      }
    } else if (selectedUser.role !== 'parent') {
      alert("Only parents can mark tasks as complete. Children can add comments instead.");
    } else {
      alert(`Only ${task.assignedTo} can mark this task as complete.`);
    }
  };
  
  // Handle subtask completion toggle
  const handleCompleteSubtask = async (taskId, subtaskId, isCompleted) => {
    const task = taskRecommendations.find(t => t.id.toString() === taskId.toString());
    
    // Check permissions - only assigned parent can complete tasks
    if (canCompleteTask(task)) {
      try {
        console.log(`Completing subtask ${subtaskId} of task ${taskId}, completed: ${isCompleted} for Week ${currentWeek}`);
        
        // Create completion timestamp
        const completedDate = isCompleted ? new Date().toISOString() : null;
        
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
            const allSubtasksComplete = task.subTasks.every(st => st.completed);
            
            // Update main task's completion based on subtasks
            task.completed = allSubtasksComplete;
            task.completedDate = allSubtasksComplete ? new Date().toISOString() : null;
          }
        }
        
        // Update state immediately with the modified copy
        setTaskRecommendations(updatedTasks);
        
        // CRITICAL CHANGES: Save to both context and directly to Firebase
        // Save directly to Firebase first for immediate persistence
        if (familyId) {
          console.log(`Saving updated tasks directly to Firebase for Week ${currentWeek}`);
          try {
            await DatabaseService.saveFamilyData({
              tasks: updatedTasks,
              updatedAt: new Date().toISOString()
            }, familyId);
            console.log("Tasks saved to Firebase successfully");
          } catch (firebaseError) {
            console.error("Error saving to Firebase directly:", firebaseError);
            // Alert user of error instead of silently failing
            alert("Error saving your progress. Please try again.");
            return; // Stop execution if Firebase save fails
          }
        }
        
        // Also update through context method as backup
        try {
          await updateSubtaskCompletion(taskId, subtaskId, isCompleted);
          console.log("Tasks also updated via context method");
        } catch (contextError) {
          console.error("Error updating through context:", contextError);
          // Not alerting here since Firebase save already succeeded
        }
        
      } catch (error) {
        console.error("Error updating subtask:", error);
        alert("There was an error updating the subtask. Please try again.");
      }
    } else if (selectedUser.role !== 'parent') {
      alert("Only parents can mark tasks as complete. Children can add comments instead.");
    } else {
      alert(`Only ${task.assignedTo} can mark this task as complete.`);
    }
  };
  
  // Format date for display
  const formatDate = (date) => {
    if (!date) return "Not scheduled yet";
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return dateObj.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };
  
  // Render comments section
  const renderComments = (comments) => {
    if (!comments || comments.length === 0) return null;
    
    return (
      <div className="mt-3 pt-3 border-t">
        <h5 className="text-sm font-medium mb-2">Comments:</h5>
        <div className="space-y-2">
          {comments.map(comment => (
            <div key={comment.id} className="bg-gray-50 p-2 rounded text-sm">
              <div className="font-medium">{comment.userName}:</div>
              <p>{comment.text}</p>
              <div className="text-xs text-gray-500 mt-1">{comment.timestamp}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render comment form
  const renderCommentForm = (id) => {
    if (commentTask !== id) return null;
    
    return (
      <div className="mt-3 pt-3 border-t">
        <h5 className="text-sm font-medium mb-2">Add a Comment:</h5>
        <textarea
          className="w-full border rounded p-2 text-sm"
          rows="2"
          placeholder="Write your comment here..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          disabled={isSubmittingComment}
        ></textarea>
        <div className="flex justify-end mt-2 space-x-2">
          <button
            className="px-3 py-1 text-sm border rounded"
            onClick={() => setCommentTask(null)}
            disabled={isSubmittingComment}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded"
            onClick={handleSubmitComment}
            disabled={isSubmittingComment || !commentText.trim()}
          >
            {isSubmittingComment ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3">Week {currentWeek} Focus</h3>
        <p className="text-sm text-gray-600 mb-4">
          Suggested tasks to help balance your family's workload
        </p>
        
        {/* Weekly Check-in Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-3">Weekly Check-in Status</h3>
          <div className="bg-blue-50 p-4 rounded">
            <div className="flex items-center mb-3">
              <Calendar className="text-blue-600 mr-2" size={18} />
              <p className="text-sm">
                <span className="font-medium">Due by:</span> {formatDate(checkInDueDate)}
              </p>
            </div>
            
            {/* Date editor added from Surveys tab */}
            <div className="flex items-center mt-2 mb-3">
              <span className="text-sm mr-2">Change date:</span>
              <input
                type="date"
                value={checkInDueDateInput}
                onChange={(e) => setCheckInDueDateInput(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              />
              <button
                onClick={handleUpdateCheckInDate}
                className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200"
              >
                Update
              </button>
            </div>
            
            {!canStartCheckIn && (
              <div className="flex items-center mb-3 text-amber-700 bg-amber-50 p-2 rounded">
                <AlertCircle size={16} className="mr-2" />
                <p className="text-sm">
                  Weekly check-in will be available in {daysUntilCheckIn} {daysUntilCheckIn === 1 ? 'day' : 'days'}
                </p>
              </div>
            )}
            
            <p className="text-sm mb-3">
              All family members need to complete the weekly check-in to update your progress
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Completed:</span>
              <div className="flex gap-1">
                {familyMembers.map(member => (
                  <div 
                    key={member.id} 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                      member.weeklyCompleted && member.weeklyCompleted[currentWeek-1]?.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                    }`}
                    title={`${member.name}: ${member.weeklyCompleted && member.weeklyCompleted[currentWeek-1]?.completed ? 'Completed' : 'Not completed'}`}
                  >
                    {member.weeklyCompleted && member.weeklyCompleted[currentWeek-1]?.completed ? '✓' : member.name.charAt(0)}
                  </div>
                ))}
              </div>
            </div>
          </div>
            
          <div className="mt-4 text-center">
            <button 
              className={`px-4 py-2 rounded ${
                selectedUser.weeklyCompleted && selectedUser.weeklyCompleted[currentWeek-1]?.completed
                  ? 'bg-green-500 text-white cursor-not-allowed'
                  : canStartCheckIn 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={() => {
                if (selectedUser.weeklyCompleted && selectedUser.weeklyCompleted[currentWeek-1]?.completed) {
                  alert("You've already completed this week's check-in!");
                } else if (canStartCheckIn) {
                  onStartWeeklyCheckIn();
                }
              }}
              disabled={!canStartCheckIn || (selectedUser.weeklyCompleted && selectedUser.weeklyCompleted[currentWeek-1]?.completed)}
            >
              {selectedUser.weeklyCompleted && selectedUser.weeklyCompleted[currentWeek-1]?.completed 
                ? 'You Completed This Check-in' 
                : canStartCheckIn 
                  ? 'Start Weekly Check-in' 
                  : 'Check-in Not Yet Available'}
            </button>
          </div>
        </div>
        
        {/* AI Task Intelligence Section */}
        {aiRecommendations && aiRecommendations.length > 0 && (
          <div className="border-2 border-purple-300 rounded-lg p-4 mb-6 bg-gradient-to-r from-purple-100 to-blue-100 shadow-md">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Brain size={20} className="text-purple-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold flex items-center">
                  AI Task Intelligence
                  <Sparkles size={16} className="ml-2 text-amber-500" />
                </h3>
                <p className="text-sm text-gray-600">
                  Our AI has detected hidden workload imbalances your family might not have noticed
                </p>
              </div>
            </div>
            
            <div className="space-y-4 pl-4">
              {aiRecommendations.map(task => (
                <div 
                  key={task.id} 
                  className="border-2 border-purple-400 rounded-lg overflow-hidden shadow-lg relative"
                  style={{
                    background: task.completed ? '#f0fdf4' : 'linear-gradient(to right, #f5f3ff, #eef2ff)'
                  }}
                >
                  {/* Add a special badge for AI tasks */}
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1 rounded-bl-lg text-sm font-bold flex items-center">
                      <Brain size={14} className="mr-1" />
                      AI Powered
                    </div>
                  </div>
                  
                  <div className="p-4 flex items-start">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      task.completed ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                    }`}>
                      {task.completed ? <CheckCircle size={16} /> : <Sparkles size={16} />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-lg">{task.title}</h4>
                          <div className="flex items-center text-xs text-purple-600 mt-1 mb-2">
                            <Brain size={12} className="mr-1" />
                            <span>AI-detected {task.hiddenWorkloadType} imbalance</span>
                          </div>
                          <p className="text-gray-600 mt-1">
                            {task.description}
                          </p>
                          
                          {/* Show completion date if task is completed */}
                          {task.completed && task.completedDate && (
                            <p className="text-sm text-green-600 mt-2">
                              Completed on {formatDate(task.completedDate)}
                            </p>
                          )}
                        </div>
                        
                        {/* Assigned to label */}
                        <div className="ml-4 flex-shrink-0">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            task.assignedTo === 'Mama' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                          }`}>
                            For {task.assignedTo}
                          </span>
                        </div>
                      </div>
                      
                      {/* AI Insight Box - Enhanced version */}
                      <div className="bg-purple-100 p-4 rounded-lg mt-3 border border-purple-200">
                        <div className="flex items-start">
                          <Info size={20} className="text-purple-600 mr-3 flex-shrink-0 mt-0.5" />
                          <div>
                            <h5 className="font-bold text-purple-900 text-sm mb-1">Why This Task Matters:</h5>
                            <p className="text-sm text-purple-800">{task.insight}</p>
                            <p className="text-xs text-purple-700 mt-2">
                              Our AI analyzed your family's survey data and identified this task as important for improving balance.
                              This was selected because your responses showed a significant imbalance in {task.hiddenWorkloadType.toLowerCase()}.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Comments */}
                      {renderComments(task.comments)}
                      
                      {/* Comment form */}
                      {renderCommentForm(task.id)}
                      
                      {/* Action buttons */}
                      {!commentTask && (
                        <div className="mt-4 flex justify-end space-x-2">
                          <button
                            className="px-3 py-1 text-sm rounded border"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddComment(task.id);
                            }}
                          >
                            Comment
                          </button>
                          
                          {canCompleteTask(task) && (
                            <button
                              className={`px-3 py-1 text-sm rounded ${
                                task.completed 
                                  ? 'bg-gray-200 text-gray-800' 
                                  : 'bg-green-500 text-white'
                              }`}
                              onClick={() => handleCompleteAiTask(task.id, !task.completed)}
                            >
                              {task.completed ? 'Completed' : 'Mark as Done'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
          
        <div className="space-y-4">
          {/* Papa's Tasks */}
          <div className="border-l-4 border-blue-500 p-2">
            <h4 className="font-medium mb-2 text-lg">Papa's Tasks</h4>
            <div className="space-y-3">
              {taskRecommendations
                .filter(task => task.assignedTo === "Papa")
                .map(task => (
                  <div key={task.id} className={`rounded-lg border ${areAllSubtasksComplete(task) ? 'bg-green-50' : 'bg-white'}`}>
                    {/* Main task header */}
                    <div 
                      className="p-4 flex items-start cursor-pointer"
                      onClick={() => toggleTaskExpansion(task.id)}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        areAllSubtasksComplete(task) ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {areAllSubtasksComplete(task) ? '✓' : task.id}
                      </div>
                        
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-lg">{task.title}</h4>
                          
                          {/* Task type label */}
                          <div className="flex items-center gap-2">
                            {task.taskType === 'ai' && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center">
                                <Brain size={10} className="mr-1" />
                                AI Insight
                              </span>
                            )}
                            {task.taskType === 'survey' && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center">
                                <CheckCircle2 size={10} className="mr-1" />
                                Survey Data
                              </span>
                            )}
                            {task.taskType === 'meeting' && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full flex items-center">
                                <Users size={10} className="mr-1" />
                                Family Meeting
                              </span>
                            )}
                            {task.taskType === 'goal' && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                                <Target size={10} className="mr-1" />
                                Family Goal
                              </span>
                            )}
                            <div>
                              {expandedTasks[task.id] ? (
                                <ChevronUp size={20} className="text-gray-500" />
                              ) : (
                                <ChevronDown size={20} className="text-gray-500" />
                              )}
                            </div>
                          </div>
                        </div>
                          
                        <div className="mt-2">
                          <p className="text-gray-600">
                            {task.description}
                          </p>
                          
                          {/* Show completion date if task is completed */}
                          {task.completed && task.completedDate && (
                            <p className="text-sm text-green-600 mt-2">
                              Completed on {formatDate(task.completedDate)}
                            </p>
                          )}
                        </div>
                        
                        {/* AI Insight Box for AI tasks */}
                        {task.taskType === 'ai' && task.insight && (
                          <div className="bg-purple-100 p-4 rounded-lg mt-3 border border-purple-200">
                            <div className="flex items-start">
                              <Info size={20} className="text-purple-600 mr-3 flex-shrink-0 mt-0.5" />
                              <div>
                                <h5 className="font-bold text-purple-900 text-sm mb-1">Why This Task Matters:</h5>
                                <p className="text-sm text-purple-800">{task.insight}</p>
                                <p className="text-xs text-purple-700 mt-2">
                                  Our AI analyzed your family's survey data and identified this task as important for improving balance.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Main task comments */}
                        {renderComments(task.comments)}
                        
                        {/* Main task comment form */}
                        {renderCommentForm(task.id.toString())}
                        
                        {/* Action buttons for main task */}
                        {!commentTask && (
                          <div className="mt-4 flex justify-end">
                            <button
                              className="px-3 py-1 text-sm rounded border"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddComment(task.id.toString());
                              }}
                            >
                              Comment
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Subtasks */}
                    {expandedTasks[task.id] && (
                      <div className="border-t">
                        <div className="p-4">
                          <h5 className="font-medium text-sm mb-3">Action Steps:</h5>
                          <div className="space-y-4 pl-4">
                            {task.subTasks.map(subtask => (
                              <div key={subtask.id} className={`border rounded-md p-3 ${subtask.completed ? 'bg-green-50' : 'bg-white'}`}>
                                <div className="flex items-start">
                                  <div className="flex-shrink-0 mr-3">
                                    {canCompleteTask(task) ? (
                                      <button
                                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                          subtask.completed 
                                            ? 'bg-green-100 text-green-600 border border-green-300' 
                                            : 'bg-white border border-gray-300'
                                        }`}
                                        onClick={() => handleCompleteSubtask(task.id, subtask.id, !subtask.completed)}
                                      >
                                        {subtask.completed && <CheckCircle size={16} />}
                                      </button>
                                    ) : (
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                        subtask.completed 
                                          ? 'bg-green-100 text-green-600' 
                                          : 'bg-gray-100'
                                      }`}>
                                        {subtask.completed && <CheckCircle size={16} />}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex-1">
                                    <h6 className="font-medium text-sm">{subtask.title}</h6>
                                    <p className="text-sm text-gray-600 mt-1">{subtask.description}</p>
                                    
                                    {/* Show completion date if subtask is completed */}
                                    {subtask.completed && subtask.completedDate && (
                                      <p className="text-xs text-green-600 mt-2">
                                        Completed on {formatDate(subtask.completedDate)}
                                      </p>
                                    )}
                                    
                                    {/* Subtask comments */}
                                    {renderComments(subtask.comments)}
                                    
                                    {/* Subtask comment form */}
                                    {renderCommentForm(subtask.id)}
                                    
                                    {/* Action buttons for subtask */}
                                    {!commentTask && (
                                      <div className="mt-3 flex justify-end">
                                        <button
                                          className="px-2 py-1 text-xs rounded border"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddComment(task.id, subtask.id.split('-')[1]);
                                          }}
                                        >
                                          Comment
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
          
          {/* Mama's Tasks */}
          <div className="border-l-4 border-purple-500 p-2">
            <h4 className="font-medium mb-2 text-lg">Mama's Tasks</h4>
            <div className="space-y-3">
              {taskRecommendations
                .filter(task => task.assignedTo === "Mama")
                .map(task => (
                  <div key={task.id} className={`rounded-lg border ${areAllSubtasksComplete(task) ? 'bg-green-50' : 'bg-white'}`}>
                    {/* Main task header */}
                    <div 
                      className="p-4 flex items-start cursor-pointer"
                      onClick={() => toggleTaskExpansion(task.id)}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        areAllSubtasksComplete(task) ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                      }`}>
                        {areAllSubtasksComplete(task) ? '✓' : task.id}
                      </div>
                        
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-lg">{task.title}</h4>
                          
                          {/* Task type label */}
                          <div className="flex items-center gap-2">
                            {task.taskType === 'ai' && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center">
                                <Brain size={10} className="mr-1" />
                                AI Insight
                              </span>
                            )}
                            {task.taskType === 'survey' && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center">
                                <CheckCircle2 size={10} className="mr-1" />
                                Survey Data
                              </span>
                            )}
                            {task.taskType === 'meeting' && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full flex items-center">
                                <Users size={10} className="mr-1" />
                                Family Meeting
                              </span>
                            )}
                            {task.taskType === 'goal' && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                                <Target size={10} className="mr-1" />
                                Family Goal
                              </span>
                            )}
                            <div>
                              {expandedTasks[task.id] ? (
                                <ChevronUp size={20} className="text-gray-500" />
                              ) : (
                                <ChevronDown size={20} className="text-gray-500" />
                              )}
                            </div>
                          </div>
                        </div>
                          
                        <div className="mt-2">
                          <p className="text-gray-600">
                            {task.description}
                          </p>
                          
                          {/* Show completion date if task is completed */}
                          {task.completed && task.completedDate && (
                            <p className="text-sm text-green-600 mt-2">
                              Completed on {formatDate(task.completedDate)}
                            </p>
                          )}
                        </div>
                        
                        {/* AI Insight Box for AI tasks */}
                        {task.taskType === 'ai' && task.insight && (
                          <div className="bg-purple-100 p-4 rounded-lg mt-3 border border-purple-200">
                            <div className="flex items-start">
                              <Info size={20} className="text-purple-600 mr-3 flex-shrink-0 mt-0.5" />
                              <div>
                                <h5 className="font-bold text-purple-900 text-sm mb-1">Why This Task Matters:</h5>
                                <p className="text-sm text-purple-800">{task.insight}</p>
                                <p className="text-xs text-purple-700 mt-2">
                                  Our AI analyzed your family's survey data and identified this task as important for improving balance.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Main task comments */}
                        {renderComments(task.comments)}
                        
                        {/* Main task comment form */}
                        {renderCommentForm(task.id.toString())}
                        
                        {/* Action buttons for main task */}
                        {!commentTask && (
                          <div className="mt-4 flex justify-end">
                            <button
                              className="px-3 py-1 text-sm rounded border"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddComment(task.id.toString());
                              }}
                            >
                              Comment
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Subtasks */}
                    {expandedTasks[task.id] && (
                      <div className="border-t">
                        <div className="p-4">
                          <h5 className="font-medium text-sm mb-3">Action Steps:</h5>
                          <div className="space-y-4 pl-4">
                            {task.subTasks.map(subtask => (
                              <div key={subtask.id} className={`border rounded-md p-3 ${subtask.completed ? 'bg-green-50' : 'bg-white'}`}>
                                <div className="flex items-start">
                                  <div className="flex-shrink-0 mr-3">
                                    {canCompleteTask(task) ? (
                                      <button
                                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                          subtask.completed 
                                            ? 'bg-green-100 text-green-600 border border-green-300' 
                                            : 'bg-white border border-gray-300'
                                        }`}
                                        onClick={() => handleCompleteSubtask(task.id, subtask.id, !subtask.completed)}
                                      >
                                        {subtask.completed && <CheckCircle size={16} />}
                                      </button>
                                    ) : (
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                        subtask.completed 
                                          ? 'bg-green-100 text-green-600' 
                                          : 'bg-gray-100'
                                      }`}>
                                        {subtask.completed && <CheckCircle size={16} />}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex-1">
                                    <h6 className="font-medium text-sm">{subtask.title}</h6>
                                    <p className="text-sm text-gray-600 mt-1">{subtask.description}</p>
                                    
                                    {/* Show completion date if subtask is completed */}
                                    {subtask.completed && subtask.completedDate && (
                                      <p className="text-xs text-green-600 mt-2">
                                        Completed on {formatDate(subtask.completedDate)}
                                      </p>
                                    )}
                                    
                                    {/* Subtask comments */}
                                    {renderComments(subtask.comments)}
                                    
                                    {/* Subtask comment form */}
                                    {renderCommentForm(subtask.id)}
                                    
                                    {/* Action buttons for subtask */}
                                    {!commentTask && (
                                      <div className="mt-3 flex justify-end">
                                        <button
                                          className="px-2 py-1 text-xs rounded border"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddComment(task.id, subtask.id.split('-')[1]);
                                          }}
                                        >
                                          Comment
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
          
          {/* Kids' Tasks */}
          <div className="border-l-4 border-amber-500 p-2 mt-6">
            <h4 className="font-medium mb-2 text-lg flex items-center">
              <span className="mr-2">🌟</span> Kids' Tasks <span className="ml-2">🌟</span>
            </h4>
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg mb-4 text-sm">
              <p>Hey kids! These fun activities help your family work better as a team. Complete them to earn stars!</p>
            </div>
            <div className="space-y-3">
              {/* First Kid Task - Helper Task */}
              <div className="rounded-lg border bg-white">
                <div 
                  className="p-4 flex items-start cursor-pointer"
                  onClick={() => toggleTaskExpansion('kid-task-1')}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-amber-100 text-amber-600">
                    🏆
                  </div>
                    
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-lg">Family Helper Challenge</h4>
                      <div>
                        {expandedTasks['kid-task-1'] ? (
                          <ChevronUp size={20} className="text-gray-500" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-500" />
                        )}
                      </div>
                    </div>
                      
                    <div className="mt-2">
                      <p className="text-gray-600">
                        Help your parents with special tasks this week and become a Family Hero!
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Subtasks */}
                {expandedTasks['kid-task-1'] && (
                  <div className="border-t">
                    <div className="p-4">
                      <h5 className="font-medium text-sm mb-3">Your Mission:</h5>
                      <div className="space-y-4 pl-4">
                        {/* Kid Subtasks */}
                        {familyMembers.filter(member => member.role === 'child').map((child, index) => (
                          <div key={`kid-subtask-${index}`} className="border rounded-md p-3 bg-white">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mr-3">
                                <button
                                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                    selectedUser && selectedUser.role === 'child'
                                      ? 'bg-white border border-amber-300 hover:bg-amber-50 cursor-pointer' 
                                      : 'bg-gray-100 border border-gray-300 cursor-not-allowed'
                                  }`}
                                  onClick={() => {
                                    if (!kidTasksCompleted[`kid-task-1-${index}`]?.completed) {
                                      const observations = prompt("What did you do to help? Share your accomplishment!");
                                      if (observations) {
                                        handleCompleteKidTask(`kid-task-1-${index}`, selectedUser.id, true, observations);
                                      }
                                    } else {
                                      handleCompleteKidTask(`kid-task-1-${index}`, selectedUser.id, false);
                                    }
                                  }}
                                  disabled={selectedUser?.role !== 'child'}
                                >
                                  {kidTasksCompleted[`kid-task-1-${index}`]?.completed && <span>✓</span>}
                                </button>
                              </div>
                              
                              <div className="flex-1">
                                <h6 className="font-medium text-sm">{child.name}'s Special Task</h6>
                                <p className="text-sm text-gray-600 mt-1">
                                  {index % 2 === 0 ? 
                                    "Help set the table for dinner this week" : 
                                    "Help organize a family game night"}
                                </p>
                                
                                {kidTasksCompleted[`kid-task-1-${index}`]?.completed && (
                                  <div>
                                    <p className="text-xs text-green-600 mt-2">
                                      Completed by {kidTasksCompleted[`kid-task-1-${index}`].completedByName || 'a child'} on {formatDate(kidTasksCompleted[`kid-task-1-${index}`].completedDate)}
                                    </p>
                                    {kidTasksCompleted[`kid-task-1-${index}`].observations && (
                                      <div className="mt-2 p-2 bg-amber-50 rounded text-sm">
                                        <p className="italic text-amber-800">"{kidTasksCompleted[`kid-task-1-${index}`].observations}"</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {/* Reactions/Cheers */}
                                {kidTasksCompleted[`kid-task-1-${index}`]?.completed && (
                                  <div className="flex mt-2 flex-wrap gap-1">
                                    {taskReactions[`kid-task-1-${index}`]?.map((reaction, i) => (
                                      <div key={i} className="bg-amber-50 px-2 py-1 rounded-full text-xs flex items-center">
                                        <span className="mr-1">{reaction.emoji}</span>
                                        <span className="text-amber-700">{reaction.from}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {/* Comments */}
                                {renderComments(kidTaskComments[`kid-task-1-${index}`])}
                                
                                {/* Comment form */}
                                {commentTask === `kid-task-1-${index}` && renderCommentForm(`kid-task-1-${index}`)}
                                
                                {/* Add comment button */}
                                {!commentTask && (
                                  <div className="mt-2 flex justify-end">
                                    <button
                                      className="px-2 py-1 text-xs rounded border"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddComment(`kid-task-1-${index}`);
                                      }}
                                    >
                                      Comment
                                    </button>
                                  </div>
                                )}
                                
                                {/* Add Reaction Button */}
                                {kidTasksCompleted[`kid-task-1-${index}`]?.completed && (
                                  <button
                                    onClick={() => openEmojiPicker(`kid-task-1-${index}`)}
                                    className="mt-2 text-xs flex items-center text-blue-600 hover:text-blue-800"
                                  >
                                    <span className="mr-1">🎉</span> Add a cheer!
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* If no children, show message */}
                        {familyMembers.filter(member => member.role === 'child').length === 0 && (
                          <p className="text-sm text-gray-500 italic">No children added to your family yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Second Kid Task - Fun Survey Challenge */}
              <div className="rounded-lg border bg-white">
                <div 
                  className="p-4 flex items-start cursor-pointer"
                  onClick={() => toggleTaskExpansion('kid-task-2')}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-green-100 text-green-600">
                    🔍
                  </div>
                    
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-lg">Family Detective Challenge</h4>
                      <div>
                        {expandedTasks['kid-task-2'] ? (
                          <ChevronUp size={20} className="text-gray-500" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-500" />
                        )}
                      </div>
                    </div>
                      
                    <div className="mt-2">
                      <p className="text-gray-600">
                        Become a family detective! Observe who does what in your family this week!
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Subtasks */}
                {expandedTasks['kid-task-2'] && (
                  <div className="border-t">
                    <div className="p-4">
                      <h5 className="font-medium text-sm mb-3">Your Mission:</h5>
                      <div className="space-y-4 pl-4">
                        {/* Detective Subtasks */}
                        <div className="border rounded-md p-3 bg-white">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mr-3">
                              <button
                                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  selectedUser && selectedUser.role === 'child'
                                    ? 'bg-white border border-green-300 hover:bg-green-50 cursor-pointer' 
                                    : 'bg-gray-100 border border-gray-300 cursor-not-allowed'
                                }`}
                                onClick={() => {
                                  if (!kidTasksCompleted['kid-task-2-1']?.completed) {
                                    const observations = prompt("What did you observe about who cooks in your family?");
                                    if (observations) {
                                      handleCompleteKidTask('kid-task-2-1', selectedUser.id, true, observations);
                                    }
                                  } else {
                                    handleCompleteKidTask('kid-task-2-1', selectedUser.id, false);
                                  }
                                }}
                                disabled={selectedUser?.role !== 'child'}
                              >
                                {kidTasksCompleted['kid-task-2-1']?.completed && <span>✓</span>}
                              </button>
                            </div>
                            
                            <div className="flex-1">
                              <h6 className="font-medium text-sm">Watch Who Cooks</h6>
                              <p className="text-sm text-gray-600 mt-1">
                                Keep track of who makes meals this week
                              </p>
                              
                              {kidTasksCompleted['kid-task-2-1']?.completed && (
                                <div>
                                  <p className="text-xs text-green-600 mt-2">
                                    Completed by {kidTasksCompleted['kid-task-2-1'].completedByName || 'a child'} on {formatDate(kidTasksCompleted['kid-task-2-1'].completedDate)}
                                  </p>
                                  {kidTasksCompleted['kid-task-2-1'].observations && (
                                    <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                                      <p className="italic text-green-800">"{kidTasksCompleted['kid-task-2-1'].observations}"</p>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Comments */}
                              {renderComments(kidTaskComments['kid-task-2-1'])}
                              
                              {/* Comment form */}
                              {commentTask === 'kid-task-2-1' && renderCommentForm('kid-task-2-1')}
                              
                              {/* Add comment button */}
                              {!commentTask && (
                                <div className="mt-2 flex justify-end">
                                  <button
                                    className="px-2 py-1 text-xs rounded border"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddComment('kid-task-2-1');
                                    }}
                                  >
                                    Comment
                                  </button>
                                </div>
                              )}
                              
                              {/* Reactions */}
                              {kidTasksCompleted['kid-task-2-1']?.completed && (
                                <div className="flex mt-2 flex-wrap gap-1">
                                  {taskReactions['kid-task-2-1']?.map((reaction, i) => (
                                    <div key={i} className="bg-green-50 px-2 py-1 rounded-full text-xs flex items-center">
                                      <span className="mr-1">{reaction.emoji}</span>
                                      <span className="text-green-700">{reaction.from}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {/* Add Reaction Button */}
                              {kidTasksCompleted['kid-task-2-1']?.completed && (
                                <button
                                  onClick={() => openEmojiPicker('kid-task-2-1')}
                                  className="mt-2 text-xs flex items-center text-blue-600 hover:text-blue-800"
                                >
                                  <span className="mr-1">🎉</span> Add a cheer!
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="border rounded-md p-3 bg-white">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mr-3">
                              <button
                                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  selectedUser && selectedUser.role === 'child'
                                    ? 'bg-white border border-green-300 hover:bg-green-50 cursor-pointer' 
                                    : 'bg-gray-100 border border-gray-300 cursor-not-allowed'
                                }`}
                                onClick={() => {
                                  if (!kidTasksCompleted['kid-task-2-2']?.completed) {
                                    const observations = prompt("What did you notice about who cleans in your family?");
                                    if (observations) {
                                      handleCompleteKidTask('kid-task-2-2', selectedUser.id, true, observations);
                                    }
                                  } else {
                                    handleCompleteKidTask('kid-task-2-2', selectedUser.id, false);
                                  }
                                }}
                                disabled={selectedUser?.role !== 'child'}
                              >
                                {kidTasksCompleted['kid-task-2-2']?.completed && <span>✓</span>}
                              </button>
                            </div>
                            
                            <div className="flex-1">
                              <h6 className="font-medium text-sm">Count Who Cleans</h6>
                              <p className="text-sm text-gray-600 mt-1">
                                Notice who does cleaning tasks this week
                              </p>
                              
                              {kidTasksCompleted['kid-task-2-2']?.completed && (
                                <div>
                                  <p className="text-xs text-green-600 mt-2">
                                    Completed by {kidTasksCompleted['kid-task-2-2'].completedByName || 'a child'} on {formatDate(kidTasksCompleted['kid-task-2-2'].completedDate)}
                                  </p>
                                  {kidTasksCompleted['kid-task-2-2'].observations && (
                                    <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                                      <p className="italic text-green-800">"{kidTasksCompleted['kid-task-2-2'].observations}"</p>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Comments */}
                              {renderComments(kidTaskComments['kid-task-2-2'])}
                              
                              {/* Comment form */}
                              {commentTask === 'kid-task-2-2' && renderCommentForm('kid-task-2-2')}
                              
                              {/* Add comment button */}
                              {!commentTask && (
                                <div className="mt-2 flex justify-end">
                                  <button
                                    className="px-2 py-1 text-xs rounded border"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddComment('kid-task-2-2');
                                    }}
                                  >
                                    Comment
                                  </button>
                                </div>
                              )}
                              
                              {/* Reactions */}
                              {kidTasksCompleted['kid-task-2-2']?.completed && (
                                <div className="flex mt-2 flex-wrap gap-1">
                                  {taskReactions['kid-task-2-2']?.map((reaction, i) => (
                                    <div key={i} className="bg-green-50 px-2 py-1 rounded-full text-xs flex items-center">
                                      <span className="mr-1">{reaction.emoji}</span>
                                      <span className="text-green-700">{reaction.from}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {/* Add Reaction Button */}
                              {kidTasksCompleted['kid-task-2-2']?.completed && (
                                <button
                                  onClick={() => openEmojiPicker('kid-task-2-2')}
                                  className="mt-2 text-xs flex items-center text-blue-600 hover:text-blue-800"
                                >
                                  <span className="mr-1">🎉</span> Add a cheer!
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
          
        {/* Family Meeting Card - at the bottom */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Users size={20} className="text-amber-600" />
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Family Meeting</h3>
              <p className="text-sm text-gray-600 mt-1">
                Hold a 30-minute family meeting to discuss progress and set goals
              </p>
              
              <div className="mt-3">
                {!canStartFamilyMeeting && (
                  <div className="text-sm bg-amber-50 text-amber-800 p-3 rounded mb-3">
                    <div className="flex items-center mb-1">
                      <AlertCircle size={16} className="mr-2" />
                      <span className="font-medium">Family meeting not yet available</span>
                    </div>
                    <p>
                      Complete the weekly check-in and at least 3 tasks to unlock the family meeting agenda.
                    </p>
                  </div>
                )}
                
                <div className="text-sm text-gray-600 flex items-center">
                  <span>Recommended: 30 minutes</span>
                </div>
              </div>
              
              <div className="mt-4">
                <button
                  onClick={onOpenFamilyMeeting}
                  disabled={!canStartFamilyMeeting}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    canStartFamilyMeeting 
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  View Meeting Agenda & Topics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emoji Picker Modal */}
      {selectedTaskForEmoji && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium mb-4">Add a cheer!</h3>
            
            <div className="grid grid-cols-5 gap-3 mb-4">
              {['👍', '❤️', '🎉', '👏', '⭐', '🌟', '🏆', '💯', '🙌', '🤩'].map(emoji => (
                <button
                  key={emoji}
                  className="text-2xl p-2 hover:bg-gray-100 rounded"
                  onClick={() => addReaction(selectedTaskForEmoji, emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
            
            <div className="flex justify-end">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => setSelectedTaskForEmoji(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksTab;