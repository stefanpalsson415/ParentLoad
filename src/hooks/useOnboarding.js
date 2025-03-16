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

  const updateStepData = useCallback((step, data) => {
    try {
      // Validate the step data
      console.log("updateStepData called with:", step, data);
      
      // Extra logging for debugging
      if (step === 'parentData') {
        setOnboardingData(prev => {
          return {
            ...prev,
            parentData: Array.isArray(data) ? data : [data]
          };
        });
        return true;
      }
      
      const validatedData = onboardingService.validateOnboardingStep(step, data);
      console.log("Validation successful, validated data:", validatedData);
      
      // Update the onboarding data
      setOnboardingData(prev => {
        const updated = {
          ...prev,
          ...validatedData
        };
        console.log("Updated onboarding data:", updated);
        return updated;
      });
      
      return true;
    } catch (err) {
      console.error("Error in updateStepData for step:", step);
      console.error("Error object:", err);
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
      setError(err.message || "Error updating data");
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

  const completeOnboarding = useCallback(async () => {
    setError(null);
    try {
      setLoading(true);
      
      console.log("COMPLETE ONBOARDING DATA CHECK:");
      console.log("- familyName:", onboardingData.familyName);
      console.log("- parentData:", onboardingData.parentData ? 
        `${onboardingData.parentData.length} parents` : 'MISSING - THIS IS THE LIKELY ISSUE');
      console.log("- childrenData:", onboardingData.childrenData ? 
        `${onboardingData.childrenData.length} children` : 'none');
      console.log("- priorities:", onboardingData.priorities);


      console.log("Completing onboarding with data:", JSON.stringify({
        familyName: onboardingData.familyName,
        parentData: onboardingData.parentData?.map(p => ({...p, password: '******'})),
        childrenData: onboardingData.childrenData,
        priorities: onboardingData.priorities
      }));
      
      // Create the family
      const newFamily = await onboardingService.createFamilyFromOnboarding(onboardingData);
      
      return newFamily;
    } catch (err) {
      console.error("Error in completeOnboarding:", err);
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