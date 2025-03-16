import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Brain } from 'lucide-react';

const ParentsStep = ({ onboardingData, updateStepData, nextStep, prevStep }) => {
  // Initialize with default parents but keep structure minimal
  const [parent1Name, setParent1Name] = useState('');
  const [parent1Email, setParent1Email] = useState('');
  const [parent1Password, setParent1Password] = useState('');
  
  const [parent2Name, setParent2Name] = useState('');
  const [parent2Email, setParent2Email] = useState('');
  const [parent2Password, setParent2Password] = useState('');
  
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate that at least one parent has complete info
    if (!(parent1Name && parent1Email && parent1Password) && 
        !(parent2Name && parent2Email && parent2Password)) {
      setError('At least one parent must have complete information');
      return;
    }
    
    // Create parent data array
    const parentData = [];
    
    // Add first parent if they have any data
    if (parent1Name || parent1Email || parent1Password) {
      parentData.push({
        name: parent1Name,
        email: parent1Email,
        password: parent1Password,
        role: 'Mama'
      });
    }
    
    // Add second parent if they have any data
    if (parent2Name || parent2Email || parent2Password) {
      parentData.push({
        name: parent2Name,
        email: parent2Email,
        password: parent2Password,
        role: 'Papa'
      });
    }
    
    console.log("Submitting parent data:", parentData);
    
    // THIS IS THE KEY CHANGE - pass the data with the right structure
    const success = updateStepData('parents', { parentData });
    if (success) {
      nextStep();
    } else {
      setError('Failed to update data');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-light mb-4 text-center">Parent Information</h2>
      <p className="text-gray-600 mb-8 text-center font-light">
        Tell us about the parents in your family
      </p>
      
      {/* Simple Educational Panel */}
      <div className="bg-purple-50 p-4 rounded-lg mb-6">
        <h3 className="text-xl font-medium text-purple-800 mb-2 flex items-center">
          <Brain size={24} className="text-purple-600 mr-2" />
          The Science Behind Allie
        </h3>
        <p className="text-purple-800 text-sm mb-2">
          Allie's scientific approach measures family workload through seven research-backed factors.
        </p>
      </div>
      
      {/* Simple Parent Forms */}
      <div style={{border: '2px solid #ddd', padding: '20px', marginBottom: '20px'}}>
        <h3 className="font-medium mb-4">Mama Information</h3>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Name</label>
          <input
            type="text"
            value={parent1Name}
            onChange={(e) => setParent1Name(e.target.value)}
            placeholder="Mama's name"
            className="w-full px-4 py-2 border border-gray-300 rounded"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={parent1Email}
            onChange={(e) => setParent1Email(e.target.value)}
            placeholder="Mama's email"
            className="w-full px-4 py-2 border border-gray-300 rounded"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={parent1Password}
            onChange={(e) => setParent1Password(e.target.value)}
            placeholder="Create password"
            className="w-full px-4 py-2 border border-gray-300 rounded"
          />
        </div>
      </div>
      
      <div style={{border: '2px solid #ddd', padding: '20px', marginBottom: '20px'}}>
        <h3 className="font-medium mb-4">Papa Information</h3>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Name</label>
          <input
            type="text"
            value={parent2Name}
            onChange={(e) => setParent2Name(e.target.value)}
            placeholder="Papa's name"
            className="w-full px-4 py-2 border border-gray-300 rounded"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={parent2Email}
            onChange={(e) => setParent2Email(e.target.value)}
            placeholder="Papa's email"
            className="w-full px-4 py-2 border border-gray-300 rounded"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={parent2Password}
            onChange={(e) => setParent2Password(e.target.value)}
            placeholder="Create password"
            className="w-full px-4 py-2 border border-gray-300 rounded"
          />
        </div>
      </div>
      
      {error && <p className="text-red-500 mb-4 font-medium">{error}</p>}
      
      <div className="flex gap-4">
        <button
          type="button"
          onClick={prevStep}
          className="flex-1 bg-gray-100 text-gray-800 py-3 px-6 rounded hover:bg-gray-200"
        >
          <ArrowLeft className="inline mr-2" size={18} />
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 bg-black text-white py-3 px-6 rounded hover:bg-gray-800"
        >
          Continue
          <ArrowRight className="inline ml-2" size={18} />
        </button>
      </div>
    </div>
  );
};

export default ParentsStep;