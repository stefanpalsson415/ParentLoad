// src/components/onboarding/PrioritiesStep.jsx
import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, Award, Star, Scale, Sliders } from 'lucide-react';

const PrioritiesStep = ({ onboardingData, updateStepData, nextStep, prevStep, completeOnboarding }) => {
  const defaultPriorities = {
    highestPriority: "Invisible Parental Tasks",
    secondaryPriority: "Visible Parental Tasks",
    tertiaryPriority: "Invisible Household Tasks"
  };
  
  const [priorities, setPriorities] = useState(onboardingData.priorities || defaultPriorities);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    "Visible Household Tasks",
    "Invisible Household Tasks",
    "Visible Parental Tasks",
    "Invisible Parental Tasks"
  ];

  const handlePriorityChange = (priorityLevel, value) => {
    // Check if this value is already used in another priority level
    const isValueUsedElsewhere = Object.entries(priorities).some(
      ([key, val]) => val === value && key !== priorityLevel
    );
    
    if (isValueUsedElsewhere) {
      setError('Each category can only be selected once');
      return;
    }
    
    setPriorities({
      ...priorities,
      [priorityLevel]: value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("Submitting priorities:", JSON.stringify(priorities));


    // Check for duplicate priorities before proceeding
    const priorityValues = Object.values(priorities);
    const uniqueValues = new Set(priorityValues);
    
    if (uniqueValues.size !== priorityValues.length) {
      setError('Each category can only be selected once. Please choose different categories for each priority level.');
      return; // Prevent form submission
    }
    
    // Update the priorities data
    const success = updateStepData('priorities', { priorities });
    if (!success) {
      setError('Failed to update priorities. Please try again.');
      return;
    }
    
    setLoading(true);
    setError(''); // Clear any previous errors
    
    try {
      // Complete the onboarding process
      console.log("Starting onboarding completion with priorities:", JSON.stringify(priorities));
      const result = await completeOnboarding();
      console.log("Onboarding result:", result);
      
      if (result) {
        // Onboarding is complete, navigate to the next page
        nextStep();
      } else {
        setError('Failed to complete onboarding. Please check your information and try again.');
      }
    } catch (err) {
      console.error("Complete onboarding error details:", err);
      // More specific error message based on common issues
      if (err.message?.includes('email-already-in-use')) {
        setError('An account with this email already exists. Please use a different email or log in.');
      } else if (err.message?.includes('network')) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError(err.message || 'Failed to complete onboarding. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to describe each category
  const getCategoryDescription = (category) => {
    switch(category) {
      case "Visible Household Tasks":
        return "Cleaning, cooking, laundry, and other observable housework";
      case "Invisible Household Tasks":
        return "Planning, organizing, remembering important dates and appointments";
      case "Visible Parental Tasks":
        return "Direct childcare, homework help, driving kids to activities";
      case "Invisible Parental Tasks":
        return "Emotional support, monitoring developmental needs, educational planning";
      default:
        return "";
    }
  };


  // Check if there are any duplicate selections
const hasDuplicates = () => {
  const values = Object.values(priorities);
  return new Set(values).size !== values.length;
};

  // Helper function to get appropriate icon for each priority level
  const getPriorityIcon = (level) => {
    switch(level) {
      case 'highestPriority':
        return <Award size={20} className="text-yellow-500" />;
      case 'secondaryPriority':
        return <Star size={20} className="text-blue-500" />;
      case 'tertiaryPriority':
        return <CheckCircle size={20} className="text-green-500" />;
      default:
        return null;
    }
  };

  

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-light mb-4 text-center">Family Priorities</h2>
      <p className="text-gray-600 mb-8 text-center font-light">
        Choose what matters most to your family
      </p>
      
      {/* Educational Panel */}
      <div className="bg-amber-50 p-6 rounded-lg border border-amber-100 mb-8">
        <div className="flex items-center mb-4">
          <Scale size={24} className="text-amber-600 mr-2" />
          <h3 className="text-xl font-medium text-amber-800">The Task Weighting System</h3>
        </div>
        
        <p className="text-amber-800 font-light mb-4">
          Allie uses a revolutionary mathematical model to accurately measure family workloads. Your priorities help personalize this system to your family's values.
        </p>
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white p-3 rounded">
            <h4 className="font-medium text-amber-800 text-center">Highest Priority</h4>
            <p className="text-center text-amber-800 text-sm font-light">
              +50% weight
            </p>
          </div>
          
          <div className="bg-white p-3 rounded">
            <h4 className="font-medium text-amber-800 text-center">Secondary</h4>
            <p className="text-center text-amber-800 text-sm font-light">
              +30% weight
            </p>
          </div>
          
          <div className="bg-white p-3 rounded">
            <h4 className="font-medium text-amber-800 text-center">Tertiary</h4>
            <p className="text-center text-amber-800 text-sm font-light">
              +10% weight
            </p>
          </div>
        </div>
        
        <div className="bg-amber-100 p-3 rounded">
          <p className="text-amber-800 text-sm font-light">
            <strong>Example:</strong> If "Invisible Parental Tasks" is your highest priority, tasks like monitoring children's emotional wellbeing receive 50% more weight in balance calculations, ensuring these important but often unrecognized contributions are properly valued.
          </p>
        </div>
      </div>
      
      {/* AI Weighting System */}
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-8">
        <div className="flex items-start">
          <Sliders size={20} className="text-purple-600 mt-1 mr-2 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-purple-800">How Allie Uses This Information</h4>
            <p className="text-sm text-purple-700 mt-1">
              Your priorities directly influence our AI weighting system. High-priority tasks receive a multiplier of 1.5x in our calculations, secondary priorities get a 1.3x multiplier, and tertiary priorities get a 1.1x multiplier. This ensures our recommendations focus on the areas that matter most to your family.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {['highestPriority', 'secondaryPriority', 'tertiaryPriority'].map((priorityLevel) => (
              <div key={priorityLevel} className="mb-6">
                <div className="flex items-center mb-3">
                  {getPriorityIcon(priorityLevel)}
                  <h3 className="text-xl font-light ml-2">
                    {priorityLevel === 'highestPriority' ? 'Highest Priority' :
                     priorityLevel === 'secondaryPriority' ? 'Secondary Priority' :
                     'Tertiary Priority'}
                  </h3>
                </div>
                
                <p className="text-sm text-gray-500 mb-3 font-light">
                  {priorityLevel === 'highestPriority' ? 'Tasks in this category will be given 50% more weight in calculations' :
                   priorityLevel === 'secondaryPriority' ? 'Tasks in this category will be given 30% more weight' :
                   'Tasks in this category will be given 10% more weight'}
                </p>
                
                <select
                  value={priorities[priorityLevel]}
                  onChange={(e) => handlePriorityChange(priorityLevel, e.target.value)}
                  className={`w-full px-4 py-3 border rounded-md ${
                    error && (error.includes('category') || hasDuplicates()) 
                      ? 'border-red-500' 
                      : 'border-gray-300'
                  }`}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                
                <p className="text-sm text-gray-500 mt-2 font-light">
                  {getCategoryDescription(priorities[priorityLevel])}
                </p>
              </div>
            ))}
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-6">
              {error}
            </div>
          )}
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={prevStep}
              className="flex-1 flex items-center justify-center bg-gray-100 text-gray-800 py-3 px-6 rounded-md hover:bg-gray-200 transition-colors font-medium"
              disabled={loading}
            >
              <ArrowLeft size={18} className="mr-2" />
              Back
            </button>
            <button
  type="submit"
  className="flex-1 flex items-center justify-center bg-black text-white py-3 px-6 rounded-md hover:bg-gray-800 transition-colors font-medium"
  disabled={loading || hasDuplicates()}
>
  {loading ? 'Creating Family...' : 'Complete Setup'}
  {!loading && <ArrowRight size={18} className="ml-2" />}
</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrioritiesStep;