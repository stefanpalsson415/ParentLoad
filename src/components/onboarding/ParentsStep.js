// src/components/onboarding/ParentsStep.js
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useAuth } from '../../contexts/AuthContext';

const ParentsStep = () => {
  const { familyData, updateFamilyData, nextStep, prevStep } = useOnboarding();
  const { currentUser } = useAuth();
  
  // Initialize parent data with current user
  const [parents, setParents] = useState(familyData.parents && familyData.parents.length > 0 
    ? familyData.parents 
    : [{ 
        id: currentUser?.uid || 'user-1',
        name: currentUser?.displayName || '',
        email: currentUser?.email || '',
        role: 'parent',
        type: 'Mama' // Default, can be changed
      }]
  );
  
  const [showAddPartner, setShowAddPartner] = useState(parents.length < 2);
  const [error, setError] = useState('');

  // Update parents in context when component unmounts
  useEffect(() => {
    return () => {
      updateFamilyData({ parents });
    };
  }, [parents, updateFamilyData]);

  const handleNameChange = (index, value) => {
    const updatedParents = [...parents];
    updatedParents[index].name = value;
    setParents(updatedParents);
  };

  const handleTypeChange = (index, value) => {
    const updatedParents = [...parents];
    updatedParents[index].type = value;
    setParents(updatedParents);
  };

  const handleEmailChange = (index, value) => {
    const updatedParents = [...parents];
    updatedParents[index].email = value;
    setParents(updatedParents);
  };

  const addPartner = () => {
    if (parents.length < 2) {
      setParents([...parents, { 
        id: `partner-${Date.now()}`,
        name: '',
        email: '',
        role: 'parent',
        type: parents[0]?.type === 'Mama' ? 'Papa' : 'Mama' // Set opposite of first parent
      }]);
      setShowAddPartner(false);
    }
  };

  const removePartner = (index) => {
    if (index > 0) { // Don't remove the first parent (current user)
      const updatedParents = [...parents];
      updatedParents.splice(index, 1);
      setParents(updatedParents);
      setShowAddPartner(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    const isValid = parents.every(parent => parent.name.trim() && parent.type);
    
    if (!isValid) {
      setError('Please fill in all fields for each parent');
      return;
    }
    
    // Update context and go to next step
    updateFamilyData({ parents });
    nextStep();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Who are the parents?</h2>
      
      {error && (
        <div className="mb-4 text-red-600">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {parents.map((parent, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Parent {index + 1}</h3>
                {index > 0 && (
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-800"
                    onClick={() => removePartner(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={parent.name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    placeholder="Full Name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={parent.type}
                    onChange={(e) => handleTypeChange(index, e.target.value)}
                  >
                    <option value="">Select Role</option>
                    <option value="Mama">Mama</option>
                    <option value="Papa">Papa</option>
                    <option value="Parent">Parent (Other)</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={parent.email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    placeholder="Email Address"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {showAddPartner && (
            <div className="mt-4">
              <button
                type="button"
                className="flex items-center text-blue-600 hover:text-blue-800"
                onClick={addPartner}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Partner
              </button>
            </div>
          )}
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

export default ParentsStep;