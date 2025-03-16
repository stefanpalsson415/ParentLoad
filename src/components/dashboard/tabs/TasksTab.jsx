// src/components/dashboard/tabs/TasksTab.jsx
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, MessageCircle, Brain, Clock, 
  ChevronDown, ChevronUp, AlertTriangle
} from 'lucide-react';
import { useFamily } from '../../../hooks/useFamily';
import { useTasks } from '../../../hooks/useTasks';

// Task effectiveness modal
const [showEffectivenessModal, setShowEffectivenessModal] = useState(false);
const [currentTaskId, setCurrentTaskId] = useState(null);
const [effectivenessRating, setEffectivenessRating] = useState(5);
const [effectivenessFeedback, setEffectivenessFeedback] = useState('');

const TasksTab = ({ weeklyTasks, familyData, familyMembers, selectedMember }) => {
  const { updateTaskCompletion, updateSubtaskCompletion, addTaskComment } = useTasks();
  
  // Local state
  const [expandedTasks, setExpandedTasks] = useState({});
  const [newComments, setNewComments] = useState({});
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);
  
  // Toggle task expansion
  const toggleTaskExpanded = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };
  
  // Handle comment input change
  const handleCommentChange = (taskId, value) => {
    setNewComments(prev => ({
      ...prev,
      [taskId]: value
    }));
  };
  
  // Submit a new comment
  const submitComment = async (taskId) => {
    if (!newComments[taskId]?.trim() || !selectedMember) return;
    
    try {
      setLoading(true);
      await addTaskComment(
        taskId, 
        selectedMember.id, 
        selectedMember.name, 
        newComments[taskId]
      );
      
      // Clear the comment input
      setNewComments(prev => ({
        ...prev,
        [taskId]: ''
      }));
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle task completion toggle
  // Handle task completion toggle
const handleTaskCompletion = async (taskId, isCompleted) => {
  // If task is already completed, just toggle it
  if (isCompleted) {
    try {
      setLoading(true);
      await updateTaskCompletion(taskId, !isCompleted);
    } catch (error) {
      console.error("Error updating task completion:", error);
    } finally {
      setLoading(false);
    }
    return;
  }
  
  // If completing a task, show effectiveness modal
  setCurrentTaskId(taskId);
  setEffectivenessRating(5);
  setEffectivenessFeedback('');
  setShowEffectivenessModal(true);
};
 
// Handle effectiveness feedback submission
const handleEffectivenessSubmit = async () => {
  try {
    setLoading(true);
    
    // First track the effectiveness
    await trackTaskEffectiveness(
      currentTaskId, 
      effectivenessRating, 
      effectivenessFeedback
    );
    
    // Then mark the task as complete
    await updateTaskCompletion(currentTaskId, true);
    
    // Close the modal
    setShowEffectivenessModal(false);
  } catch (error) {
    console.error("Error submitting effectiveness:", error);
  } finally {
    setLoading(false);
  }
};

  // Handle subtask completion toggle
  const handleSubtaskCompletion = async (taskId, subtaskId, isCompleted) => {
    try {
      setLoading(true);
      await updateSubtaskCompletion(taskId, subtaskId, !isCompleted);
    } catch (error) {
      console.error("Error updating subtask completion:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter tasks
  const getFilteredTasks = () => {
    if (!weeklyTasks) return [];
    
    return weeklyTasks.filter(task => {
      // Filter by assignment to current user
      if (filterType === 'mine' && task.assignedTo !== selectedMember?.roleType) {
        return false;
      }
      
      // Filter by completion status
      if (filterType === 'completed' && !task.completed) {
        return false;
      }
      
      if (filterType === 'pending' && task.completed) {
        return false;
      }
      
      return true;
    });
  };
  
  // Format date from ISO string
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };
  
  const filteredTasks = getFilteredTasks();
  
  if (!weeklyTasks) {
    return <div className="p-6 text-center">Loading tasks...</div>;
  }
  
  return (
    <div className="space-y-6">
      {/* Header with filter options */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Week {familyData?.currentWeek || 1} Tasks</h2>
        
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Filter by:</span>
          <button 
            className={`px-3 py-1 text-sm rounded-full ${
              filterType === 'all' 
                ? 'bg-black text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setFilterType('all')}
          >
            All Tasks
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-full ${
              filterType === 'mine' 
                ? 'bg-black text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setFilterType('mine')}
          >
            My Tasks
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-full ${
              filterType === 'pending' 
                ? 'bg-black text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setFilterType('pending')}
          >
            Pending
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-full ${
              filterType === 'completed' 
                ? 'bg-black text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setFilterType('completed')}
          >
            Completed
          </button>
        </div>
      </div>
      
      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No tasks found matching your filter criteria</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map(task => (
            <div key={task.id} className="bg-white rounded-lg shadow">
              {/* Task Header */}
              <div className="p-4 border-b">
                <div className="flex items-start">
                  <div 
                    className={`flex-shrink-0 w-6 h-6 mt-1 mr-3 rounded-full flex items-center justify-center cursor-pointer ${
                      task.completed 
                        ? 'bg-green-100 text-green-700 border border-green-400' 
                        : 'bg-gray-100 text-gray-500 border border-gray-300'
                    }`}
                    onClick={() => handleTaskCompletion(task.id, task.completed)}
                  >
                    {task.completed && <CheckCircle size={14} />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      </div>
                      
                      <div className="ml-3 flex flex-col items-end">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          task.assignedTo === 'Mama' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {task.assignedToName || task.assignedTo}
                        </span>
                        
                        {task.priority && (
    <span className={`mt-1 flex items-center text-xs px-2 py-1 rounded-full ${
      task.priority === 'High' 
        ? 'bg-red-100 text-red-700' 
        : task.priority === 'Medium'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-blue-100 text-blue-700'
    }`}>
      {task.priority} Priority
    </span>
  )}

                        {task.isAIGenerated && (
                          <span className="mt-1 flex items-center text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-full">
                            <Brain size={10} className="mr-1" />
                            AI Insight
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <button 
                        className="text-xs flex items-center text-blue-600"
                        onClick={() => toggleTaskExpanded(task.id)}
                      >
                        {expandedTasks[task.id] ? (
                          <>
                            <ChevronUp size={14} className="mr-1" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown size={14} className="mr-1" />
                            Show Details
                          </>
                        )}
                      </button>
                      
                      {task.completedDate && (
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock size={12} className="mr-1" />
                          Completed {formatDate(task.completedDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Task Details (expanded) */}
              {expandedTasks[task.id] && (
                <div className="p-4 bg-gray-50">
                  {/* AI Insight if available */}
                  {(task.insight || task.aiInsight) && (
                    <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-start">
                        <Brain size={16} className="text-purple-600 mr-2 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-purple-800">AI Insight:</h4>
                          <p className="text-sm text-purple-700 mt-1">{task.insight || task.aiInsight}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Subtasks if available */}
                  {task.subTasks && task.subTasks.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Subtasks:</h4>
                      <div className="space-y-2">
                        {task.subTasks.map(subtask => (
                          <div key={subtask.id} className="flex items-start p-3 bg-white rounded-lg border border-gray-200">
                            <div 
                              className={`flex-shrink-0 w-5 h-5 mt-0.5 mr-3 rounded-full flex items-center justify-center cursor-pointer ${
                                subtask.completed 
                                  ? 'bg-green-100 text-green-700 border border-green-400' 
                                  : 'bg-gray-100 text-gray-500 border border-gray-300'
                              }`}
                              onClick={() => handleSubtaskCompletion(task.id, subtask.id, subtask.completed)}
                            >
                              {subtask.completed && <CheckCircle size={12} />}
                            </div>
                            
                            <div className="flex-1">
                              <p className={`text-sm ${subtask.completed ? 'line-through text-gray-500' : ''}`}>
                                {subtask.title}
                              </p>
                              {subtask.description && (
                                <p className="text-xs text-gray-600 mt-1">{subtask.description}</p>
                              )}
                              {subtask.completed && subtask.completedDate && (
                                <div className="flex items-center mt-1 text-xs text-gray-500">
                                  <Clock size={10} className="mr-1" />
                                  {formatDate(subtask.completedDate)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Task metadata */}
                  <div className="mb-4 grid grid-cols-2 gap-3 text-xs text-gray-600">
                    {task.category && (
                      <div>
                        <span className="font-medium">Category:</span> {task.category}
                      </div>
                    )}
                    {task.dueDate && (
                      <div>
                        <span className="font-medium">Due:</span> {formatDate(task.dueDate)}
                      </div>
                    )}
                    {task.priority && (
                      <div>
                        <span className="font-medium">Priority:</span> {task.priority}
                      </div>
                    )}
                    {task.hiddenWorkloadType && (
                      <div>
                        <span className="font-medium">Workload Type:</span> {task.hiddenWorkloadType}
                      </div>
                    )}
                  </div>
                  
                  {/* Comments section */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Comments:</h4>
                    
                    {/* Existing comments */}
                    {task.comments && task.comments.length > 0 ? (
                      <div className="mb-3 space-y-2">
                        {task.comments.map(comment => (
                          <div key={comment.id} className="p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-xs">{comment.userName}</span>
                              <span className="text-xs text-gray-500">{formatDate(comment.timestamp)}</span>
                            </div>
                            <p className="text-sm">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 mb-3">No comments yet</p>
                    )}
                    
                    {/* Add new comment */}
                    <div className="flex">
                      <input
                        type="text"
                        value={newComments[task.id] || ''}
                        onChange={(e) => handleCommentChange(task.id, e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 px-3 py-2 text-sm border rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        disabled={loading}
                      />
                      <button
                        onClick={() => submitComment(task.id)}
                        disabled={!newComments[task.id]?.trim() || loading}
                        className="px-3 py-2 bg-blue-600 text-white rounded-r-md text-sm hover:bg-blue-700 disabled:bg-blue-300"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* AI Task Insights Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Brain className="text-purple-600 mr-2" size={20} />
          <h3 className="text-lg font-medium">AI Task Insights</h3>
        </div>
        
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-start">
            <AlertTriangle className="text-purple-600 mr-3 mt-1 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-medium text-purple-800">Hidden Workload Analysis</h4>
              <p className="text-sm text-purple-700 mt-1">
                Our AI has detected that invisible household tasks like meal planning and appointment scheduling
                are disproportionately handled by Mama. Consider redistributing some of these tasks to create
                better balance.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Task Effectiveness Modal */}
{showEffectivenessModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full">
      <h3 className="text-lg font-medium mb-4">Task Effectiveness Feedback</h3>
      
      <p className="text-sm text-gray-600 mb-4">
        How effective was this task in helping balance responsibilities in your family?
      </p>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Effectiveness Rating (1-10):
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={effectivenessRating}
          onChange={(e) => setEffectivenessRating(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>1 (Not Effective)</span>
          <span>5 (Somewhat)</span>
          <span>10 (Very Effective)</span>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Feedback (Optional):
        </label>
        <textarea
          value={effectivenessFeedback}
          onChange={(e) => setEffectivenessFeedback(e.target.value)}
          placeholder="Share your thoughts on this task..."
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          rows={3}
        ></textarea>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => setShowEffectivenessModal(false)}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleEffectivenessSubmit}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {loading ? 'Submitting...' : 'Submit & Complete'}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default TasksTab;