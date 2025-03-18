// src/components/onboarding/ChildrenStep.js
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';

const ChildrenStep = () => {
  const { familyData, updateFamilyData, nextStep, prevStep } = useOnboarding();
  const [children, setChildren] = useState(familyData.children || []);
  const [error, setError] = useState('');

  // Update children in context when component unmounts
  useEffect(() => {
    return () => {
      updateFamilyData({ children });
    };
  }, [children, updateFamilyData]);

  const handleNameChange = (index, value) => {
    const updatedChildren = [...children];
    updatedChildren[index].name = value;
    setChildren(updatedChildren);
  };

  const handleAgeChange = (index, value) => {
    const updatedChildren = [...children];
    // Ensure value is a number and within valid range
    const age = Math.min(Math.max(parseInt(value) || 0, 0), 18);
    updatedChildren[index].age = age;
    setChildren(updatedChildren);
  };

  const addChild = () => {
    setChildren([...children, { 
      id: `child-${Date.now()}`,
      name: '',
      age: '',
      role: 'child'
    }]);
  };

  const removeChild = (index) => {
    const updatedChildren = [...children];
    updatedChildren.splice(index, 1);
    setChildren(updatedChildren);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate if there are any children
    if (children.length > 0) {
      const isValid = children.every(child => child.name.trim() && child.age !== '');
      
      if (!isValid) {
        setError('Please fill in all fields for each child');
        return;
      }
    }
    
    // Update context and go to next step
    updateFamilyData({ children });
    nextStep();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Do you have children?</h2>
      
      {error && (
        <div className="mb-4 text-red-600">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {children.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-md mb-8">
            <p className="text-gray-700 mb-4">No children added yet</p>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={addChild}
            >
              Add a Child
            </button>
          </div>
        ) : (
          <div className="space-y-6 mb-8">
            <p className="text-gray-700">Please provide details for each child:</p>
            
            {children.map((child, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Child {index + 1}</h3>
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-800"
                    onClick={() => removeChild(index)}
                  >
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={child.name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      placeholder="Child's Name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="18"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={child.age}
                      onChange={(e) => handleAgeChange(index, e.target.value)}
                      placeholder="Age"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <div className="mt-4">
              <button
                type="button"
                className="flex items-center text-blue-600 hover:text-blue-800"
                onClick={addChild}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Another Child
              </button>
            </div>
          </div>
        )}
        
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

export default ChildrenStep;