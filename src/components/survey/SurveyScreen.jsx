import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurvey } from '../../hooks/useSurvey';
import { useFamily } from '../../hooks/useFamily';
import { ArrowLeft, ArrowRight, HelpCircle, CheckCircle } from 'lucide-react';

const SurveyScreen = () => {
  const navigate = useNavigate();
  const { 
    surveyQuestions, 
    generateQuestions, 
    surveyResponses, 
    updateSurveyResponse, 
    saveSurveyResponses,
    getSurveyProgress 
  } = useSurvey();
  
  const { 
    familyData, 
    selectedMember, 
    updateFamilyData,
    selectFamilyMember
  } = useFamily();
  
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [showHelp, setShowHelp] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [surveyCompleted, setSurveyCompleted] = useState(false);

  // Survey categories in preferred display order
  const categories = [
    "Visible Household Tasks",
    "Invisible Household Tasks",
    "Visible Parental Tasks",
    "Invisible Parental Tasks"
  ];

  // Generate survey questions on component mount
  useEffect(() => {
    if (!currentCategory && categories.length > 0) {
      setCurrentCategory(categories[0]);
    }
    
    if (surveyQuestions.length === 0) {
      generateQuestions('initial');
    }
  }, [generateQuestions, currentCategory, categories, surveyQuestions.length]);

  // Update current questions when category changes
  useEffect(() => {
    if (currentCategory && surveyQuestions.length > 0) {
      const questions = surveyQuestions.filter(q => q.category === currentCategory);
      setCurrentQuestions(questions);
    }
  }, [currentCategory, surveyQuestions]);

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

  // Navigate to next category or complete survey
  const handleNext = async () => {
    const currentIndex = categories.indexOf(currentCategory);
    
    // Before the try block in handleNext
    console.log("Attempting to save survey responses:", surveyResponses);
    
    if (currentIndex < categories.length - 1) {
      // Move to next category
      setCurrentCategory(categories[currentIndex + 1]);
      window.scrollTo(0, 0);
    } else {
      // Complete survey
      try {
        setLoading(true);
        setError(null);
        
        // Save responses to database
        if (familyData?.familyId && selectedMember?.id) {
          console.log("Attempting to save survey responses with:", {
            familyId: familyData.familyId,
            memberId: selectedMember.id,
            surveyType: 'initial',
            responseCount: Object.keys(surveyResponses).length
          });
          
          const saveResult = await saveSurveyResponses(
            familyData.familyId, 
            selectedMember.id, 
            'initial',
            surveyResponses
          );
          
          if (!saveResult) {
            throw new Error("Failed to save survey responses");
          }
          
          console.log("Survey saved successfully, updating member status");
          
          // Update family member's completion status
          const updatedMembers = familyData.familyMembers.map(member => {
            if (member.id === selectedMember.id) {
              return {
                ...member,
                completed: true,
                completedDate: new Date().toISOString()
              };
            }
            return member;
          });
          
          await updateFamilyData({ familyMembers: updatedMembers });
          
          // Update selected member status locally
          if (selectedMember) {
            selectFamilyMember({
              ...selectedMember,
              completed: true,
              completedDate: new Date().toISOString()
            });
          }
          
          setSurveyCompleted(true);
        } else {
          throw new Error('Missing family or member information');
        }
      } catch (err) {
        console.error('Error completing survey:', err);
        setError('Failed to save survey. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Navigate to previous category
  const handlePrevious = () => {
    const currentIndex = categories.indexOf(currentCategory);
    if (currentIndex > 0) {
      setCurrentCategory(categories[currentIndex - 1]);
      window.scrollTo(0, 0);
    }
  };

  // Navigation to dashboard after completion
  const handleContinueToDashboard = () => {
    navigate('/dashboard');
  };

  // Calculate survey progress
  const progress = getSurveyProgress(surveyQuestions.length);

  // Check if current category's questions are all answered
  const isCategoryComplete = currentQuestions.every(question => 
    surveyResponses[question.id] !== undefined
  );

  // If survey is completed, show success message
  if (surveyCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-light text-gray-900">Allie</h1>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">Survey Completed!</h2>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <p className="text-center text-lg text-gray-700 mb-8">
              Thank you for completing your initial survey! We'll use this information to help your family achieve better balance.
            </p>
            
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
          <h2 className="mt-2 text-2xl font-bold text-gray-900">Initial Family Survey</h2>
          <p className="mt-2 text-gray-600">
            Help us understand how tasks are currently distributed in your family
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
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

        {/* Category tabs */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                  category === currentCategory 
                    ? 'border-b-2 border-black text-black' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setCurrentCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-bold mb-6">{currentCategory} Questions</h3>
            
            <div className="space-y-6">
              {currentQuestions.map((question) => (
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
                      <p className="mb-2">{question.explanation}</p>
                      {question.weightExplanation && (
                        <p className="text-blue-700">{question.weightExplanation}</p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-3 mt-4">
                    {['Mama', 'Papa'].map((option) => (
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
                disabled={categories.indexOf(currentCategory) === 0}
                className={`px-4 py-2 rounded-md flex items-center ${
                  categories.indexOf(currentCategory) === 0
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
                disabled={!isCategoryComplete || loading}
                className={`px-4 py-2 rounded-md flex items-center ${
                  isCategoryComplete && !loading
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? 'Processing...' : (
                  <>
                    {categories.indexOf(currentCategory) === categories.length - 1 ? 'Complete' : 'Next'}
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

export default SurveyScreen;