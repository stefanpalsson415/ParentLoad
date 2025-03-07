import React, { useState, useEffect } from 'react';
import { Users, Calendar, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Sparkles, Brain, Info } from 'lucide-react';
import { useFamily } from '../../../contexts/FamilyContext';
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

// Generate tasks for Week 2 based on imbalances
const generateAITasksForWeek2 = (surveyResponses, fullQuestionSet) => {
  console.log("Generating AI tasks for Week 2");
  
  // If no survey data, use default tasks
  if (!surveyResponses || Object.keys(surveyResponses).length === 0) {
    console.log("No survey data, using defaults");
    return generateTaskRecommendations();
  }
  
  // Analyze imbalances in each category
  const imbalances = analyzeTaskImbalances(surveyResponses, fullQuestionSet);
  console.log("Analyzed imbalances:", imbalances);
  
  // Sort categories by imbalance score
  const sortedImbalances = Object.entries(imbalances)
    .sort((a, b) => b[1].imbalance - a[1].imbalance);
  
  console.log("Sorted imbalances:", sortedImbalances);
  
  // Generate tasks based on the top 2 imbalanced categories
  const tasks = [];
  
  sortedImbalances.slice(0, 2).forEach(([category, data], index) => {
    // Skip categories with no data or small imbalance
    if (data.total === 0 || data.imbalance < 10) return;
    
    // Determine which parent needs more tasks
    const targetParent = data.mamaPercent > data.papaPercent ? 'Papa' : 'Mama';
    
    // Create task templates based on category
    const templates = {
      "Visible Household": {
        title: "Week 2: Household Management",
        description: `Take charge of visible household tasks to create better balance (Week 2 Focus)`,
        subTasks: [
          { title: "Meal Preparation", description: "Plan and prepare meals for at least 3 days" },
          { title: "Home Cleaning", description: "Handle cleaning of common areas" },
          { title: "Laundry", description: "Manage laundry for the family this week" }
        ]
      },
      "Invisible Household": {
        title: "Week 2: Planning & Organization",
        description: `Handle the mental load of household planning (Week 2 Focus)`,
        subTasks: [
          { title: "Family Calendar", description: "Update and maintain the family schedule" },
          { title: "Shopping Planning", description: "Create shopping lists and plan purchases" },
          { title: "Home Management", description: "Coordinate household maintenance needs" }
        ]
      },
      "Visible Parental": {
        title: "Week 2: Childcare Focus",
        description: `Take the lead on direct childcare activities (Week 2 Focus)`,
        subTasks: [
          { title: "School Transport", description: "Handle school/activity transportation" },
          { title: "Homework Help", description: "Assist children with schoolwork" },
          { title: "Bedtime Routine", description: "Manage evening routines for children" }
        ]
      },
      "Invisible Parental": {
        title: "Week 2: Emotional Support",
        description: `Focus on the invisible aspects of parenting (Week 2 Focus)`,
        subTasks: [
          { title: "School Communication", description: "Coordinate with teachers and school" },
          { title: "Emotional Check-ins", description: "Have one-on-one time with each child" },
          { title: "Activity Planning", description: "Research and plan activities for children" }
        ]
      }
    };
    
    // Get template for this category
    const template = templates[category];
    if (!template) return;
    
    // Create task
    tasks.push({
      id: `2-${index+1}`,
      title: template.title,
      description: template.description,
      assignedTo: targetParent,
      assignedToName: targetParent,
      completed: false,
      completedDate: null,
      comments: [],
      isAIGenerated: true,
      subTasks: template.subTasks.map((subtask, i) => ({
        id: `2-${index+1}-${i+1}`,
        title: subtask.title,
        description: subtask.description,
        completed: false,
        completedDate: null
      }))
    });
  });
  
  // Fill remaining slots with generic tasks
  while (tasks.length < 4) {
    const index = tasks.length;
    const isForPapa = index % 2 === 0;
    
    tasks.push({
      id: `2-${index+1}`,
      title: `Week 2: ${isForPapa ? "Family Support" : "Household Balance"}`,
      description: `Complete these tasks to improve family balance (Week 2 Focus)`,
      assignedTo: isForPapa ? "Papa" : "Mama",
      assignedToName: isForPapa ? "Papa" : "Mama",
      completed: false,
      completedDate: null,
      comments: [],
      subTasks: [
        {
          id: `2-${index+1}-1`,
          title: isForPapa ? "Child Activities" : "Meal Coordination",
          description: isForPapa ? "Plan and lead activities with the children" : "Plan meals for the week",
          completed: false,
          completedDate: null
        },
        {
          id: `2-${index+1}-2`,
          title: isForPapa ? "Morning Routine" : "Home Organization",
          description: isForPapa ? "Handle the morning routine for the children" : "Organize a space in the home",
          completed: false,
          completedDate: null
        }
      ]
    });
  }
  
  console.log("Generated AI tasks:", tasks);
  return tasks;
};

// Fallback task generator for when no tasks are available
const generateTaskRecommendations = () => {
  // Generate sample tasks when no tasks are available from other sources
  const sampleTasks = [
    {
      id: "1",
      title: "Meal Planning",
      description: "Take charge of planning family meals for the week",
      assignedTo: "Papa",
      assignedToName: "Papa",
      completed: false,
      completedDate: null,
      comments: [],
      subTasks: [
        {
          id: "1-1",
          title: "Create shopping list",
          description: "Make a complete shopping list for the week's meals",
          completed: false,
          completedDate: null,
          comments: []
        },
        {
          id: "1-2",
          title: "Schedule meal prep",
          description: "Decide which days to prepare which meals",
          completed: false,
          completedDate: null,
          comments: []
        },
        {
          id: "1-3",
          title: "Cook together",
          description: "Plan one meal to cook together as a family",
          completed: false,
          completedDate: null,
          comments: []
        }
      ]
    },
    {
      id: "2",
      title: "School Communication",
      description: "Handle communication with schools and teachers",
      assignedTo: "Mama",
      assignedToName: "Mama",
      completed: false,
      completedDate: null,
      comments: [],
      subTasks: [
        {
          id: "2-1",
          title: "Check school emails",
          description: "Review and respond to school communications",
          completed: false,
          completedDate: null,
          comments: []
        },
        {
          id: "2-2",
          title: "Update calendar",
          description: "Add school events to the family calendar",
          completed: false,
          completedDate: null,
          comments: []
        },
        {
          id: "2-3",
          title: "Coordinate with teachers",
          description: "Reach out to teachers with any questions",
          completed: false,
          completedDate: null,
          comments: []
        }
      ]
    },
    {
      id: "3",
      title: "Family Calendar Management",
      description: "Coordinate and maintain the family's schedule",
      assignedTo: "Papa",
      assignedToName: "Papa",
      completed: false,
      completedDate: null,
      comments: [],
      subTasks: [
        {
          id: "3-1",
          title: "Review upcoming events",
          description: "Look ahead at the next two weeks of activities",
          completed: false,
          completedDate: null,
          comments: []
        },
        {
          id: "3-2",
          title: "Coordinate transportation",
          description: "Plan who will drive to each activity",
          completed: false,
          completedDate: null,
          comments: []
        },
        {
          id: "3-3",
          title: "Share with family",
          description: "Make sure everyone knows the schedule",
          completed: false,
          completedDate: null,
          comments: []
        }
      ]
    },
    {
      id: "4",
      title: "Morning Routine Help",
      description: "Take lead on getting kids ready in the morning",
      assignedTo: "Mama",
      assignedToName: "Mama",
      completed: false,
      completedDate: null,
      comments: [],
      subTasks: [
        {
          id: "4-1",
          title: "Coordinate breakfast",
          description: "Prepare or oversee breakfast for the kids",
          completed: false,
          completedDate: null,
          comments: []
        },
        {
          id: "4-2",
          title: "Ensure backpacks are ready",
          description: "Check that homework and supplies are packed",
          completed: false,
          completedDate: null,
          comments: []
        },
        {
          id: "4-3",
          title: "Manage departure time",
          description: "Keep track of time to ensure on-time departure",
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
    taskRecommendations: initialTaskRecommendations,
    loadCurrentWeekTasks
  } = useFamily();
  
  // State to track when everyone completed initial survey
  const [allInitialComplete, setAllInitialComplete] = useState(false);
  const [daysUntilCheckIn, setDaysUntilCheckIn] = useState(6);
  const [canStartCheckIn, setCanStartCheckIn] = useState(false);
  
  // Calculate due date based on survey schedule if available
  const calculateDueDate = () => {
    if (surveySchedule && surveySchedule[currentWeek]) {
      return new Date(surveySchedule[currentWeek]);
    } else {
      // Default to 7 days from now if no schedule
      const date = new Date();
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
  
  // Replace the useEffect block for task loading (around line 120)
useEffect(() => {
  const loadTasks = async () => {
    try {
      console.log(`Loading tasks for Week ${currentWeek}, user:`, selectedUser?.name);
      console.log('Completed weeks:', completedWeeks);
      
      // FORCE NEW TASK GENERATION FOR WEEK 2
      if (currentWeek === 2) {
        console.log("FORCING NEW TASK GENERATION FOR WEEK 2");
        
        // Generate completely new tasks with Week 2 specific IDs
        const week2Tasks = [
          {
            id: "2-1",
            title: "Week 2: Meal Planning",
            description: "Take charge of planning family meals for Week 2",
            assignedTo: "Papa",
            assignedToName: "Papa",
            completed: false,
            completedDate: null,
            comments: [],
            subTasks: [
              {
                id: "2-1-1",
                title: "Create shopping list",
                description: "Make a complete shopping list for Week 2 meals",
                completed: false,
                completedDate: null
              },
              {
                id: "2-1-2",
                title: "Schedule meal prep",
                description: "Decide which days to prepare which meals",
                completed: false,
                completedDate: null
              },
              {
                id: "2-1-3",
                title: "Cook together",
                description: "Plan one meal to cook together as a family",
                completed: false,
                completedDate: null
              }
            ]
          },
          {
            id: "2-3",
            title: "Week 2: Family Calendar",
            description: "Coordinate the family's schedule for Week 2",
            assignedTo: "Papa",
            assignedToName: "Papa",
            completed: false,
            completedDate: null,
            comments: [],
            subTasks: [
              {
                id: "2-3-1",
                title: "Review upcoming events",
                description: "Look ahead at Week 2 activities",
                completed: false,
                completedDate: null
              },
              {
                id: "2-3-2",
                title: "Coordinate transportation",
                description: "Plan Week 2 driving arrangements",
                completed: false,
                completedDate: null
              },
              {
                id: "2-3-3",
                title: "Share with family",
                description: "Make sure everyone knows the Week 2 schedule",
                completed: false,
                completedDate: null
              }
            ]
          },
          {
            id: "2-2",
            title: "Week 2: School Communication",
            description: "Handle Week 2 communications with schools",
            assignedTo: "Mama",
            assignedToName: "Mama",
            completed: false,
            completedDate: null,
            comments: [],
            subTasks: [
              {
                id: "2-2-1",
                title: "Check school emails",
                description: "Review Week 2 school communications",
                completed: false,
                completedDate: null
              },
              {
                id: "2-2-2",
                title: "Update calendar",
                description: "Add Week 2 school events to the family calendar",
                completed: false,
                completedDate: null
              },
              {
                id: "2-2-3",
                title: "Coordinate with teachers",
                description: "Reach out with any Week 2 questions",
                completed: false,
                completedDate: null
              }
            ]
          },
          {
            id: "2-4",
            title: "Week 2: Morning Routine",
            description: "Take lead on Week 2 morning preparations",
            assignedTo: "Mama",
            assignedToName: "Mama",
            completed: false,
            completedDate: null,
            comments: [],
            subTasks: [
              {
                id: "2-4-1",
                title: "Coordinate breakfast",
                description: "Prepare Week 2 breakfast arrangements",
                completed: false,
                completedDate: null
              },
              {
                id: "2-4-2",
                title: "Ensure backpacks are ready",
                description: "Check Week 2 homework and supplies",
                completed: false,
                completedDate: null
              },
              {
                id: "2-4-3",
                title: "Manage departure time",
                description: "Keep track of Week 2 morning schedules",
                completed: false,
                completedDate: null
              }
            ]
          }
        ];
        
        console.log("Generated Week 2 tasks:", week2Tasks);
        setTaskRecommendations(week2Tasks);
        
        // Save to Firebase
        if (familyId) {
          try {
            await DatabaseService.saveFamilyData({
              tasks: week2Tasks,
              updatedAt: new Date().toISOString()
            }, familyId);
            console.log("Week 2 tasks saved to Firebase");
          } catch (error) {
            console.error("Error saving Week 2 tasks:", error);
          }
        }
        
        return; // Exit early
      }
      
      // Regular task loading logic for other weeks
      let tasks = [];
      
      if (familyId) {
        try {
          tasks = await DatabaseService.getTasksForWeek(familyId, currentWeek);
          console.log(`Tasks loaded from Firebase for Week ${currentWeek}:`, tasks?.length || 0);
        } catch (error) {
          console.error("Error loading tasks:", error);
        }
      }
      
      if (tasks && tasks.length > 0) {
        setTaskRecommendations(tasks);
      } else {
        // Fallback to default tasks
        console.log("Using fallback tasks");
        setTaskRecommendations(generateTaskRecommendations());
      }
      
    } catch (error) {
      console.error(`Error in loadTasks for Week ${currentWeek}:`, error);
      setTaskRecommendations(generateTaskRecommendations());
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
        
        // Update state with the modified copy
        setTaskRecommendations(updatedTasks);
        
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
          }
        }
        
        // Also try to update through context
        try {
          await updateSubtaskCompletion(taskId, subtaskId, isCompleted);
          console.log("Tasks also updated via context method");
        } catch (contextError) {
          console.error("Error updating through context:", contextError);
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
                canStartCheckIn 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={onStartWeeklyCheckIn}
              disabled={!canStartCheckIn}
            >
              {canStartCheckIn ? 'Start Weekly Check-in' : 'Check-in Not Yet Available'}
            </button>
          </div>
        </div>
        
        {/* AI Task Intelligence Section */}
        {aiRecommendations && aiRecommendations.length > 0 && (
          <div className="border rounded-lg p-4 mb-6 bg-gradient-to-r from-purple-50 to-blue-50">
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
                  className={`border rounded-lg ${task.completed ? 'bg-green-50' : 'bg-white'} overflow-hidden`}
                >
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
                      
                      {/* AI Insight Box */}
                      <div className="bg-purple-50 p-3 rounded mt-3 flex items-start">
                        <Info size={16} className="text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-purple-800">
                          <strong>AI Insight:</strong> {task.insight}
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
                          <div>
                            {expandedTasks[task.id] ? (
                              <ChevronUp size={20} className="text-gray-500" />
                            ) : (
                              <ChevronDown size={20} className="text-gray-500" />
                            )}
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
                          <div>
                            {expandedTasks[task.id] ? (
                              <ChevronUp size={20} className="text-gray-500" />
                            ) : (
                              <ChevronDown size={20} className="text-gray-500" />
                            )}
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
  );
};

export default TasksTab;