import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, HelpCircle, BarChart } from 'lucide-react';

const MiniSurvey = () => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [showResults, setShowResults] = useState(false);
  
  // Sample questions for mini assessment
  const questions = [
    {
      id: 'mini-1',
      text: "Who is primarily responsible for meal planning in your household?",
      category: "Invisible Household Tasks",
      explanation: "Meal planning involves mental load to anticipate family needs."
    },
    {
      id: 'mini-2',
      text: "Who usually handles school communications and appointments?",
      category: "Invisible Parental Tasks",
      explanation: "Managing communications creates significant invisible mental load."
    },
    {
      id: 'mini-3',
      text: "Who typically cleans the kitchen after meals?",
      category: "Visible Household Tasks",
      explanation: "Regular cleaning tasks are visible but time-consuming."
    },
    {
      id: 'mini-4',
      text: "Who provides emotional support when children are upset?",
      category: "Invisible Parental Tasks",
      explanation: "Emotional caregiving is high-impact invisible work."
    },
    {
      id: 'mini-5',
      text: "Who notices when household supplies need to be restocked?",
      category: "Invisible Household Tasks",
      explanation: "Keeping mental inventory is classic invisible labor."
    }
  ];

  const currentQuestion = questions[currentQuestionIndex];

  // Handle response selection
  const handleResponse = (value) => {
    setResponses({
      ...responses,
      [currentQuestion.id]: value
    });
    
    // Move to next question or show results
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  // Calculate results
  const calculateResults = () => {
    const results = {
      mama: 0,
      papa: 0,
      shared: 0,
      na: 0
    };
    
    Object.values(responses).forEach(response => {
      if (response === 'Mama') results.mama++;
      else if (response === 'Papa') results.papa++;
      else if (response === 'Shared') results.shared++;
      else results.na++;
    });
    
    // Calculate percentages
    const total = results.mama + results.papa + results.shared;
    return {
      mama: total ? Math.round((results.mama / total) * 100) : 0,
      papa: total ? Math.round((results.papa / total) * 100) : 0,
      shared: total ? Math.round((results.shared / total) * 100) : 0,
      imbalance: total ? Math.abs(results.mama - results.papa) : 0
    };
  };

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Get sign up for full assessment
  const handleSignUp = () => {
    navigate('/signup');
  };

  if (showResults) {
    const results = calculateResults();
    
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Your Quick Assessment Results</h2>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-center mb-8">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
              <BarChart className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <h3 className="text-xl font-medium mb-6 text-center">
            Your Family's Current Balance
          </h3>
          
          <div className="space-y-6 mb-8">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Mama ({results.mama}%)</span>
                <span className="text-sm font-medium">Papa ({results.papa}%)</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${Math.abs(results.mama - results.papa) > 30 ? 'bg-amber-500' : 'bg-green-500'}`} 
                  style={{ width: `${results.mama}%` }} 
                />
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-1">Shared Responsibilities ({results.shared}%)</p>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500" 
                  style={{ width: `${results.shared}%` }} 
                />
              </div>
            </div>
          </div>
          
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            {results.imbalance > 3 ? (
              <p className="text-gray-700">
                Your quick assessment suggests there may be some imbalance in your family workload. 
                A full assessment would provide more detailed insights and personalized recommendations.
              </p>
            ) : (
              <p className="text-gray-700">
                Your quick assessment suggests your family has a relatively balanced distribution of responsibilities. 
                A full assessment would help identify specific areas for further improvement.
              </p>
            )}
          </div>
          
          <div className="text-center">
            <button
              onClick={handleSignUp}
              className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 inline-flex items-center"
            >
              Get Your Full Assessment
              <ArrowRight size={16} className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Quick Family Balance Assessment</h2>
      
      <div className="mb-6 flex justify-center">
        <div className="flex items-center">
          <span className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {questions.length}</span>
          <div className="w-24 h-1 mx-4 rounded-full bg-gray-200 overflow-hidden">
            <div 
              className="h-full bg-black transition-all duration-300" 
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">
            {currentQuestion.text}
          </h3>
          <p className="text-sm text-gray-500">
            {currentQuestion.explanation}
          </p>
        </div>
        
        <div className="space-y-3">
  <button
    className="w-full p-3 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-left"
    onClick={() => handleResponse('Mama')}
  >
    Mama
  </button>
  
  <button
    className="w-full p-3 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-left"
    onClick={() => handleResponse('Papa')}
  >
    Papa
  </button>
</div>
        
        {currentQuestionIndex > 0 && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handlePrevious}
              className="text-gray-600 hover:text-gray-900 inline-flex items-center"
            >
              <ChevronLeft size={16} className="mr-1" />
              Previous Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniSurvey;