// src/components/onboarding/ParentsStep.jsx
import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, User, BarChart3, Brain } from 'lucide-react';

const ParentsStep = ({ onboardingData, updateStepData, nextStep, prevStep }) => {
  const [parents, setParents] = useState(onboardingData.parentData || [
    { name: '', role: 'Mama', email: '', password: '' },
    { name: '', role: 'Papa', email: '', password: '' }
  ]);
  const [error, setError] = useState('');

  const handleParentChange = (index, field, value) => {
    const updatedParents = [...parents];
    updatedParents[index] = { 
      ...updatedParents[index],
      [field]: value
    };
    setParents(updatedParents);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Check that at least one parent has complete information
    if (!parents.some(p => p.name && p.email && p.password)) {
      setError('At least one parent must have complete information');
      isValid = false;
    }
    
    // Validate each parent's information
    parents.forEach(parent => {
      if (parent.email && !emailRegex.test(parent.email)) {
        setError('Please enter a valid email address');
        isValid = false;
      }
      
      if (parent.password && parent.password.length < 6) {
        setError('Password must be at least 6 characters');
        isValid = false;
      }
    });
    
    if (!isValid) return;
    
    // Filter out empty parents
    const validParents = parents.filter(p => p.name && p.email && p.password);
    
    const success = updateStepData('parents', { parents: validParents });
    if (success) {
      nextStep();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-light mb-4 text-center">Parent Information</h2>
      <p className="text-gray-600 mb-8 text-center font-light">
        Tell us about the parents in your family
      </p>
      
      {/* Educational Panel */}
      <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 mb-8">
        <div className="flex items-center mb-4">
          <Brain size={24} className="text-purple-600 mr-2" />
          <h3 className="text-xl font-medium text-purple-800">The Science Behind Allie</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-purple-800 mb-2">Our 7-Factor Weight System</h4>
            <p className="text-purple-800 font-light text-sm mb-3">
              Allie's scientific approach measures family workload through seven research-backed factors:
            </p>
            <ul className="text-sm text-purple-800 font-light space-y-1">
              <li>Time Investment</li>
              <li>Task Frequency</li>
              <li>Invisibility Factor</li>
              <li>Emotional Labor</li>
              <li>Research-Backed Impact</li>
              <li>Child Development Impact</li>
              <li>Family Priority Alignment</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-purple-800 mb-2">Unique Perspectives</h4>
            <p className="text-purple-800 font-light text-sm">
              Allie captures data from each parent's perspective to identify perception gaps and hidden imbalances that traditional approaches miss.
            </p>
            <div className="mt-3 bg-white rounded p-3">
              <BarChart3 size={60} className="text-purple-300 mx-auto" />
            </div>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {parents.map((parent, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center mb-4">
              <User size={20} className="text-gray-500 mr-2" />
              <h3 className="text-xl font-light">Parent {index + 1}</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Role
                </label>
                <select
                  value={parent.role}
                  onChange={(e) => handleParentChange(index, 'role', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md"
                >
                  <option value="Mama">Mama</option>
                  <option value="Papa">Papa</option>
                  <option value="Other Parent">Other Parent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Name
                </label>
                <input
                  type="text"
                  value={parent.name}
                  onChange={(e) => handleParentChange(index, 'name', e.target.value)}
                  placeholder="Enter name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">
                Email
              </label>
              <input
                type="email"
                value={parent.email}
                onChange={(e) => handleParentChange(index, 'email', e.target.value)}
                placeholder="Enter email"
                className="w-full px-4 py-3 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Password
              </label>
              <input
                type="password"
                value={parent.password}
                onChange={(e) => handleParentChange(index, 'password', e.target.value)}
                placeholder="Create password"
                className="w-full px-4 py-3 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        ))}
        
        {error && <p className="text-red-500 text-sm mb-6">{error}</p>}
        
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