import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, HelpCircle } from 'lucide-react';
import { useFamily } from '../../contexts/FamilyContext';
import { useSurvey } from '../../contexts/SurveyContext';

const WeeklyCheckInScreen = () => {
  const navigate = useNavigate();
  const { 
    selectedUser,
    completeWeeklyCheckIn,
    currentWeek
  } = useFamily();
  
  const { 
    generateWeeklyQuestions,
    currentSurveyResponses,
    updateSurveyResponse,
    resetSurvey,
    getSurveyProgress
  } = useSurvey();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedParent, setSelectedParent] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [weeklyQuestions, setWeeklyQuestions] = useState([]);
  
  // Redirect if no user is selected
  useEffect(() => {
    if (!selectedUser) {
      navigate('/');
    }
  }, [selectedUser, navigate]);
  
  // Initialize weekly questions and reset survey
  useEffect(() => {
    setWeeklyQuestions(generateWeeklyQuestions(currentWeek));
    resetSurvey();
  }, [currentWeek, generateWeeklyQuestions, resetSurvey]);
  
  // Parent profile images (using placeholder images for now)
  const parents = {
    mama: {
      name: 'Mama',
      // In a real app, this would be the actual uploaded image
      image: '/placeholder-profile.jpg'
    },
    papa: {
      name: 'Papa',
      // In a real app, this would be the actual uploaded image
      image: '/placeholder-profile.jpg'
    }
  };
  
  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // 'M' key selects Mama
      if (e.key.toLowerCase() === 'm') {
        handleSelectParent('Mama');
      }
      // 'P' key selects Papa
      else if (e.key.toLowerCase() === 'p') {
        handleSelectParent('Papa');
      }
    };
      
    window.addEventListener('keydown', handleKeyPress);
      
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentQuestionIndex]);
  
  // Get current question
  const currentQuestion = weeklyQuestions[currentQuestionIndex];
  
  // Handle parent selection
  const handleSelectParent = (parent) => {
    setSelectedParent(parent);
    
    // Save response
    if (currentQuestion) {
      updateSurveyResponse(currentQuestion.id, parent);
    
      // Wait a moment to show selection before moving to next question
      setTimeout(() => {
        if (currentQuestionIndex < weeklyQuestions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedParent(null);
          setShowExplanation(false);
        } else {
          // Survey completed, save responses
          handleCompleteSurvey();
        }
      }, 500);
    }
  };
  
  // Handle survey completion
  const handleCompleteSurvey = async () => {
    try {
      // Save weekly check-in responses to database
      await completeWeeklyCheckIn(selectedUser.id, currentWeek, currentSurveyResponses);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing weekly check-in:', error);
      alert('There was an error saving your responses. Please try again.');
    }
  };
  
  // Move to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      
      if (weeklyQuestions[currentQuestionIndex - 1]) {
        setSelectedParent(currentSurveyResponses[weeklyQuestions[currentQuestionIndex - 1].id] || null);
      }
      
      setShowExplanation(false);
    }
  };
  
  // Skip question
  const handleSkip = () => {
    if (currentQuestionIndex < weeklyQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedParent(null);
      setShowExplanation(false);
    } else {
      // Survey completed, move to dashboard
      handleCompleteSurvey();
    }
  };
  
  // Handle pause/exit
  const handleExit = () => {
    navigate('/dashboard');
  };
  
  // Toggle explanation
  const toggleExplanation = () => {
    setShowExplanation(!showExplanation);
  };
  
  // Handle logout
  const handleLogout = () => {
    navigate('/');
  };
  
  // Calculate progress
  const progress = getSurveyProgress(weeklyQuestions.length);
  
  // If no selected user, return loading
  if (!selectedUser || !currentQuestion) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
              <img 
                src={selectedUser.profilePicture} 
                alt={selectedUser.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span>{selectedUser.name}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center text-sm bg-blue-700 hover:bg-blue-800 px-2 py-1 rounded"
          >
            <LogOut size={14} className="mr-1" />
            Switch User
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-4">
        <div className="max-w-3xl mx-auto">
          {/* Survey title */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold">Weekly Check-in - Week {currentWeek}</h2>
            <p className="text-gray-600 mt-1">Help us track your family's balance progress</p>
          </div>
            
          {/* Question */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-4">
            <p className="text-lg text-center">
              {currentQuestion.text}
            </p>
            <p className="text-xs text-gray-500 text-center mt-1">
              {currentQuestion.category}
            </p>
            
            {/* Question explanation toggle */}
            <div className="flex justify-center mt-3">
              <button 
                onClick={toggleExplanation}
                className="flex items-center text-sm text-blue-600"
              >
                <HelpCircle size={16} className="mr-1" />
                {showExplanation ? "Hide explanation" : "Why are we asking this again?"}
              </button>
            </div>
            
            {/* Explanation panel */}
            {showExplanation && (
              <div className="mt-3 bg-blue-50 p-3 rounded-md text-sm text-blue-800">
                {currentQuestion.weeklyExplanation}
              </div>
            )}
          </div>
            
          {/* Parent selection */}
          <div className="flex justify-center items-center mb-8">
            <div className="flex w-full max-w-md justify-between items-center">
              {/* Mama */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleSelectParent('Mama')}
                  className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full focus:outline-none border-4 overflow-hidden ${
                    selectedParent === 'Mama' ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  <img 
                    src={parents.mama.image} 
                    alt="Mama"
                    className="w-full h-full object-cover"
                  />
                </button>
                <p className="mt-2 font-medium">Mama</p>
                <p className="text-xs text-gray-500">(press 'M' key)</p>
              </div>
                
              {/* Divider */}
              <div className="h-32 sm:h-40 w-px bg-gray-300"></div>
                
              {/* Papa */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleSelectParent('Papa')}
                  className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full focus:outline-none border-4 overflow-hidden ${
                    selectedParent === 'Papa' ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  <img 
                    src={parents.papa.image} 
                    alt="Papa"
                    className="w-full h-full object-cover"
                  />
                </button>
                <p className="mt-2 font-medium">Papa</p>
                <p className="text-xs text-gray-500">(press 'P' key)</p>
              </div>
            </div>
          </div>
            
          {/* Progress */}
          <div className="text-center">
            <p className="font-medium mb-2">
              Question {currentQuestionIndex + 1} of {weeklyQuestions.length}
            </p>
            <div className="h-2 bg-gray-200 rounded overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer with navigation */}
      <div className="border-t bg-white p-4">
        <div className="max-w-3xl mx-auto flex justify-between">
          <button 
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`px-4 py-2 border rounded ${
              currentQuestionIndex === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          <button 
            className="px-4 py-2 border rounded bg-white hover:bg-gray-50"
            onClick={handleExit}
          >
            Save & Exit
          </button>
          <button 
            className="px-4 py-2 border rounded bg-white hover:bg-gray-50"
            onClick={handleSkip}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyCheckInScreen;