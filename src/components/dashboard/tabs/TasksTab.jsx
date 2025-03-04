import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { useFamily } from '../../../contexts/FamilyContext';

const TasksTab = ({ onStartWeeklyCheckIn, onOpenFamilyMeeting }) => {
  const { 
    selectedUser, 
    familyMembers,
    currentWeek,
    addTaskComment,
    updateTaskCompletion
  } = useFamily();
  
  // Sample task recommendations - in a real app this would come from the database
  const [taskRecommendations, setTaskRecommendations] = useState([
    {
      id: 1,
      assignedTo: "Papa",
      title: "Meal Planning",
      description: "Everyone in the family believes that Mama handles all the meal planning, but Papa thinks it's shared. Papa taking over this task would balance your workload.",
      completed: false,
      comments: [
        {
          id: 1,
          userId: "tegner-id",
          userName: "Tegner",
          text: "I completed this task!",
          timestamp: "2/26/2025, 12:13:37 PM"
        }
      ]
    },
    {
      id: 2,
      assignedTo: "Papa",
      title: "Childcare Coordination",
      description: "Looking at your survey, we noticed that Mama coordinates all childcare arrangements. This is an invisible task that Papa could help with.",
      completed: false,
      comments: []
    },
    {
      id: 3,
      assignedTo: "Papa",
      title: "Family Calendar Management",
      description: "Calendar management is one of those invisible tasks that takes mental energy. Having Papa share this responsibility would make a big difference.",
      completed: true,
      comments: []
    },
    {
      id: 4,
      assignedTo: "Mama",
      title: "Manage Home Repairs",
      description: "Papa has been handling most of the home repairs. This is an area where Mama could take on more responsibility to help balance the workload.",
      completed: false,
      comments: []
    },
    {
      id: 5,
      assignedTo: "Mama",
      title: "Plan Family Activities",
      description: "Planning recreational activities for the family is something Papa has been doing. Mama could help balance by taking over this task.",
      completed: true,
      comments: []
    }
  ]);
  
  // State for comment form
  const [commentTask, setCommentTask] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  // Handle adding a comment to a task
  const handleAddComment = (taskId) => {
    setCommentTask(taskId);
    setCommentText('');
  };
  
  // Handle submitting a comment
  const handleSubmitComment = async () => {
    if (commentText.trim() === '' || isSubmittingComment) return;
    
    setIsSubmittingComment(true);
    
    try {
      // Save comment to database
      const result = await addTaskComment(commentTask, commentText);
      
      // Update local state
      const updatedTasks = taskRecommendations.map(task => {
        if (task.id === commentTask) {
          return {
            ...task,
            comments: [...task.comments, {
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
  
  // Handle task completion toggle
  const handleCompleteTask = async (taskId, isCompleted) => {
    const task = taskRecommendations.find(t => t.id === taskId);
    
    // Check permissions - only assigned parent can complete tasks
    if (task && selectedUser.role === 'parent' && task.assignedTo === selectedUser.name) {
      try {
        // Update task in database
        await updateTaskCompletion(taskId, isCompleted);
        
        // Update local state
        const updatedTasks = taskRecommendations.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              completed: isCompleted
            };
          }
          return task;
        });
        
        setTaskRecommendations(updatedTasks);
      } catch (error) {
        console.error("Error updating task:", error);
        alert("There was an error updating the task. Please try again.");
      }
    } else if (selectedUser.role !== 'parent') {
      alert("Only parents can mark tasks as complete. Children can add comments instead.");
    } else {
      alert(`Only ${task.assignedTo} can mark this task as complete.`);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3">This Week's Focus</h3>
        <p className="text-sm text-gray-600 mb-4">
          Suggested tasks to help balance your family's workload
        </p>
          
        <div className="space-y-4">
          {/* Papa's Tasks */}
          <div className="border-l-4 border-blue-500 p-2">
            <h4 className="font-medium mb-2 text-lg">Papa's Tasks</h4>
            <div className="space-y-3">
              {taskRecommendations
                .filter(task => task.assignedTo === "Papa")
                .map(task => (
                  <div key={task.id} className={`p-4 rounded-lg border ${task.completed ? 'bg-green-50' : 'bg-white'}`}>
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${task.completed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                        {task.completed ? '✓' : task.id}
                      </div>
                        
                      <div className="flex-1">
                        <h4 className="font-medium text-lg">{task.title}</h4>
                          
                        <div className="mt-2">
                          <p className="text-gray-600">
                            {task.description}
                          </p>
                        </div>
                        
                        {/* Comments Section */}
                        {task.comments && task.comments.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <h5 className="text-sm font-medium mb-2">Comments:</h5>
                            <div className="space-y-2">
                              {task.comments.map(comment => (
                                <div key={comment.id} className="bg-gray-50 p-2 rounded text-sm">
                                  <div className="font-medium">{comment.userName}:</div>
                                  <p>{comment.text}</p>
                                  <div className="text-xs text-gray-500 mt-1">{comment.timestamp}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Add Comment Form */}
                        {commentTask === task.id ? (
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
                        ) : (
                          <div className={`mt-4 flex ${task.completed ? 'justify-between' : 'justify-end'}`}>
                            {task.completed && (
                              <span className="text-green-600 text-sm flex items-center">
                                ✓ Completed
                              </span>
                            )}
                            <div className="flex space-x-2">
                              <button
                                className="px-3 py-1 text-sm rounded border"
                                onClick={() => handleAddComment(task.id)}
                              >
                                Comment
                              </button>
                              {selectedUser.role === 'parent' && selectedUser.name === task.assignedTo && (
                                <button 
                                  className={`px-3 py-1 text-sm rounded border ${task.completed ? 'border-gray-300 bg-white' : 'border-blue-500 bg-blue-500 text-white'}`}
                                  onClick={() => handleCompleteTask(task.id, !task.completed)}
                                >
                                  {task.completed ? "Undo" : "Mark as Done"}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
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
                  <div key={task.id} className={`p-4 rounded-lg border ${task.completed ? 'bg-green-50' : 'bg-white'}`}>
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${task.completed ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                        {task.completed ? '✓' : task.id}
                      </div>
                        
                      <div className="flex-1">
                        <h4 className="font-medium text-lg">{task.title}</h4>
                          
                        <div className="mt-2">
                          <p className="text-gray-600">
                            {task.description}
                          </p>
                        </div>
                        
                        {/* Comments Section */}
                        {task.comments && task.comments.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <h5 className="text-sm font-medium mb-2">Comments:</h5>
                            <div className="space-y-2">
                              {task.comments.map(comment => (
                                <div key={comment.id} className="bg-gray-50 p-2 rounded text-sm">
                                  <div className="font-medium">{comment.userName}:</div>
                                  <p>{comment.text}</p>
                                  <div className="text-xs text-gray-500 mt-1">{comment.timestamp}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Add Comment Form */}
                        {commentTask === task.id ? (
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
                        ) : (
                          <div className={`mt-4 flex ${task.completed ? 'justify-between' : 'justify-end'}`}>
                            {task.completed && (
                              <span className="text-green-600 text-sm flex items-center">
                                ✓ Completed
                              </span>
                            )}
                            <div className="flex space-x-2">
                              <button
                                className="px-3 py-1 text-sm rounded border"
                                onClick={() => handleAddComment(task.id)}
                              >
                                Comment
                              </button>
                              {selectedUser.role === 'parent' && selectedUser.name === task.assignedTo && (
                                <button 
                                  className={`px-3 py-1 text-sm rounded border ${task.completed ? 'border-gray-300 bg-white' : 'border-blue-500 bg-blue-500 text-white'}`}
                                  onClick={() => handleCompleteTask(task.id, !task.completed)}
                                >
                                  {task.completed ? "Undo" : "Mark as Done"}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
        
      {/* Family Meeting Card */}
      <div className="bg-white rounded-lg shadow p-6">
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
            
            <div className="mt-3 flex items-center text-sm text-gray-600">
              <span>Recommended: 30 minutes</span>
            </div>
            
            <div className="mt-4">
              <button
                onClick={onOpenFamilyMeeting}
                className="px-4 py-2 bg-amber-100 text-amber-800 rounded-md flex items-center hover:bg-amber-200"
              >
                View Meeting Agenda & Topics
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Weekly Check-in Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3">Weekly Check-in Status</h3>
        <div className="bg-blue-50 p-4 rounded">
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
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={onStartWeeklyCheckIn}
          >
            Start Weekly Check-in
          </button>
        </div>
      </div>
    </div>
  );
};

export default TasksTab;