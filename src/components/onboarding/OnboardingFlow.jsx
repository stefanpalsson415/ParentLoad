// src/components/onboarding/OnboardingFlow.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../hooks/useOnboarding';
import { useAuth } from '../../hooks/useAuth';

// Import your onboarding step components
import FamilyNameStep from './FamilyNameStep';
import ParentsStep from './ParentsStep';
import ChildrenStep from './ChildrenStep';
import PrioritiesStep from './PrioritiesStep';
import ReviewStep from './ReviewStep';

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    onboardingData, 
    currentStep, 
    loading, 
    error, 
    updateStepData, 
    nextStep, 
    prevStep, 
    completeOnboarding,
    clearError
  } = useOnboarding();

  // Redirect authenticated users if they're not doing onboarding
  useEffect(() => {
    if (currentUser) {
      // If user is already logged in, redirect to dashboard
      // unless they're specifically starting the onboarding flow
      const isStartingOnboarding = sessionStorage.getItem('startingOnboarding');
      if (!isStartingOnboarding) {
        navigate('/dashboard');
      }
    }
  }, [currentUser, navigate]);

  // Handle step submission
  const handleStepSubmit = async (stepName, data) => {
    // Clear any previous errors
    clearError();
    
    // Update data for this step
    const success = updateStepData(stepName, data);
    if (!success) return;
    
    // If this is the final step, complete onboarding
    if (currentStep === 5) {
      const family = await completeOnboarding();
      if (family) {
        // Clear the onboarding flag
        sessionStorage.removeItem('startingOnboarding');
        // Navigate to the survey
        navigate('/survey');
      }
    } else {
      // Otherwise, go to the next step
      nextStep();
    }
  };

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <FamilyNameStep 
            initialData={onboardingData}
            onSubmit={(data) => handleStepSubmit('familyName', data)}
            loading={loading}
            error={error}
          />
        );
      case 2:
        return (
          <ParentsStep 
            initialData={onboardingData}
            onSubmit={(data) => handleStepSubmit('parents', data)}
            onBack={prevStep}
            loading={loading}
            error={error}
          />
        );
      case 3:
        return (
          <ChildrenStep 
            initialData={onboardingData}
            onSubmit={(data) => handleStepSubmit('children', data)}
            onBack={prevStep}
            loading={loading}
            error={error}
          />
        );
      case 4:
        return (
          <PrioritiesStep 
            initialData={onboardingData}
            onSubmit={(data) => handleStepSubmit('priorities', data)}
            onBack={prevStep}
            loading={loading}
            error={error}
          />
        );
      case 5:
        return (
          <ReviewStep 
            data={onboardingData}
            onSubmit={() => handleStepSubmit('review', {})}
            onBack={prevStep}
            loading={loading}
            error={error}
          />
        );
      default:
        return <div>Invalid step</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <div 
                key={step}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step === currentStep
                    ? 'bg-blue-600 text-white'
                    : step < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute left-0 right-0 h-1 bg-gray-200 top-0"></div>
            <div 
              className="absolute left-0 h-1 bg-blue-600 top-0"
              style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Step content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;