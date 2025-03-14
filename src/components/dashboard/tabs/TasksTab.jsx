// src/components/dashboard/tabs/TasksTab.jsx
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, X, MessageCircle, Clock, AlertCircle, 
  ChevronDown, ChevronUp, Brain
} from 'lucide-react';
import { useFamily } from '../../../hooks/useFamily';

const TasksTab = () => {
  const { 
    familyData, 
    familyMembers, 
    selectedMember,
    taskRecommendations,
    loadCurrentWeekTasks,
    updateTaskCompletion,
    updateSubtaskCompletion,
    addTaskComment
  } = useFamily();
  
  const [tasks, setTasks] = useState([]);
  const [expandedTasks, setExpandedTasks] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  // Load tasks on component mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const loadedTasks = await loadCurrentWeekTasks();
        if (loadedTasks) {
          setTasks(loadedTasks);
        }
      } catch (error) {
        console.error("Error loading tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTasks();
  }, [loadCurrentWeekTasks]);

  // Toggle task expansion
  const toggleTaskExpanded = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Toggle comments expansion
  const toggleCommentsExpanded = (taskId) => {
    setExpandedComments(prev => ({
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
    }
  };

  // Handle task completion toggle
  const handleTaskCompletion = async (taskId, isCompleted) => {
    try {
      await updateTaskCompletion(taskId, !isCompleted);
    } catch (error) {
      console.error("Error updating task completion:", error);
    }
  };

  // Handle subtask completion toggle
  const handleSubtaskCompletion = async (taskId, subtaskId, isCompleted) => {
    try {
      await updateSubtaskCompletion(taskId, subtaskId, !isCompleted);
    } catch (error) {
      console.error("Error updating subtask completion:", error);
    }
  };

  // Filter tasks for the current user
  const filteredTasks = tasks.filter(task => {
    // Filter by assignment
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

  if (loading) {
    return <div className="flex justify-center py-8">Loading tasks...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filter options */}
      <div className="flex items-center space-x-2 p-2 mb-4 bg-gray-50 rounded-lg">
        <span className="text-sm text-gray-500">Filter:</span>
        <div className="flex space-x-1">
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

      {/* Tasks list */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">No tasks found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map(task => (
            <div key={task.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Task Header */}
              <div className="p-4 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex items-start mr-2">
                    <div 
                      className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-0.5 border ${
                        task.completed 
                          ? 'bg-green-100 border-green-500 text-green-700' 
                          : 'bg-gray-100 border-gray-300 text-gray-500'
                      }`}
                      onClick={() => handleTaskCompletion(task.id, task.completed)}
                    >
                      {task.completed && <CheckCircle size={14} />}
                    </div>
                    <div>
                      <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.assignedTo === 'Mama' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {task.assignedToName || task.assignedTo}
                    </span>
                    
                    {task.isAIGenerated && (
                      <span className="mt-1 px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs flex items-center">
                        <Brain size={10} className="mr-1" />
                        AI Insight
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Task Details Button */}
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
                      Completed {new Date(task.completedDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Task Details (expandable) */}
              {expandedTasks[task.id] && (
                <div className="px-4 py-3 bg-gray-50">
                  {/* AI Insight if available */}
                  {(task.insight || task.aiInsight) && (
                    <div className="mb-3 p-3 bg-purple-50 rounded-md border border-purple-200">
                      <div className="flex items-start">
                        <Brain size={16} className="text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-purple-800">AI Insight:</h4>
                          <p className="text-xs text-purple-700 mt-1">
                            {task.insight || task.aiInsight}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Subtasks if available */}
                  {task.subTasks && task.subTasks.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-2">Subtasks:</h4>
                      <div className="space-y-2">
                        {task.subTasks.map(subtask => (
                          <div 
                            key={subtask.id} 
                            className="flex items-start p-2 bg-white rounded border border-gray-200"
                          >
                            <div 
                              className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mr-2 border ${
                                subtask.completed 
                                  ? 'bg-green-100 border-green-500 text-green-700' 
                                  : 'bg-gray-100 border-gray-300 text-gray-500'
                              }`}
                              onClick={() => handleSubtaskCompletion(task.id, subtask.id, subtask.completed)}
                            >
                              {subtask.completed && <CheckCircle size={12} />}
                            </div>
                            <div>
                              <p className={`text-sm ${subtask.completed ? 'line-through text-gray-500' : ''}`}>
                                {subtask.title}
                              </p>
                              {subtask.description && (
                                <p className="text-xs text-gray-500 mt-0.5">{subtask.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Task metadata */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-600">
                    {task.category && (
                      <div>
                        <span className="font-medium">Category:</span> {task.category}
                      </div>
                    )}
                    {task.focusArea && (
                      <div>
                        <span className="font-medium">Focus Area:</span> {task.focusArea}
                      </div>
                    )}
                    {task.hiddenWorkloadType && (
                      <div>
                        <span className="font-medium">Hidden Workload Type:</span> {task.hiddenWorkloadType}
                      </div>
                    )}
                  </div>
                  
                  {/* Comments section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">Comments:</h4>
                      {task.comments?.length > 0 && (
                        <button 
                          className="text-xs flex items-center text-gray-600"
                          onClick={() => toggleCommentsExpanded(task.id)}
                        >
                          {expandedComments[task.id] ? (
                            <>
                              <ChevronUp size={12} className="mr-1" />
                              Hide
                            </>
                          ) : (
                            <>
                              <ChevronDown size={12} className="mr-1" />
                              Show {task.comments.length} {task.comments.length === 1 ? 'comment' : 'comments'}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    
                    {/* Existing comments */}
                    {expandedComments[task.id] && task.comments?.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {task.comments.map(comment => (
                          <div 
                            key={comment.id} 
                            className="p-2 bg-gray-100 rounded text-sm"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium text-xs">{comment.userName}</span>
                              <span className="text-xs text-gray-500">{comment.timestamp}</span>
                            </div>
                            <p className="text-sm">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Add new comment */}
                    <div className="mt-2 flex">
                      <input
                        type="text"
                        value={newComments[task.id] || ''}
                        onChange={(e) => handleCommentChange(task.id, e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 px-3 py-1 text-sm border rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => submitComment(task.id)}
                        disabled={!newComments[task.id]?.trim()}
                        className="px-3 py-1 bg-blue-600 text-white rounded-r text-sm hover:bg-blue-700 disabled:bg-blue-300"
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
    </div>
  );
};

export default TasksTab;