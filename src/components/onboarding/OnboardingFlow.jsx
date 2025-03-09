// Create a new file: src/components/onboarding/OnboardingFlow.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OnboardingFlow = () => {
  const [step, setStep] = useState(1);
  const [familyData, setFamilyData] = useState({
    familyName: '',
    parents: [
      { name: '', role: 'Mama', email: '', password: '' },
      { name: '', role: 'Papa', email: '', password: '' }
    ],
    children: [{ name: '', age: '' }]
  });
  const navigate = useNavigate();
  
  const totalSteps = 10;
  
  // Handle data updates
  const updateFamily = (key, value) => {
    setFamilyData(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const updateParent = (index, field, value) => {
    const updatedParents = [...familyData.parents];
    updatedParents[index] = { ...updatedParents[index], [field]: value };
    updateFamily('parents', updatedParents);
  };
  
  const updateChild = (index, field, value) => {
    const updatedChildren = [...familyData.children];
    updatedChildren[index] = { ...updatedChildren[index], [field]: value };
    updateFamily('children', updatedChildren);
  };
  
  const addChild = () => {
    updateFamily('children', [...familyData.children, { name: '', age: '' }]);
  };
  
  const removeChild = (index) => {
    const updatedChildren = [...familyData.children];
    updatedChildren.splice(index, 1);
    updateFamily('children', updatedChildren);
  };
  
  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="text-center">
            <h2 className="text-3xl font-light mb-6">Welcome to Allie</h2>
            <p className="text-lg mb-8">We're excited to help your family find better balance.</p>
            <img 
              src="/placeholder-image.jpg" 
              alt="Family Balance" 
              className="w-64 h-64 mx-auto mb-8 rounded-full bg-gray-100"
            />
            <p className="text-gray-600 mb-8">
              In the next few minutes, we'll help you set up your family profile and get started.
            </p>
          </div>
        );
        
      case 2:
        return (
          <div className="text-center">
            <h2 className="text-3xl font-light mb-6">The Invisible Load</h2>
            <p className="text-lg mb-8">
              Did you know? Mental load is the invisible work of managing a household that often goes unnoticed.
            </p>
            <div className="flex justify-center space-x-4 mb-8">
              <div className="bg-purple-100 p-4 rounded-lg">
                <h3 className="font-medium">Invisible Tasks</h3>
                <p className="text-sm">Planning, organizing, remembering, coordinating</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg">
                <h3 className="font-medium">Visible Tasks</h3>
                <p className="text-sm">Cooking, cleaning, driving, physical childcare</p>
              </div>
            </div>
            <p className="text-gray-600">
              Allie helps measure and balance both visible and invisible work.
            </p>
          </div>
        );
      
      // Additional steps for family name, parents, children...
      case 3:
        return (
          <div>
            <h2 className="text-3xl font-light mb-6">What's your family name?</h2>
            <input
              type="text"
              className="w-full p-3 border rounded mb-4"
              placeholder="e.g., The Andersons"
              value={familyData.familyName}
              onChange={e => updateFamily('familyName', e.target.value)}
            />
          </div>
        );
        
      // More steps would be defined here...
      
      case 10:
        return (
          <div className="text-center">
            <h2 className="text-3xl font-light mb-6">You're all set!</h2>
            <p className="text-lg mb-8">
              Now let's take your first family balance survey to see where you stand.
            </p>
            <button
              onClick={() => navigate('/survey')}
              className="px-8 py-4 bg-blue-600 text-white rounded-md text-lg font-medium"
            >
              Take the Survey
            </button>
          </div>
        );
        
      default:
        return <div>Step content not found</div>;
    }
  };
  
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress indicator */}
      <div className="h-1 bg-gray-200">
        <div 
          className="h-full bg-blue-600 transition-all duration-500"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        ></div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          {renderStep()}
          
          <div className="flex justify-between mt-8">
            <button
              onClick={() => step > 1 && setStep(step - 1)}
              className={`px-4 py-2 ${step === 1 ? 'invisible' : ''}`}
            >
              Back
            </button>
            
            {step < totalSteps ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Continue
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;