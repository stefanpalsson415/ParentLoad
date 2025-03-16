// src/components/onboarding/InvisibleLoadStep.jsx
import React from 'react';
import { ArrowRight, ArrowLeft, Brain } from 'lucide-react';

const InvisibleLoadStep = ({ nextStep, prevStep }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-light mb-6 text-center">The Invisible Load</h2>
      <p className="text-lg mb-8 text-center font-light">
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
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center mb-4">
          <Brain size={24} className="text-blue-600 mr-3" />
          <h3 className="text-xl font-medium">The Science Behind Balance</h3>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-lg mb-6">
          <h3 className="font-medium mb-4">Research Findings</h3>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
            <li>85% of mothers report handling most of household planning</li>
            <li>Families with more balanced workloads report 40% higher satisfaction</li>
            <li>Children in balanced homes show better emotional development</li>
            <li>Reduced tension leads to more quality family time</li>
          </ul>
        </div>
        
        <p className="text-gray-600 font-light">
          Allie uses this research to create a data-driven approach to family balance.
        </p>
      </div>
      
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
          type="button"
          onClick={nextStep}
          className="flex-1 flex items-center justify-center bg-black text-white py-3 px-6 rounded-md hover:bg-gray-800 transition-colors font-medium"
        >
          Continue
          <ArrowRight size={18} className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default InvisibleLoadStep;