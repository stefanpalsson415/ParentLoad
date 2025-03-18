// src/components/onboarding/FamilyNameStep.js
import React, { useState } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';

const FamilyNameStep = () => {
  const { familyData, updateFamilyData, nextStep } = useOnboarding();
  const [familyName, setFamilyName] = useState(familyData.familyName || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    if (!familyName.trim()) {
      setError('Please enter a family name');
      return;
    }
    
    // Update context and go to next step
    updateFamilyData({ familyName });
    nextStep();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">What's your family name?</h2>
      
      {error && (
        <div className="mb-4 text-red-600">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label 
            htmlFor="familyName" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Family Name
          </label>
          <input
            type="text"
            id="familyName"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., The Smiths"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
          />
          <p className="mt-1 text-sm text-gray-500">
            This is how we'll refer to your family in the app
          </p>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default FamilyNameStep;