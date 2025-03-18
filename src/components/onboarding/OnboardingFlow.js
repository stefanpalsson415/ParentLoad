import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingProvider, useOnboarding } from '../../contexts/OnboardingContext';
import FamilyNameStep from './FamilyNameStep';
import ParentsStep from './ParentsStep';
import ChildrenStep from './ChildrenStep';
import PrioritiesStep from './PrioritiesStep';
import CompleteStep from './CompleteStep';
import { createFamily } from '../../services/familyService';
import { useAuth } from '../../contexts/AuthContext';

// Wrapper component that provides the OnboardingContext
const OnboardingFlowWrapper = () => {
  return (
    <OnboardingProvider>
      <OnboardingFlowContent />
    </OnboardingProvider>
  );
};

// Main content component that uses the OnboardingContext
const OnboardingFlowContent = () => {
  const { currentStep, familyData } = useOnboarding();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [debug, setDebug] = useState({ active: false, messages: [] });

  // Function to handle completion of onboarding
  const handleComplete = async () => {
    try {
      console.log('🟡 OnboardingFlow: handleComplete called');
      console.log('🟡 Current user:', currentUser);
      
      // Add debug message
      const addDebugMessage = (message, type = 'info') => {
        setDebug(prev => ({
          active: true,
          messages: [...prev.messages, { message, type, timestamp: new Date().toISOString() }]
        }));
      };

      addDebugMessage('Starting family creation process...');
      
      if (!currentUser) {
        addDebugMessage('No authenticated user found!', 'error');
        throw new Error('You must be logged in to create a family');
      }
      
      addDebugMessage(`Using user ID: ${currentUser.uid}`);
      addDebugMessage(`Family data prepared: ${JSON.stringify({
        name: familyData.familyName,
        parentCount: familyData.parents.length,
        childCount: familyData.children.length
      })}`);
      
      // Create family in the database
      const newFamily = await createFamily(familyData, currentUser.uid);
      
      addDebugMessage(`Family created successfully with ID: ${newFamily.familyId}`, 'success');
      
      // Short delay to ensure data is properly saved
      addDebugMessage('Preparing to navigate to dashboard...');
      
      navigate('/dashboard', { 
        state: { 
          familyId: newFamily.familyId,
          newlyCreated: true
        },
        replace: true // This will replace the current entry in history to prevent going back to onboarding
      });
      
      return newFamily;
    } catch (error) {
      console.error('🔴 Error in handleComplete:', error);
      setDebug(prev => ({
        active: true,
        messages: [...prev.messages, { 
          message: `Error: ${error.message}`, 
          type: 'error',
          stack: error.stack,
          timestamp: new Date().toISOString()
        }]
      }));
      throw error;
    }
  };

  // Render different step components based on currentStep
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <FamilyNameStep />;
      case 2:
        return <ParentsStep />;
      case 3:
        return <ChildrenStep />;
      case 4:
        return <PrioritiesStep />;
      case 5:
        return <CompleteStep onComplete={handleComplete} />;
      default:
        return <FamilyNameStep />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto pt-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-light text-gray-900">Allie</h1>
          <p className="mt-2 text-gray-600">Let's set up your family</p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Step {currentStep} of 5</span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / 5) * 100)}% Complete
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full mt-2">
            <div 
              className="h-full bg-black rounded-full" 
              style={{ width: `${(currentStep / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Render the current step */}
        <div className="bg-white shadow rounded-lg p-6">
          {renderStep()}
        </div>
        
        {/* Debug panel (only visible when active) */}
        {debug.active && (
          <div className="mt-8 bg-gray-800 text-white p-4 rounded-lg text-sm overflow-auto max-h-60">
            <h3 className="font-bold mb-2">Debug Information</h3>
            <div className="space-y-1">
              {debug.messages.map((item, index) => (
                <div 
                  key={index} 
                  className={`pl-2 border-l-2 ${
                    item.type === 'error' ? 'border-red-500 text-red-300' : 
                    item.type === 'success' ? 'border-green-500 text-green-300' :
                    'border-blue-500 text-blue-300'
                  }`}
                >
                  {item.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlowWrapper;