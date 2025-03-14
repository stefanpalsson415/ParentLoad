// src/hooks/useOnboarding.js
import { useState, useCallback } from 'react';
import * as onboardingService from '../services/onboardingService';
import { getUserFriendlyError } from '../utils/errorHandling';

/**
 * Hook for onboarding functionality
 * @returns {Object} Onboarding methods and state
 */
export function useOnboarding() {
  const [onboardingData, setOnboardingData] = useState({
    familyName: '',
    parentData: [],
    childrenData: [],
    priorities: {
      highestPriority: "Invisible Parental Tasks",
      secondaryPriority: "Visible Parental Tasks",
      tertiaryPriority: "Invisible Household Tasks"
    }
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update onboarding data for a specific step
  const updateStepData = useCallback((step, data) => {
    try {
      // Validate the step data
      const validatedData = onboardingService.validateOnboardingStep(step, data);
      
      // Update the onboarding data
      setOnboardingData(prev => ({
        ...prev,
        ...validatedData
      }));
      
      return true;
    } catch (err) {
      const errorMessage = getUserFriendlyError(err);
      setError(errorMessage);
      return false;
    }
  }, []);

  // Navigate to the next step
  const nextStep = useCallback(() => {
    setCurrentStep(prev => prev + 1);
  }, []);

  // Navigate to the previous step
  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  }, []);

  // Go to a specific step
  const goToStep = useCallback((step) => {
    setCurrentStep(step);
  }, []);

  // Complete the onboarding process
  const completeOnboarding = useCallback(async () => {
    setError(null);
    try {
      setLoading(true);
      
      // Create the family
      const newFamily = await onboardingService.createFamilyFromOnboarding(onboardingData);
      
      return newFamily;
    } catch (err) {
      const errorMessage = getUserFriendlyError(err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [onboardingData]);

  // Reset error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    onboardingData,
    currentStep,
    loading,
    error,
    updateStepData,
    nextStep,
    prevStep,
    goToStep,
    completeOnboarding,
    clearError
  };
}