// src/components/onboarding/PrioritiesStep.js
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';

const PrioritiesStep = () => {
  const { familyData, updateFamilyData, nextStep, prevStep } = useOnboarding();
  
  // Initialize priority values from context or with defaults
  const [priorities, setPriorities] = useState(
    familyData.priorities || {
      highestPriority: 'Invisible Parental Tasks',
      secondaryPriority: 'Visible Parental Tasks',
      tertiaryPriority: 'Invisible Household Tasks'
    }
  );
  
  // Available priority options
  const priorityOptions = [
    'Invisible Parental Tasks',
    'Visible Parental Tasks',
    'Invisible Household Tasks',
    'Visible Household Tasks'
  ];

  // Update priorities in context when component unmounts
  useEffect(() => {
    return () => {
      updateFamilyData({ priorities });
    };
  }, [priorities, updateFamilyData]);

  const handlePriorityChange = (priorityKey, value) => {
    // Find current priority that has this value
    const currentKeyWithValue = Object.keys(priorities).find(key => priorities[key] === value);
    
    // If this value is already assigned to another priority, swap them
    if (currentKeyWithValue && currentKeyWithValue !== priorityKey) {
      setPriorities(prev => ({
        ...prev,
        [currentKeyWithValue]: prev[priorityKey],
        [priorityKey]: value
      }));
    } else {
      // Otherwise just update this priority
      setPriorities(prev => ({
        ...prev,
        [priorityKey]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // No validation needed here, all options are valid
    
    // Update context and go to next step
    updateFamilyData({ priorities });
    nextStep();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">What are your family's priorities?</h2>
      
      <div className="mb-6">
        <p className="text-gray-700">
          These priorities help us customize our recommendations for your family. Rank these areas from most important to least important for your family right now.
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Highest Priority
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={priorities.highestPriority}
              onChange={(e) => handlePriorityChange('highestPriority', e.target.value)}
            >
              {priorityOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Tasks in this category will receive the highest weighting in our recommendations
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Second Priority
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={priorities.secondaryPriority}
              onChange={(e) => handlePriorityChange('secondaryPriority', e.target.value)}
            >
              {priorityOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Third Priority
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={priorities.tertiaryPriority}
              onChange={(e) => handlePriorityChange('tertiaryPriority', e.target.value)}
            >
              {priorityOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-8">
          <div className="bg-blue-50 p-4 rounded-md mb-6">
            <h3 className="font-medium text-blue-800 mb-2">What do these categories mean?</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>
                <strong>Invisible Parental Tasks:</strong> Mental and emotional work related to children (anticipating needs, researching activities, coordinating schedules)
              </li>
              <li>
                <strong>Visible Parental Tasks:</strong> Direct childcare tasks (feeding, bathing, helping with homework, taking to activities)
              </li>
              <li>
                <strong>Invisible Household Tasks:</strong> Planning and management of the home (meal planning, keeping track of supplies, planning maintenance)
              </li>
              <li>
                <strong>Visible Household Tasks:</strong> Physical household work (cleaning, cooking, laundry, repairs)
              </li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-between mt-8">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            onClick={prevStep}
          >
            Back
          </button>
          
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

export default PrioritiesStep;