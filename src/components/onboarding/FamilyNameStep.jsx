// src/components/onboarding/FamilyNameStep.jsx
import React, { useState } from 'react';
import { ArrowRight, Home, Heart, Star } from 'lucide-react';

const FamilyNameStep = ({ onboardingData, updateStepData, nextStep }) => {
  const [familyName, setFamilyName] = useState(onboardingData.familyName || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!familyName.trim()) {
      setError('Please enter a family name');
      return;
    }
    
    const success = updateStepData('familyName', { familyName });
    if (success) {
      nextStep();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-light mb-4 text-center">Welcome to Allie</h2>
      <p className="text-gray-600 mb-8 text-center font-light">
        Your journey to a more balanced family life begins here
      </p>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Educational Panel */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <div className="flex items-center mb-4">
            <Heart size={24} className="text-blue-600 mr-2" />
            <h3 className="text-xl font-medium text-blue-800">Why Balance Matters</h3>
          </div>
          
          <p className="text-blue-800 mb-4 font-light">
            Research shows that families with balanced workloads experience:
          </p>
          
          <ul className="space-y-2 text-blue-800 font-light">
            <li className="flex items-start">
              <Star size={16} className="text-yellow-500 mt-1 mr-2 flex-shrink-0" />
              <span>33% less parental burnout</span>
            </li>
            <li className="flex items-start">
              <Star size={16} className="text-yellow-500 mt-1 mr-2 flex-shrink-0" />
              <span>Improved relationship satisfaction</span>
            </li>
            <li className="flex items-start">
              <Star size={16} className="text-yellow-500 mt-1 mr-2 flex-shrink-0" />
              <span>Better outcomes for children</span>
            </li>
            <li className="flex items-start">
              <Star size={16} className="text-yellow-500 mt-1 mr-2 flex-shrink-0" />
              <span>More time for what truly matters</span>
            </li>
          </ul>
          
          <div className="mt-6 pt-4 border-t border-blue-200">
            <p className="text-blue-800 font-light italic">
              "Allie has transformed how we share responsibilities in our home. We're happier, less stressed, and our kids see more balanced role models."
            </p>
            <p className="text-blue-700 text-sm mt-2">— The Johnsons, using Allie for 6 months</p>
          </div>
        </div>
        
        {/* Form Panel */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center mb-6">
            <Home size={24} className="text-gray-500 mr-3" />
            <h3 className="text-xl font-light">Name Your Family</h3>
          </div>
          
          <p className="text-gray-600 mb-6 font-light">
            Your family name creates a shared identity in Allie where you'll track progress together.
          </p>
          
          <div className="mb-6">
            <label htmlFor="familyName" className="block text-gray-700 mb-2 font-medium">
              Family Name
            </label>
            <input
              type="text"
              id="familyName"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="Enter your family name"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
          
          <button
            type="submit"
            className="w-full flex items-center justify-center bg-black text-white py-3 px-6 rounded-md hover:bg-gray-800 transition-colors font-medium"
          >
            Continue
            <ArrowRight size={18} className="ml-2" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default FamilyNameStep;