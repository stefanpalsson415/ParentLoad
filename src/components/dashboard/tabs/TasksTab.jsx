import React, { useState, useEffect } from 'react';
import { Users, Calendar, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Sparkles, Brain, Info } from 'lucide-react';
import { useFamily } from '../../../contexts/FamilyContext';
import DatabaseService from '../../../services/DatabaseService';

const TasksTab = ({ onStartWeeklyCheckIn, onOpenFamilyMeeting }) => {
  const { 
    selectedUser, 
    familyMembers,
    currentWeek,
    completedWeeks,
    familyId,
    addTaskComment,
    updateTaskCompletion
  } = useFamily();
  
  // State to track when everyone completed initial survey
  const [allInitialComplete, setAllInitialComplete] = useState(false);
  const [daysUntilCheckIn, setDaysUntilCheckIn] = useState(6);
  const [canStartCheckIn, setCanStartCheckIn] = useState(false);
  
  // Calculate dates
  const [checkInDueDate, setCheckInDueDate] = useState(new Date());
  const [currentDate] = useState(new Date());
  
  // State for AI recommendations
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [isLoadingAiRecommendations, setIsLoadingAiRecommendations] = useState(false);
  
  // Check if all initial surveys are complete
  useEffect(() => {
    const allComplete = familyMembers.every(member => member.completed);
    setAllInitialComplete(allComplete);
    
    if (allComplete) {
      // Set the check-in due date to 7 days after the latest completion
      const latestDate = new Date(Math.max(...familyMembers.map(m => 
        m.completedDate ? new Date(m.completedDate).getTime() : 0
      )));
      
      const dueDate = new Date(latestDate);
      dueDate.setDate(dueDate.getDate() + 7);
      setCheckInDueDate(dueDate);
      
      // Calculate days until check-in becomes available (6 days after completion)
      const availableDate = new Date(latestDate);
      availableDate.setDate(availableDate.getDate() + 6);
      
      const diffTime = availableDate.getTime() - currentDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysUntilCheckIn(Math.max(0, diffDays));
      
      // Can start check-in if 6 days have passed since completion
      setCanStartCheckIn(diffDays <= 0);
      
      // Load AI-generated task recommendations
      loadAiRecommendations();
    }
  }, [familyMembers, currentDate, familyId]);
  
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
  
  // Generate task recommendations based on survey results
  // In a real app, this would analyze survey data to make personalized recommendations
  const generateTaskRecommendations = () => {
    return [
      {
        id: 1,
        assignedTo: "Papa",
        assignedToName: "Stefan",
        title: "Meal Planning",
        description: "Everyone in the family believes that Mama handles all the meal planning, but Papa thinks it's shared. Papa taking over this task would balance your workload.",
        completed: false,
        comments: [],
        subTasks: [
          {
            id: "1-1",
            title: "Create a weekly meal plan template",
            description: "Design a simple template with slots for each day's breakfast, lunch, and dinner that can be printed or shared digitally.",
            completed: false,
            comments: []
          },
          {
            id: "1-2",
            title: "Plan meals one week in advance",
            description: "Every Sunday, fill out the meal plan for the upcoming week and share it with the family for input.",
            completed: false,
            comments: []
          },
          {
            id: "1-3",
            title: "Create a shared grocery list",
            description: "Based on the meal plan, create a grocery list and coordinate shopping responsibilities.",
            completed: false,
            comments: []
          }
        ]
      },
      {
        id: 2,
        assignedTo: "Papa",
        assignedToName: "Stefan",
        title: "Childcare Coordination",
        description: "Looking at your survey, we noticed that Mama coordinates all childcare arrangements. This is an invisible task that Papa could help with.",
        completed: false,
        comments: [],
        subTasks: [
          {
            id: "2-1",
            title: "Create a childcare contact list",
            description: "Compile all contact information for babysitters, daycare, after-school programs, and other childcare providers.",
            completed: false,
            comments: []
          },
          {
            id: "2-2",
            title: "Schedule and confirm regular childcare",
            description: "Take over the task of scheduling and confirming regular childcare arrangements for the next month.",
            completed: false,
            comments: []
          },
          {
            id: "2-3",
            title: "Handle emergency backup planning",
            description: "Create a backup plan for childcare when regular arrangements fall through and communicate this to all family members.",
            completed: false,
            comments: []
          }
        ]
      },
      {
        id: 3,
        assignedTo: "Papa",
        assignedToName: "Stefan",
        title: "Family Calendar Management",
        description: "Calendar management is one of those invisible tasks that takes mental energy. Having Papa share this responsibility would make a big difference.",
        completed: false,
        comments: [],
        subTasks: [
          {
            id: "3-1",
            title: "Set up a shared digital calendar",
            description: "Create or optimize a shared digital calendar that all family members can access and update.",
            completed: false,
            comments: []
          },
          {
            id: "3-2",
            title: "Schedule upcoming family events",
            description: "Add all upcoming family events, appointments, and activities to the calendar for the next two months.",
            completed: false,
            comments: []
          },
          {
            id: "3-3",
            title: "Send weekly calendar briefings",
            description: "Each Sunday, review the upcoming week's schedule and send a summary to all family members.",
            completed: false,
            comments: []
          }
        ]
      },
      {
        id: 4,
        assignedTo: "Mama",
        assignedToName: "Kimberly",
        title: "Manage Home Repairs",
        description: "Papa has been handling most of the home repairs. This is an area where Mama could take on more responsibility to help balance the workload.",
        completed: false,
        comments: [],
        subTasks: [
          {
            id: "4-1",
            title: "Create a home maintenance inventory",
            description: "List all ongoing and upcoming home maintenance needs with priority levels and estimated timelines.",
            completed: false,
            comments: []
          },
          {
            id: "4-2",
            title: "Research and contact service providers",
            description: "For the next repair needed, research options, get quotes, and schedule the service.",
            completed: false,
            comments: []
          },
          {
            id: "4-3",
            title: "Learn a basic home repair skill",
            description: "Choose one simple home maintenance task (changing filters, fixing a leaky faucet, etc.) and learn how to do it.",
            completed: false,
            comments: []
          }
        ]
      },
      {
        id: 5,
        assignedTo: "Mama",
        assignedToName: "Kimberly",
        title: "Plan Family Activities",
        description: "Planning recreational activities for the family is something Papa has been doing. Mama could help balance by taking over this task.",
        completed: false,
        comments: [],
        subTasks: [
          {
            id: "5-1",
            title: "Create a family activity wish list",
            description: "Ask each family member for activity ideas and compile them into a master list that can be referenced when planning.",
            completed: false,
            comments: []
          },
          {
            id: "5-2",
            title: "Plan a weekend family outing",
            description: "Research, plan, and organize all details for an upcoming family outing or day trip.",
            completed: false,
            comments: []
          },
          {
            id: "5-3",
            title: "Establish a regular family activity night",
            description: "Choose a regular time slot for weekly family activities and plan the first month of activities.",
            completed: false,
            comments: []
          }
        ]
      }
    ];
  };
  
  // Task recommendations - will be fresh after all initial surveys complete
  const [taskRecommendations, setTaskRecommendations] = useState(generateTaskRecommendations());
  const [expandedTasks, setExpandedTasks] = useState({});
  
  // Reset task recommendations when all surveys are complete
  useEffect(() => {
    if (allInitialComplete) {
      setTaskRecommendations(generateTaskRecommendations());
    }
  }, [allInitialComplete]);
  
  // State for comment form
  const [commentTask, setCommentTask] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  // Check if weekly check-in is completed for this week
  const weeklyCheckInCompleted = familyMembers.every(member => 
    member.weeklyCompleted?.[currentWeek-1]?.completed
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
    // Only a parent can complete their own assigned tasks
    return selectedUser.role === 'parent' && selectedUser.name === task.assignedToName;
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
        // Update local state
        const updatedTasks = aiRecommendations.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              completed: isCompleted,
              completedDate: isCompleted ? new Date().toISOString().split('T')[0] : null
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
        // In a real app, this would update the subtask in database
        // await updateSubtaskCompletion(taskId, subtaskId, isCompleted);
        
        // Update local state
        const updatedTasks = taskRecommendations.map(task => {
          if (task.id.toString() === taskId.toString()) {
            return {
              ...task,
              subTasks: task.subTasks.map(subtask => {
                if (subtask.id === subtaskId) {
                  return {
                    ...subtask,
                    completed: isCompleted
                  };
                }
                return subtask;
              }),
              // Update the main task's completion based on subtasks
              completed: isCompleted ? 
                task.subTasks.filter(st => st.id !== subtaskId).every(st => st.completed) && isCompleted : 
                false
            };
          }
          return task;
        });
        
        setTaskRecommendations(updatedTasks);
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
    return date.toLocaleDateString('en-US', { 
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
                      member.weeklyCompleted?.[currentWeek-1]?.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                    }`}
                    title={`${member.name}: ${member.weeklyCompleted?.[currentWeek-1]?.completed ? 'Completed' : 'Not completed'}`}
                  >
                    {member.weeklyCompleted?.[currentWeek-1]?.completed ? '✓' : member.name.charAt(0)}
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