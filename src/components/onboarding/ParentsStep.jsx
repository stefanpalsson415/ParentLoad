// src/components/onboarding/ParentsStep.jsx
import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, User, Mail, Key } from 'lucide-react';

const ParentsStep = ({ onboardingData, updateStepData, nextStep, prevStep }) => {
  // Initialize with default or existing parents data
  const initialParents = onboardingData.parentData || [];
  
  const [parent1Name, setParent1Name] = useState(
    initialParents[0]?.name || ''
  );
  const [parent1Email, setParent1Email] = useState(
    initialParents[0]?.email || ''
  );
  const [parent1Password, setParent1Password] = useState(
    initialParents[0]?.password || ''
  );
  
  const [parent2Name, setParent2Name] = useState(
    initialParents[1]?.name || ''
  );
  const [parent2Email, setParent2Email] = useState(
    initialParents[1]?.email || ''
  );
  const [parent2Password, setParent2Password] = useState(
    initialParents[1]?.password || ''
  );
  
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Debug logging
    console.log("Parent 1 data:", { name: parent1Name, email: parent1Email, password: parent1Password ? '********' : '' });
    console.log("Parent 2 data:", { name: parent2Name, email: parent2Email, password: parent2Password ? '********' : '' });
    
    // Validate that at least one parent has complete info
    if (!(parent1Name && parent1Email && parent1Password) && 
        !(parent2Name && parent2Email && parent2Password)) {
      setError('At least one parent must have complete information');
      return;
    }
    
    
    // Create parent data array
    const parentData = [];
    
    // Add first parent if they have complete data
    if (parent1Name && parent1Email && parent1Password) {
      parentData.push({
        name: parent1Name,
        email: parent1Email,
        password: parent1Password,
        role: 'Mama'
      });
    }
    
    // Add second parent if they have complete data
    if (parent2Name && parent2Email && parent2Password) {
      parentData.push({
        name: parent2Name,
        email: parent2Email,
        password: parent2Password,
        role: 'Papa'
      });
    }
    
    console.log("Submitting parent data:", JSON.stringify(parentData.map(p => ({...p, password: '********'}))));
    
    // Validation checks
    if (parentData.length === 0) {
      setError('Please add at least one parent with complete information');
      return;
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const parent of parentData) {
      if (!emailRegex.test(parent.email)) {
        setError(`Invalid email format for ${parent.name}`);
        return;
      }
      
      if (parent.password.length < 6) {
        setError('Passwords must be at least 6 characters');
        return;
      }
    }
    
    // Check if both parents have the same email
    if (parentData.length > 1 && parentData[0].email === parentData[1].email) {
      setError('Both parents cannot use the same email address');
      return;
    }
    
    // Make sure we're passing an array of parent objects
console.log("About to call updateStepData with parentData:", parentData.length, "parents");
const success = updateStepData('parentData', parentData);
    console.log("updateStepData result:", success);
    
    if (success) {
      console.log("Step update successful, moving to next step");
      nextStep();
    } else {
      console.error("Step update failed");
      setError('Failed to update data. Please check your information and try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-light mb-4 text-center">Parent Information</h2>
      <p className="text-gray-600 mb-8 text-center font-light">
        Tell us about the parents in your family
      </p>
      
      {/* Parent Forms */}
      <form onSubmit={handleSubmit}>
        <div className="mb-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-medium text-lg mb-4">Mama Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <div className="flex items-center border rounded-md overflow-hidden">
                <div className="bg-gray-100 p-2 flex items-center justify-center">
                  <User size={18} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  value={parent1Name}
                  onChange={(e) => setParent1Name(e.target.value)}
                  placeholder="Mama's name"
                  className="flex-1 p-2 focus:outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="flex items-center border rounded-md overflow-hidden">
                <div className="bg-gray-100 p-2 flex items-center justify-center">
                  <Mail size={18} className="text-gray-500" />
                </div>
                <input
                  type="email"
                  value={parent1Email}
                  onChange={(e) => setParent1Email(e.target.value)}
                  placeholder="Mama's email"
                  className="flex-1 p-2 focus:outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="flex items-center border rounded-md overflow-hidden">
                <div className="bg-gray-100 p-2 flex items-center justify-center">
                  <Key size={18} className="text-gray-500" />
                </div>
                <input
                  type="password"
                  value={parent1Password}
                  onChange={(e) => setParent1Password(e.target.value)}
                  placeholder="Create a password"
                  className="flex-1 p-2 focus:outline-none"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
            </div>
          </div>
        </div>
        
        <div className="mb-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-medium text-lg mb-4">Papa Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <div className="flex items-center border rounded-md overflow-hidden">
                <div className="bg-gray-100 p-2 flex items-center justify-center">
                  <User size={18} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  value={parent2Name}
                  onChange={(e) => setParent2Name(e.target.value)}
                  placeholder="Papa's name"
                  className="flex-1 p-2 focus:outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="flex items-center border rounded-md overflow-hidden">
                <div className="bg-gray-100 p-2 flex items-center justify-center">
                  <Mail size={18} className="text-gray-500" />
                </div>
                <input
                  type="email"
                  value={parent2Email}
                  onChange={(e) => setParent2Email(e.target.value)}
                  placeholder="Papa's email"
                  className="flex-1 p-2 focus:outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="flex items-center border rounded-md overflow-hidden">
                <div className="bg-gray-100 p-2 flex items-center justify-center">
                  <Key size={18} className="text-gray-500" />
                </div>
                <input
                  type="password"
                  value={parent2Password}
                  onChange={(e) => setParent2Password(e.target.value)}
                  placeholder="Create a password"
                  className="flex-1 p-2 focus:outline-none"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}
        
        <div className="flex gap-4">
          <button
            type="button"
            onClick={prevStep}
            className="flex-1 flex items-center justify-center bg-gray-100 text-gray-800 py-3 px-6 rounded-md hover:bg-gray-200 transition-colors font-medium"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back
          </button>
          <button
            type="submit"
            className="flex-1 flex items-center justify-center bg-black text-white py-3 px-6 rounded-md hover:bg-gray-800 transition-colors font-medium"
          >
            Continue
            <ArrowRight size={18} className="ml-2" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ParentsStep;