// src/hooks/useSurvey.js
import { useState, useCallback } from 'react';
import * as surveyService from '../services/surveyService';
import { calculateBalanceScores } from '../utils/taskWeighting';
import { getUserFriendlyError } from '../utils/errorHandling';
import { useFamily } from './useFamily';

/**
 * Hook for survey functionality
 * @returns {Object} Survey methods and state
 */
export function useSurvey() {
  const { familyData } = useFamily();
  const [surveyQuestions, setSurveyQuestions] = useState([]);
  const [surveyResponses, setSurveyResponses] = useState({});
  const [completedQuestions, setCompletedQuestions] = useState([]);
  const [balanceScores, setBalanceScores] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generate survey questions
  const generateQuestions = useCallback((surveyType, weekNumber) => {
    try {
      const questions = surveyService.generateSurveyQuestions(surveyType, weekNumber, familyData);
      setSurveyQuestions(questions);
      return questions;
    } catch (err) {
      const errorMessage = getUserFriendlyError(err);
      setError(errorMessage);
      return [];
    }
  }, [familyData]);

  // Load saved survey responses
  const loadSurveyResponses = useCallback(async (familyId, memberId, surveyType) => {
    if (!familyId || !memberId || !surveyType) {
      setError("Missing required parameters");
      return {};
    }
    
    setError(null);
    try {
      setLoading(true);
      const responses = await surveyService.loadSurveyResponses(familyId, memberId, surveyType);
      setSurveyResponses(responses);
      
      // Update completed questions
      setCompletedQuestions(Object.keys(responses));
      
      return responses;
    } catch (err) {
      const errorMessage = getUserFriendlyError(err);
      setError(errorMessage);
      return {};
    } finally {
      setLoading(false);
    }
  }, []);

  // Save survey responses
  const saveSurveyResponses = useCallback(async (familyId, memberId, surveyType, responses, isCompleted = true) => {
    if (!familyId || !memberId || !surveyType) {
      setError("Missing required parameters");
      return false;
    }
    
    setError(null);
    try {
      setLoading(true);
      // Save the survey responses
      await surveyService.saveSurveyResponses(familyId, memberId, surveyType, responses);
      
      // If the survey is marked as completed, update the completion status
      if (isCompleted) {
        await surveyService.updateSurveyCompletionStatus(familyId, memberId, surveyType, true);
      }
      
      return true;
    } catch (err) {
      const errorMessage = getUserFriendlyError(err);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a single survey response
  const updateSurveyResponse = useCallback((questionId, answer) => {
    setSurveyResponses(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    if (!completedQuestions.includes(questionId)) {
      setCompletedQuestions(prev => [...prev, questionId]);
    }
  }, [completedQuestions]);

  // Calculate balance scores from survey responses
  const calculateBalance = useCallback(() => {
    if (surveyQuestions.length === 0 || Object.keys(surveyResponses).length === 0) {
      return null;
    }
    
    try {
      const familyPriorities = familyData?.priorities || {
        highestPriority: "Invisible Parental Tasks",
        secondaryPriority: "Visible Parental Tasks",
        tertiaryPriority: "Invisible Household Tasks"
      };
      
      const scores = calculateBalanceScores(surveyQuestions, surveyResponses, familyPriorities);
      setBalanceScores(scores);
      return scores;
    } catch (err) {
      const errorMessage = getUserFriendlyError(err);
      setError(errorMessage);
      return null;
    }
  }, [surveyQuestions, surveyResponses, familyData]);

  // Reset the survey
  const resetSurvey = useCallback(() => {
    setSurveyResponses({});
    setCompletedQuestions([]);
    setBalanceScores(null);
  }, []);

  // Get survey progress percentage
  const getSurveyProgress = useCallback(() => {
    if (surveyQuestions.length === 0) return 0;
    return (completedQuestions.length / surveyQuestions.length) * 100;
  }, [surveyQuestions, completedQuestions]);

  // Reset error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    surveyQuestions,
    surveyResponses,
    completedQuestions,
    balanceScores,
    loading,
    error,
    generateQuestions,
    loadSurveyResponses,
    saveSurveyResponses,
    updateSurveyResponse,
    calculateBalance,
    resetSurvey,
    getSurveyProgress,
    clearError
  };
}