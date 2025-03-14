// src/components/onboarding/OnboardingFlow.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../hooks/useOnboarding';
import FamilyNameStep from './FamilyNameStep';
import ParentsStep from './ParentsStep';
import ChildrenStep from './ChildrenStep';
import PrioritiesStep from './PrioritiesStep';
import LoadingScreen from '../common/LoadingScreen';

const OnboardingFlow = () => {
  const {
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
  } = useOnboarding();
  
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();
  
  // Display error messages
  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        clearError();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);
  
  // Handle completion of onboarding
  const handleComplete = async () => {
    const result = await completeOnboarding();
    if (result) {
      navigate('/loading', { state: { destination: '/survey', message: 'Family created successfully! Setting up your survey...' } });
    }
  };
  
  // Show loading screen while processing
  if (loading) {
    return <LoadingScreen message="Setting up your family..." />;
  }
  
  // Render the appropriate step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <FamilyNameStep
            onboardingData={onboardingData}
            updateStepData={updateStepData}
            nextStep={nextStep}
          />
        );
      case 2:
        return (
          <ParentsStep
            onboardingData={onboardingData}
            updateStepData={updateStepData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 3:
        return (
          <ChildrenStep
            onboardingData={onboardingData}
            updateStepData={updateStepData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 4:
        return (
          <PrioritiesStep
            onboardingData={onboardingData}
            updateStepData={updateStepData}
            nextStep={handleComplete}
            prevStep={prevStep}
            completeOnboarding={completeOnboarding}
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* Progress indicator */}
      <div className="max-w-md mx-auto mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Step {currentStep} of 4</span>
          <span className="text-sm text-gray-600">{Math.round((currentStep / 4) * 100)}% Complete</span>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Error message */}
      {showError && (
        <div className="max-w-md mx-auto mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {/* Step content */}
      {renderStep()}
    </div>
  );
};

export default OnboardingFlow;