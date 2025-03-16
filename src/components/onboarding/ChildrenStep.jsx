// src/components/onboarding/ChildrenStep.jsx
import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Plus, X, Users, Baby } from 'lucide-react';

const ChildrenStep = ({ onboardingData, updateStepData, nextStep, prevStep }) => {
  const [children, setChildren] = useState(onboardingData.childrenData || []);
  const [newChild, setNewChild] = useState({ name: '', age: '' });
  const [error, setError] = useState('');

  const addChild = () => {
    if (!newChild.name) {
      setError('Child name is required');
      return;
    }
    
    if (newChild.age && (isNaN(newChild.age) || newChild.age < 0)) {
      setError('Age must be a valid number');
      return;
    }
    
    setChildren([...children, { ...newChild }]);
    setNewChild({ name: '', age: '' });
    setError('');
  };

  const removeChild = (index) => {
    const updatedChildren = [...children];
    updatedChildren.splice(index, 1);
    setChildren(updatedChildren);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // It's okay to have no children, but if newChild has partial data, validate it
    if (newChild.name || newChild.age) {
      if (!newChild.name) {
        setError('Please complete or clear the new child information');
        return;
      }
      
      // Add the current child before proceeding
      addChild();
    }
    
    const success = updateStepData('children', { children });
    if (success) {
      nextStep();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-light mb-4 text-center">Children Information</h2>
      <p className="text-gray-600 mb-8 text-center font-light">
        Tell us about the children in your family (optional)
      </p>
      
      {/* Educational Panel */}
      <div className="bg-green-50 p-6 rounded-lg border border-green-100 mb-8">
        <div className="flex items-center mb-4">
        <Baby size={24} className="text-green-600 mr-2" />          <h3 className="text-xl font-medium text-green-800">The Impact on Children</h3>
        </div>
        
        <div className="mb-4">
          <p className="text-green-800 font-light mb-4">
            Children learn gender roles primarily by observing their parents. Research shows that children raised in families with balanced workloads have:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded">
              <h4 className="font-medium text-green-800 text-center mb-2">Short-Term Benefits</h4>
              <ul className="text-sm text-green-800 font-light space-y-1">
                <li>• Better understanding of cooperation</li>
                <li>• Appreciation for all types of work</li>
                <li>• Healthier family relationships</li>
                <li>• Less stress in the home environment</li>
              </ul>
            </div>
            
            <div className="bg-white p-3 rounded">
              <h4 className="font-medium text-green-800 text-center mb-2">Long-Term Effects</h4>
              <ul className="text-sm text-green-800 font-light space-y-1">
                <li>• More diverse career aspirations</li>
                <li>• Healthier future relationships</li>
                <li>• Better work-life balance as adults</li>
                <li>• Less gender-based limitations</li>
              </ul>
            </div>
          </div>
        </div>
        
        <p className="text-green-800 font-light text-sm border-t border-green-200 pt-3 mt-3">
          Allie helps make your children an age-appropriate part of the family balance journey through kid-friendly surveys and educational features.
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
        <form onSubmit={handleSubmit}>
          {/* List of added children */}
          {children.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <Users size={20} className="text-gray-500 mr-2" />
                <h3 className="text-xl font-light">Your Children</h3>
              </div>
              
              <ul className="space-y-3">
                {children.map((child, index) => (
                  <li key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
                    <div>
                      <span className="font-medium">{child.name}</span>
                      {child.age && <span className="ml-2 text-gray-500">Age: {child.age}</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeChild(index)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <X size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Add new child form */}
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <Plus size={20} className="text-gray-500 mr-2" />
              <h3 className="text-xl font-light">Add a Child</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Name
                </label>
                <input
                  type="text"
                  value={newChild.name}
                  onChange={(e) => setNewChild({...newChild, name: e.target.value})}
                  placeholder="Enter child's name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Age (optional)
                </label>
                <input
                  type="number"
                  value={newChild.age}
                  onChange={(e) => setNewChild({...newChild, age: e.target.value})}
                  placeholder="Enter child's age"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <button
              type="button"
              onClick={addChild}
              className="w-full flex items-center justify-center bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus size={18} className="mr-2" />
              Add Child
            </button>
          </div>
          
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
    </div>
  );
};

export default ChildrenStep;