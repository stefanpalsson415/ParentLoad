// src/components/onboarding/CompleteStep.js (Enhanced)
import React, { useState } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';

const CompleteStep = ({ onComplete }) => {
  const { familyData, prevStep } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);

  const handleComplete = async () => {
    try {
      console.log('🟢 Starting family creation process...');
      console.log('🟢 Family data being submitted:', JSON.stringify(familyData, null, 2));
      
      setLoading(true);
      setError('');
      setDebugInfo(null);
      
      // Call the completion handler from parent component
      const result = await onComplete();
      
      console.log('🟢 Family creation successful!', result);
      
      // Store debug info
      setDebugInfo({
        success: true,
        familyId: result?.familyId,
        message: 'Family created successfully'
      });
      
    } catch (err) {
      console.error('🔴 Error in family creation:', err);
      setError(`Failed to create your family: ${err.message}`);
      
      // Store error in debug info
      setDebugInfo({
        success: false,
        error: err.message,
        stack: err.stack
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Ready to Set Up Your Family</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {debugInfo && debugInfo.success && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
          <p>Success! Family created with ID: {debugInfo.familyId}</p>
          <p className="text-sm">You will be redirected to the dashboard...</p>
        </div>
      )}
      
      <div className="bg-gray-50 p-6 rounded-md mb-8">
        <h3 className="text-lg font-medium mb-4">Here's a summary of your family:</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Family Name:</h4>
            <p>{familyData.familyName}</p>
          </div>
          
          <div>
            <h4 className="font-medium">Parents:</h4>
            <ul className="list-disc list-inside">
              {familyData.parents.map((parent, index) => (
                <li key={index}>
                  {parent.name} ({parent.type})
                </li>
              ))}
            </ul>
          </div>
          
          {familyData.children.length > 0 && (
            <div>
              <h4 className="font-medium">Children:</h4>
              <ul className="list-disc list-inside">
                {familyData.children.map((child, index) => (
                  <li key={index}>
                    {child.name} (Age: {child.age})
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div>
            <h4 className="font-medium">Priorities:</h4>
            <ol className="list-decimal list-inside">
              <li>{familyData.priorities.highestPriority}</li>
              <li>{familyData.priorities.secondaryPriority}</li>
              <li>{familyData.priorities.tertiaryPriority}</li>
            </ol>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-md mb-8">
        <h3 className="font-medium text-blue-800 mb-2">What's Next?</h3>
        <p className="text-blue-700">
          After creating your family, you'll be taken to the dashboard where you can:
        </p>
        <ul className="space-y-2 mt-2 text-sm text-blue-700">
          <li>• Complete the initial family assessment</li>
          <li>• View your family's balance data</li>
          <li>• Start implementing custom recommendations</li>
          <li>• Track your progress over time</li>
        </ul>
      </div>
      
      <div className="flex justify-between mt-8">
        <button
          type="button"
          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
          onClick={prevStep}
          disabled={loading}
        >
          Back
        </button>
        
        <button
          type="button"
          className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400"
          onClick={handleComplete}
          disabled={loading}
        >
          {loading ? 'Creating Family...' : 'Create Family'}
        </button>
      </div>
    </div>
  );
};

export default CompleteStep;