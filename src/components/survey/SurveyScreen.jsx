import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useFamily } from '../../contexts/FamilyContext';
import { useSurvey } from '../../contexts/SurveyContext';


const SurveyScreen = () => {
  const navigate = useNavigate();
  const { 
    selectedUser,
    familyMembers,
    completeInitialSurvey 
  } = useFamily();
  
  const { 
    fullQuestionSet,
    currentSurveyResponses,
    updateSurveyResponse,
    resetSurvey,
    getSurveyProgress
  } = useSurvey();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedParent, setSelectedParent] = useState(null);
  const [viewingQuestionList, setViewingQuestionList] = useState(false);
  
  // Redirect if no user is selected
  useEffect(() => {
    if (!selectedUser) {
      navigate('/');
    }
  }, [selectedUser, navigate]);
  
  // Reset survey when component mounts - only once!
  useEffect(() => {
    resetSurvey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove resetSurvey from dependencies to prevent loop
  
  // Find Mama and Papa users from family members
  const mamaUser = familyMembers.find(m => m.roleType === 'Mama' || m.name === 'Mama');
  const papaUser = familyMembers.find(m => m.roleType === 'Papa' || m.name === 'Papa');
  
  // Parent profile images with fallbacks
  const parents = {
    mama: {
      name: mamaUser?.name || 'Mama',
      image: mamaUser?.profilePicture || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyOCIgZmlsbD0iI2U5YjFkYSIvPjxjaXJjbGUgY3g9IjEyOCIgY3k9IjkwIiByPSI0MCIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0yMTUsMTcyLjVjMCwzNS05NSwzNS05NSwzNXMtOTUsMC05NS0zNWMwLTIzLjMsOTUtMTAsOTUtMTBTMjE1LDE0OS4yLDIxNSwxNzIuNVoiIGZpbGw9IiNmZmYiLz48L3N2Zz4='
    },
    papa: {
      name: papaUser?.name || 'Papa',
      image: papaUser?.profilePicture || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyOCIgZmlsbD0iIzg0YzRlMiIvPjxjaXJjbGUgY3g9IjEyOCIgY3k9IjkwIiByPSI0MCIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0yMTUsMTcyLjVjMCwzNS05NSwzNS05NSwzNXMtOTUsMC05NS0zNWMwLTIzLjMsOTUtMTAsOTUtMTBTMjE1LDE0OS4yLDIxNSwxNzIuNVoiIGZpbGw9IiNmZmYiLz48L3N2Zz4='
    }
  };
  
  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (viewingQuestionList) return;
        
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
  }, [currentQuestionIndex, viewingQuestionList]);
  
  // Get current question
  const currentQuestion = fullQuestionSet[currentQuestionIndex];
  
  // Handle parent selection
  const handleSelectParent = (parent) => {
    setSelectedParent(parent);
    
    // Save response
    if (currentQuestion) {
      updateSurveyResponse(currentQuestion.id, parent);
    
      // Wait a moment to show selection before moving to next question
      setTimeout(() => {
        if (currentQuestionIndex < fullQuestionSet.length - 1) {
          // Use functional state update to ensure we're using the latest value
          setCurrentQuestionIndex(prevIndex => prevIndex + 1);
          setSelectedParent(null);
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
      // Save survey responses to database
      await completeInitialSurvey(selectedUser.id, currentSurveyResponses);
      
      // Show loading screen temporarily
      navigate('/loading');
      
      // Navigate to dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error completing survey:', error);
      alert('There was an error saving your survey. Please try again.');
    }
  };
  
  // Move to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
      setSelectedParent(currentSurveyResponses[fullQuestionSet[currentQuestionIndex - 1].id] || null);
    }
  };
  
  // Jump to specific question
  const jumpToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setSelectedParent(currentSurveyResponses[fullQuestionSet[index].id] || null);
    setViewingQuestionList(false);
  };
  
  // Handle pause
  const handlePause = () => {
    navigate('/dashboard');
  };
  
  // Skip question
  const handleSkip = () => {
    if (currentQuestionIndex < fullQuestionSet.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedParent(null);
    } else {
      // Survey completed, move to dashboard
      handleCompleteSurvey();
    }
  };
  
  // Toggle question list view
  const toggleQuestionList = () => {
    setViewingQuestionList(!viewingQuestionList);
  };
  
  // Handle logout
  const handleLogout = () => {
    navigate('/');
  };
  
  // Calculate progress
  const progress = getSurveyProgress(fullQuestionSet.length);
  
  // If no selected user or no current question, return loading
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
        
      {viewingQuestionList ? (
        // Question list view
        <div className="flex-1 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">All Questions (80)</h2>
                <button 
                  onClick={toggleQuestionList}
                  className="text-blue-600 text-sm"
                >
                  Back to Survey
                </button>
              </div>
                
              <div className="space-y-1 max-h-[70vh] overflow-y-auto">
                {fullQuestionSet.map((q, index) => {
                  const answered = currentSurveyResponses[q.id] !== undefined;
                  return (
                    <div 
                      key={q.id} 
                      className={`p-3 rounded text-sm ${
                        index === currentQuestionIndex 
                          ? 'bg-blue-100 border-l-4 border-blue-500' 
                          : answered 
                            ? 'bg-green-50' 
                            : 'bg-gray-50'
                      }`}
                      onClick={() => jumpToQuestion(index)}
                    >
                      <div className="flex items-center">
                        <span className="w-6 text-right mr-2">{index + 1}.</span>
                        <div className="flex-1">
                          <p>{q.text}</p>
                          <p className="text-xs text-gray-500 mt-1">{q.category}</p>
                        </div>
                        {answered && (
                          <div className="flex-shrink-0 ml-2">
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              {currentSurveyResponses[q.id]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Main survey view
        <div className="flex-1 p-4">
          <div className="max-w-3xl mx-auto">
            {/* Survey title */}
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold">Initial Survey Assessment</h2>
              <button 
                onClick={toggleQuestionList}
                className="text-sm text-blue-600 mt-1"
              >
                View All Questions
              </button>
            </div>
              
            {/* Question */}
            <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
              <p className="text-lg text-center">
                {currentQuestion.text}
              </p>
              <p className="text-xs text-gray-500 text-center mt-1">
                {currentQuestion.category}
              </p>
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
                  <p className="mt-2 font-medium">{parents.mama.name}</p>
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
                  <p className="mt-2 font-medium">{parents.papa.name}</p>
                  <p className="text-xs text-gray-500">(press 'P' key)</p>
                </div>
              </div>
            </div>
              
            {/* Progress */}
            <div className="text-center">
              <p className="font-medium mb-2">
                Question {currentQuestionIndex + 1} of {fullQuestionSet.length}
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
      )}
      
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
            onClick={handlePause}
          >
            Pause Survey
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

export default SurveyScreen;