// src/contexts/OnboardingContext.js
import React, { createContext, useContext, useState } from 'react';

const OnboardingContext = createContext();

export function useOnboarding() {
  return useContext(OnboardingContext);
}

export function OnboardingProvider({ children }) {
  // State to track the current step in the onboarding process
  const [currentStep, setCurrentStep] = useState(1);
  
  // State to store the collected data
  const [familyData, setFamilyData] = useState({
    familyName: '',
    parents: [],
    children: [],
    priorities: {
      highestPriority: 'Invisible Parental Tasks',
      secondaryPriority: 'Visible Parental Tasks',
      tertiaryPriority: 'Invisible Household Tasks'
    }
  });
  
  // Function to update family data
  const updateFamilyData = (data) => {
    setFamilyData(prevData => ({
      ...prevData,
      ...data
    }));
  };
  
  // Function to go to the next step
  const nextStep = () => {
    setCurrentStep(prevStep => prevStep + 1);
  };
  
  // Function to go to the previous step
  const prevStep = () => {
    setCurrentStep(prevStep => Math.max(1, prevStep - 1));
  };
  
  // Function to go to a specific step
  const goToStep = (step) => {
    setCurrentStep(step);
  };
  
  // Reset the onboarding process
  const resetOnboarding = () => {
    setCurrentStep(1);
    setFamilyData({
      familyName: '',
      parents: [],
      children: [],
      priorities: {
        highestPriority: 'Invisible Parental Tasks',
        secondaryPriority: 'Visible Parental Tasks',
        tertiaryPriority: 'Invisible Household Tasks'
      }
    });
  };
  
  const value = {
    currentStep,
    familyData,
    updateFamilyData,
    nextStep,
    prevStep,
    goToStep,
    resetOnboarding
  };
  
  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}