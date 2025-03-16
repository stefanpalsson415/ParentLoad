// src/components/onboarding/TaskCategoriesStep.jsx
import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const TaskCategoriesStep = ({ nextStep, prevStep }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-light mb-6 text-center">The Four Categories of Family Tasks</h2>
      <p className="text-gray-600 mb-8 text-center font-light">
        Allie divides family responsibilities into four categories to help identify imbalances.
      </p>
      
      <div className="space-y-4">
        <div className="p-4 border rounded-lg bg-blue-50">
          <h3 className="font-medium text-blue-800 mb-1">Visible Household Tasks</h3>
          <p className="text-sm text-blue-700">
            Physical tasks you can see: cooking, cleaning, laundry, yard work, home repairs
          </p>
        </div>
        
        <div className="p-4 border rounded-lg bg-purple-50">
          <h3 className="font-medium text-purple-800 mb-1">Invisible Household Tasks</h3>
          <p className="text-sm text-purple-700">
            Mental work of running a home: planning meals, managing schedules, remembering events, coordinating appointments
          </p>
        </div>
        
        <div className="p-4 border rounded-lg bg-green-50">
          <h3 className="font-medium text-green-800 mb-1">Visible Parenting Tasks</h3>
          <p className="text-sm text-green-700">
            Physical childcare: driving kids, helping with homework, bedtime routines, attending events
          </p>
        </div>
        
        <div className="p-4 border rounded-lg bg-amber-50">
          <h3 className="font-medium text-amber-800 mb-1">Invisible Parenting Tasks</h3>
          <p className="text-sm text-amber-700">
            Emotional labor: providing emotional support, anticipating needs, coordinating with schools, monitoring development
          </p>
        </div>
      </div>
      
      <div className="mt-8 flex gap-4">
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

export default TaskCategoriesStep;