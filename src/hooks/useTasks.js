// src/hooks/useTasks.js
import { useState, useCallback } from 'react';
import * as taskService from '../services/taskService';
import { getUserFriendlyError } from '../utils/errorHandling';
import { useFamily } from './useFamily';

/**
 * Hook for task management functionality
 * @returns {Object} Task methods and state
 */
export function useTasks() {
  const { familyData } = useFamily();
  const [tasks, setTasks] = useState([]);
  const [weeklyTasks, setWeeklyTasks] = useState([]);
  const [meetingNotes, setMeetingNotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load all tasks for a family
  const loadTasks = useCallback(async () => {
    if (!familyData?.familyId) {
      setError("No family selected");
      return [];
    }
    
    setError(null);
    try {
      setLoading(true);
      const allTasks = await taskService.getTasks(familyData.familyId);
      setTasks(allTasks);
      
      // Filter tasks for the current week
      const currentWeek = familyData.currentWeek || 1;
      const currentWeekTasks = allTasks.filter(task => 
        task.id.toString().startsWith(`${currentWeek}-`) || 
        task.weekNumber === currentWeek
      );
      
      setWeeklyTasks(currentWeekTasks);
      return allTasks;
    } catch (err) {
      const errorMessage = getUserFriendlyError(err);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [familyData]);

  // Update task completion status
  const updateTaskCompletion = useCallback(async (taskId, isCompleted) => {
    if (!familyData?.familyId) {
      setError("No family selected");
      return false;
    }
    
    setError(null);
    try {
      setLoading(true);
      const completedDate = isCompleted ? new Date().toISOString() : null;
      await taskService.updateTaskCompletion(familyData.familyId, taskId, isCompleted, completedDate);
      
      // Update local state
      const updatedTasks = tasks.map(task => {
        if (task.id.toString() === taskId.toString()) {
          return {
            ...task,
            completed: isCompleted,
            completedDate
          };
        }
        return task;
      });
      
      setTasks(updatedTasks);
      
      // Also update weekly tasks
      const updatedWeeklyTasks = weeklyTasks.map(task => {
        if (task.id.toString() === taskId.toString()) {
          return {
            ...task,
            completed: isCompleted,
            completedDate
          };
        }
        return task;
      });
      
      setWeeklyTasks(updatedWeeklyTasks);
      
      return true;
    } catch (err) {
      const errorMessage = getUserFriendlyError(err);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [familyData, tasks, weeklyTasks]);

  // Update subtask completion status
  const updateSubtaskCompletion = useCallback(async (taskId, subtaskId, isCompleted) => {
    if (!familyData?.familyId) {
      setError("No family selected");
      return false;
    }
    
    setError(null);
    try {
      setLoading(true);
      const completedDate = isCompleted ? new Date().toISOString() : null;
      await taskService.updateSubtaskCompletion(
        familyData.familyId, 
        taskId, 
        subtaskId, 
        isCompleted, 
        completedDate
      );
      
      // Update local state - create a deep copy to ensure state updates properly
      const updatedTasks = JSON.parse(JSON.stringify(tasks));
      
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
      
      setTasks(updatedTasks);
      
      // Also update weekly tasks
      const updatedWeeklyTasks = JSON.parse(JSON.stringify(weeklyTasks));
      const weeklyTaskIndex = updatedWeeklyTasks.findIndex(t => t.id.toString() === taskId.toString());
      
      if (weeklyTaskIndex !== -1) {
        const task = updatedWeeklyTasks[weeklyTaskIndex];
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
      
      setWeeklyTasks(updatedWeeklyTasks);
      
      return true;
    } catch (err) {
      const errorMessage = getUserFriendlyError(err);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [familyData, tasks, weeklyTasks]);

  // Add a comment to a task
  const addTaskComment = useCallback(async (taskId, userId, userName, text) => {
    if (!familyData?.familyId) {
      setError("No family selected");
      return null;
    }
    
    setError(null);
    try {
      setLoading(true);
      const comment = await taskService.addTaskComment(
        familyData.familyId, 
        taskId, 
        userId, 
        userName, 
        text
      );
      
      // Update local state
      const updatedTasks = tasks.map(task => {
        if (task.id.toString() === taskId.toString()) {
          return {
            ...task,
            comments: [...(task.comments || []), comment]
          };
        }
        return task;
      });
      
      setTasks(updatedTasks);
      
      // Also update weekly tasks
      const updatedWeeklyTasks = weeklyTasks.map(task => {
        if (task.id.toString() === taskId.toString()) {
          return {
            ...task,
            comments: [...(task.comments || []), comment]
          };
        }
        return task;
      });
      
      setWeeklyTasks(updatedWeeklyTasks);
      
      return comment;
    } catch (err) {
      const errorMessage = getUserFriendlyError(err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [familyData, tasks, weeklyTasks]);

  // Save family meeting notes
  const saveMeetingNotes = useCallback(async (weekNumber, notes) => {
    if (!familyData?.familyId) {
      setError("No family selected");
      return false;
    }
    
    setError(null);
    try {
      setLoading(true);
      await taskService.saveFamilyMeetingNotes(familyData.familyId, weekNumber, notes);
      
      // Update local state
      setMeetingNotes(prev => ({
        ...prev,
        [weekNumber]: notes
      }));
      
      return true;
    } catch (err) {
      const errorMessage = getUserFriendlyError(err);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [familyData]);

  // Generate tasks for a week
  const generateWeeklyTasks = useCallback((weekNumber, previousTasks = [], surveyResponses = {}) => {
    try {
      const newTasks = taskService.generateTasks(weekNumber, previousTasks, surveyResponses);
      return newTasks;
    } catch (err) {
      const errorMessage = getUserFriendlyError(err);
      setError(errorMessage);
      return [];
    }
  }, []);

  // Reset error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    tasks,
    weeklyTasks,
    meetingNotes,
    loading,
    error,
    loadTasks,
    updateTaskCompletion,
    updateSubtaskCompletion,
    addTaskComment,
    saveMeetingNotes,
    generateWeeklyTasks,
    clearError
  };
}