import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, ArrowLeft, ArrowRight, CheckCircle, 
  Info, Clock, Calendar
} from 'lucide-react';
import { useFamily } from '../../hooks/useFamily';

const CoupleCheckInScreen = () => {
  const navigate = useNavigate();
  const { familyData, saveCoupleCheckInData } = useFamily();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({
    satisfaction: 5,
    communication: 5,
    workloadBalance: 5,
    support: 5,
    stress: 5,
    teamwork: 5,
    appreciation: 5,
    qualityTime: 5
  });
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Steps for the check-in process
  const steps = [
    {
      id: 'introduction',
      title: 'Weekly Couple Check-In',
      type: 'info',
      content: 'This short check-in helps track how workload balance affects your relationship. It takes about 3 minutes to complete.'
    },
    {
      id: 'satisfaction',
      title: 'Overall Satisfaction',
      question: 'How satisfied are you with your relationship this week?',
      field: 'satisfaction',
      description: 'Consider your overall feelings about your relationship over the past 7 days.'
    },
    {
      id: 'workloadBalance',
      title: 'Workload Balance',
      question: 'How fair did the distribution of responsibilities feel this week?',
      field: 'workloadBalance',
      description: 'Consider both visible tasks (like cleaning) and invisible work (like planning and emotional labor).'
    },
    {
      id: 'communication',
      title: 'Communication Quality',
      question: 'How would you rate your communication as a couple this week?',
      field: 'communication',
      description: 'Consider how well you expressed needs and listened to each other.'
    },
    {
      id: 'support',
      title: 'Feeling Supported',
      question: 'How supported did you feel by your partner this week?',
      field: 'support',
      description: 'Consider emotional support, practical help, and understanding.'
    },
    {
      id: 'teamwork',
      title: 'Teamwork Effectiveness',
      question: 'How well did you work together as a team this week?',
      field: 'teamwork',
      description: 'Consider coordination, cooperation, and shared decision making.'
    },
    {
      id: 'appreciation',
      title: 'Feeling Appreciated',
      question: 'How appreciated did you feel for your contributions this week?',
      field: 'appreciation',
      description: 'Consider verbal acknowledgment and other expressions of gratitude.'
    },
    {
      id: 'qualityTime',
      title: 'Quality Time',
      question: 'How satisfied are you with the quality time you spent together this week?',
      field: 'qualityTime',
      description: 'Consider both quantity and quality of time without distractions.'
    },
    {
      id: 'feedback',
      title: 'Additional Thoughts',
      question: 'Any specific observations or feelings about your relationship this week?',
      field: 'feedback',
      type: 'textarea'
    },
    {
      id: 'summary',
      title: 'Check-In Complete',
      type: 'summary',
      content: 'Thank you for completing your weekly couple check-in! This helps track how workload balance impacts your relationship.'
    }
  ];
  
  // Get current step
  const currentStepData = steps[currentStep];
  
  // Handle input changes
  const handleInputChange = (field, value) => {
    setResponses(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle next step
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Handle previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Submit check-in data
  const submitCheckIn = async () => {
    if (!familyData?.familyId) {
      setError("No family selected");
      return;
    }
    
    try {
      setSaving(true);
      
      // Add timestamp and current week
      const checkInData = {
        ...responses,
        feedback,
        timestamp: new Date().toISOString(),
        weekNumber: familyData.currentWeek || 1
      };
      
      // Save to database
      await saveCoupleCheckInData(familyData.familyId, familyData.currentWeek || 1, checkInData);
      
      // Go to final step
      setCurrentStep(steps.length - 1);
    } catch (err) {
      setError("Error saving check-in data: " + err.message);
    } finally {
      setSaving(false);
    }
  };
  
  // Complete and return to dashboard
  const finishCheckIn = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </span>
            {currentStepData.type !== 'summary' && (
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / (steps.length - 1)) * 100)}% complete
              </span>
            )}
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="flex items-center">
              <Heart className="mr-2" size={24} />
              <h2 className="text-xl font-bold">{currentStepData.title}</h2>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            {/* Step Content */}
            {currentStepData.type === 'info' && (
              <div className="flex items-start mb-6">
                <Info className="text-blue-500 mr-3 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-gray-700">{currentStepData.content}</p>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Clock className="text-gray-500 mr-2" size={16} />
                      <span>Takes 3 minutes</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="text-gray-500 mr-2" size={16} />
                      <span>Week {familyData?.currentWeek || 1}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {currentStepData.type === 'summary' && (
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
                <h3 className="text-xl font-medium mb-2">Check-In Complete!</h3>
                <p className="text-gray-600 mb-6">{currentStepData.content}</p>
                <button
                  onClick={finishCheckIn}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
            
            {!currentStepData.type && (
              <div>
                <h3 className="text-lg font-medium mb-1">{currentStepData.question}</h3>
                <p className="text-sm text-gray-600 mb-6">{currentStepData.description}</p>
                
                {currentStepData.field === 'feedback' ? (
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Share your thoughts (optional)"
                    className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={5}
                  ></textarea>
                ) : (
                  <div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={responses[currentStepData.field]}
                      onChange={(e) => handleInputChange(currentStepData.field, parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>Poor (1)</span>
                      <span>Average (5)</span>
                      <span>Excellent (10)</span>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <div className="inline-block px-4 py-2 bg-blue-50 rounded-lg">
                        <span className="text-3xl font-bold text-blue-600">
                          {responses[currentStepData.field]}
                        </span>
                        <span className="text-sm text-blue-600">/10</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Footer with Navigation */}
          {currentStepData.type !== 'summary' && (
            <div className="px-6 py-4 bg-gray-50 flex justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`flex items-center px-4 py-2 rounded-md ${
                  currentStep === 0 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ArrowLeft size={16} className="mr-1" />
                Back
              </button>
              
              {currentStep === steps.length - 2 ? (
                <button
                  onClick={submitCheckIn}
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {saving ? 'Saving...' : 'Submit'}
                  {!saving && <CheckCircle size={16} className="ml-1" />}
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Next
                  <ArrowRight size={16} className="ml-1" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoupleCheckInScreen;