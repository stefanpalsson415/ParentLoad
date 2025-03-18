import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurvey } from '../../hooks/useSurvey';
import { useFamily } from '../../hooks/useFamily';
import { useTasks } from '../../hooks/useTasks';
import { ArrowLeft, ArrowRight, HelpCircle, CheckCircle } from 'lucide-react';

const WeeklyCheckInScreen = () => {
  const navigate = useNavigate();
  const { 
    surveyQuestions, 
    generateWeeklyQuestions, 
    surveyResponses, 
    updateSurveyResponse, 
    saveSurveyResponses,
    getSurveyProgress 
  } = useSurvey();
  
  const { 
    familyData, 
    currentWeek,
    selectedMember, 
    updateFamilyData
  } = useFamily();
  
  const { generateWeeklyTasks } = useTasks();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // 5 questions per page
  const [showHelp, setShowHelp] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkInCompleted, setCheckInCompleted] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState([]);

  // Calculate number of pages
  const totalPages = Math.ceil(surveyQuestions.length / pageSize);

  // Load weekly questions
  useEffect(() => {
    if (surveyQuestions.length === 0) {
      generateWeeklyQuestions(currentWeek || 1);
    }
  }, [generateWeeklyQuestions, currentWeek, surveyQuestions.length]);

  // Get current page questions
  const getCurrentPageQuestions = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return surveyQuestions.slice(startIndex, endIndex);
  };

  // Toggle help text for a question
  const toggleHelp = (questionId) => {
    setShowHelp(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Handle response selection
  const handleResponseChange = (questionId, value) => {
    updateSurveyResponse(questionId, value);
  };

  // Navigate to next page or complete check-in
  const handleNext = async () => {
    if (currentPage < totalPages) {
      // Go to next page
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    } else {
      // Complete check-in
      try {
        setLoading(true);
        setError(null);
        
        // Save responses to database
        if (familyData?.familyId && selectedMember?.id) {
          await saveSurveyResponses(
            familyData.familyId, 
            selectedMember.id, 
            `weekly-${currentWeek}`,
            surveyResponses
          );
          
          // Update family member's weekly completion status
          const updatedMembers = familyData.familyMembers.map(member => {
            if (member.id === selectedMember.id) {
              // Create or update weeklyCompleted array
              const weeklyCompleted = [...(member.weeklyCompleted || [])];
              
              // Ensure we have entries up to the current week
              while (weeklyCompleted.length < currentWeek) {
                weeklyCompleted.push({
                  completed: false,
                  date: null
                });
              }
              
              // Update the current week
              weeklyCompleted[currentWeek - 1] = {
                completed: true,
                date: new Date().toISOString()
              };
              
              return {
                ...member,
                weeklyCompleted
              };
            }
            return member;
          });
          
          await updateFamilyData({ familyMembers: updatedMembers });
          
          // Generate new tasks based on survey responses
          const tasks = await generateWeeklyTasks(
            currentWeek,
            [],  // No previous tasks for this example
            surveyResponses
          );
          
          setGeneratedTasks(tasks);
          setCheckInCompleted(true);
        } else {
          throw new Error('Missing family or member information');
        }
      } catch (err) {
        console.error('Error completing weekly check-in:', err);
        setError('Failed to save check-in. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Navigate to previous page
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    }
  };

  // Navigation to dashboard after completion
  const handleContinueToDashboard = () => {
    navigate('/dashboard');
  };

  // Calculate survey progress
  const progress = getSurveyProgress(surveyQuestions.length);

  // Check if current page's questions are all answered
  const isPageComplete = getCurrentPageQuestions().every(question => 
    surveyResponses[question.id] !== undefined
  );

  // If check-in is completed, show success message
  if (checkInCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-light text-gray-900">Allie</h1>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">Week {currentWeek} Check-In Complete!</h2>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <p className="text-center text-lg text-gray-700 mb-8">
              Thank you for completing your Week {currentWeek} check-in! We've generated new task recommendations based on your responses.
            </p>
            
            {generatedTasks.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">New Task Recommendations:</h3>
                <div className="space-y-4">
                  {generatedTasks.map((task, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-gray-600 text-sm">{task.description}</p>
                      <p className="text-sm mt-2">
                        <span className="text-gray-500">Assigned to:</span> {task.assignedTo}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleContinueToDashboard}
                className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-light text-gray-900">Allie</h1>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">Week {currentWeek} Check-In</h2>
          <p className="mt-2 text-gray-600">
            Help us track your family's progress and update recommendations
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Page {currentPage} of {totalPages}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-black rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Questions */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-bold mb-6">Weekly Check-In Questions</h3>
            
            <div className="space-y-6">
              {getCurrentPageQuestions().map((question) => (
                <div key={question.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <h4 className="text-lg font-medium mb-4">{question.text}</h4>
                    <button
                      type="button"
                      onClick={() => toggleHelp(question.id)}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      <HelpCircle size={20} />
                    </button>
                  </div>
                  
                  {showHelp[question.id] && (
                    <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
                      <p>{question.weeklyExplanation || question.explanation}</p>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-3 mt-4">
                    {['Mama', 'Papa', 'Shared', 'N/A'].map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`px-4 py-2 rounded-md border ${
                          surveyResponses[question.id] === option
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => handleResponseChange(question.id, option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md flex items-center ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ArrowLeft size={16} className="mr-2" />
                Previous
              </button>
              
              <button
                type="button"
                onClick={handleNext}
                disabled={!isPageComplete || loading}
                className={`px-4 py-2 rounded-md flex items-center ${
                  isPageComplete && !loading
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? 'Processing...' : (
                  <>
                    {currentPage === totalPages ? 'Complete' : 'Next'}
                    <ArrowRight size={16} className="ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyCheckInScreen;