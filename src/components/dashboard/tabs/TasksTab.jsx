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
  
  // Calculate dates
  const [checkInDueDate, setCheckInDueDate] = useState(new Date());
  const [currentDate] = useState(new Date());
  
  // State for task recommendations
  const [taskRecommendations, setTaskRecommendations] = useState([]);
  
  // State for AI recommendations
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [isLoadingAiRecommendations, setIsLoadingAiRecommendations] = useState(false);
  
  // Load tasks when component mounts
  useEffect(() => {
    const loadTasks = async () => {
      try {
        // Try to load tasks from database
        const tasks = await loadCurrentWeekTasks();
        
        // If tasks were loaded successfully, use them
        if (tasks && tasks.length > 0) {
          setTaskRecommendations(tasks);
        } else if (initialTaskRecommendations && initialTaskRecommendations.length > 0) {
          // Otherwise use the tasks from context
          setTaskRecommendations(initialTaskRecommendations);
        } else {
          // If no tasks anywhere, generate new ones
          setTaskRecommendations(generateTaskRecommendations());
        }
      } catch (error) {
        console.error("Error loading tasks:", error);
        // Fallback to generated tasks
        setTaskRecommendations(generateTaskRecommendations());
      }
    };
    
    loadTasks();
  }, [familyId, currentWeek, initialTaskRecommendations, loadCurrentWeekTasks]);
  
  // Check if all initial surveys are complete
  useEffect(() => {
    const allComplete = familyMembers.every(member => member.completed);
    setAllInitialComplete(allComplete);
    
    if (allComplete) {
      let dueDate;
      
      // Check if there is a scheduled date for the current week
      if (surveySchedule && surveySchedule[currentWeek]) {
        dueDate = new Date(surveySchedule[currentWeek]);
      } else {
        // Otherwise set the check-in due date to 7 days after the latest completion
        const latestDate = new Date(Math.max(...familyMembers.map(m => 
          m.completedDate ? new Date(m.completedDate).getTime() : 0
        )));
        
        dueDate = new Date(latestDate);
        dueDate.setDate(dueDate.getDate() + 7);
      }
      
      setCheckInDueDate(dueDate);
      
      // Calculate days until check-in becomes available (1 day before due date)
      const availableDate = new Date(dueDate);
      availableDate.setDate(availableDate.getDate() - 1);
      
      const diffTime = availableDate.getTime() - currentDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysUntilCheckIn(Math.max(0, diffDays));
      
      // Can start check-in if it's available now
      setCanStartCheckIn(diffDays <= 0);
      
      // Load AI-generated task recommendations
      loadAiRecommendations();
    }
  }, [familyMembers, currentDate, surveySchedule, currentWeek]);
  
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
  
  // Task recommendations for the current week
  const [expandedTasks, setExpandedTasks] = useState({});
  
  // State for comment form
  const [commentTask, setCommentTask] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
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
    // Only a parent can complete their own assigned tasks
    return selectedUser && selectedUser.role === 'parent' && selectedUser.name === task.assignedToName;
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
        // Create completion timestamp
        const completedDate = isCompleted ? new Date().toISOString() : null;
        
        // Update subtask in database
        await updateSubtaskCompletion(taskId, subtaskId, isCompleted);
        
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