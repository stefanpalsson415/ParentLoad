import React, { useState, useEffect } from 'react';
import { X, Heart, ThumbsUp, Lightbulb, Calendar, Clock } from 'lucide-react';
import { useFamily } from '../../contexts/FamilyContext';

const CoupleCheckInScreen = ({ onClose }) => {
  const { 
    familyMembers, 
    currentWeek,
    saveCoupleCheckInData
  } = useFamily();
  
  // Get only parent members
  const parentMembers = familyMembers.filter(m => m.role === 'parent');
  
  // State for responses
  const [responses, setResponses] = useState({
    satisfaction: 3,
    communication: 3,
    weeklyQuestion1: '',
    weeklyQuestion2: '',
    weeklyQuestion3: ''
  });
  
  // State for current questions
  const [weeklyQuestions, setWeeklyQuestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // AI-generated questions based on the week number
  useEffect(() => {
    const generateWeeklyQuestions = () => {
      // Each week will have slightly different questions focused on different aspects
      const questionSets = [
        // Week 1
        [
          "How has the division of tasks affected your connection this week?",
          "When did you feel most supported by your partner this week?",
          "What's one task-related tension point we should discuss?"
        ],
        // Week 2
        [
          "How has your stress level been affected by the workload this week?",
          "What's one area where you feel your partner excelled in sharing responsibilities?",
          "What task felt most unbalanced this week?"
        ],
        // Week 3
        [
          "How did your communication about tasks work this week?",
          "Was there a moment you felt misunderstood about workload?",
          "What could make you feel more appreciated for your contributions?"
        ],
        // Week 4
        [
          "How has our balance affected our time together as a couple?",
          "What task do you wish you could delegate more effectively?",
          "What's one way your partner showed awareness of the mental load this week?"
        ]
      ];
      
      // Select questions based on week number (cycle through sets)
      const weekIndex = (currentWeek - 1) % questionSets.length;
      return questionSets[weekIndex];
    };
    
    setWeeklyQuestions(generateWeeklyQuestions());
  }, [currentWeek]);
  
  // Handle input changes
  const handleInputChange = (field, value) => {
    setResponses({
      ...responses,
      [field]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Format the data for storage
      const checkInData = {
        week: currentWeek,
        date: new Date().toISOString(),
        responses,
        recommendations: generateRecommendations(responses)
      };
      
      // Save to database
      await saveCoupleCheckInData(currentWeek, checkInData);
      
      // Close the modal
      onClose(true); // Pass true to indicate successful submission
    } catch (error) {
      console.error("Error saving couple check-in data:", error);
      alert("There was an error saving your responses. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Generate recommendations based on responses
  const generateRecommendations = (responses) => {
    const recommendations = [];
    
    // Check satisfaction score
    if (responses.satisfaction <= 2) {
      recommendations.push({
        type: 'satisfaction',
        text: "Your satisfaction score indicates strain. Consider setting aside time this week for a relationship check-in separate from task discussions."
      });
    }
    
    // Check communication score
    if (responses.communication <= 2) {
      recommendations.push({
        type: 'communication',
        text: "Communication seems challenging right now. Try using 'I feel' statements when discussing household responsibilities."
      });
    }
    
    // Always add a positive recommendation
    recommendations.push({
      type: 'connection',
      text: "Schedule 30 minutes of uninterrupted couple time this week - no task talk allowed!"
    });
    
    return recommendations;
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Couple Check-In</h2>
            <div className="flex items-center text-gray-600 text-sm">
              <Calendar size={16} className="mr-1" />
              <span>Week {currentWeek}</span>
            </div>
          </div>
          <button
            onClick={() => onClose()}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="bg-gradient-to-r from-pink-50 to-blue-50 p-4 rounded-lg mb-6">
            <div className="flex items-start">
              <Heart size={20} className="text-pink-600 mr-3 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium">Why This Matters</h3>
                <p className="text-sm mt-1">
                  Research shows that workload imbalance can significantly impact relationship satisfaction.
                  This weekly check-in helps track how task distribution is affecting your relationship
                  and provides targeted suggestions.
                </p>
              </div>
            </div>
          </div>
          
          {/* Rating Scales */}
          <div className="space-y-6 mb-8">
            <div>
              <h3 className="font-medium mb-2">Overall Relationship Satisfaction This Week</h3>
              <p className="text-sm text-gray-600 mb-3">How satisfied have you felt with your relationship this week?</p>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-500">Strained</span>
                <div className="flex-1 mx-4">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={responses.satisfaction}
                    onChange={(e) => handleInputChange('satisfaction', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <span className="text-sm text-green-500">Thriving</span>
              </div>
              
              <div className="flex justify-between px-4 mt-1">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Task-Related Communication</h3>
              <p className="text-sm text-gray-600 mb-3">How would you rate your communication about household tasks this week?</p>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-500">Difficult</span>
                <div className="flex-1 mx-4">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={responses.communication}
                    onChange={(e) => handleInputChange('communication', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <span className="text-sm text-green-500">Excellent</span>
              </div>
              
              <div className="flex justify-between px-4 mt-1">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>
          </div>
          
          {/* Weekly Questions */}
          <div className="space-y-4 mb-8">
            <h3 className="font-medium">This Week's Reflection Questions</h3>
            
            {weeklyQuestions.map((question, index) => (
              <div key={index} className="border rounded-lg p-4">
                <p className="mb-2">{question}</p>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows="2"
                  placeholder="Your thoughts..."
                  value={responses[`weeklyQuestion${index + 1}`]}
                  onChange={(e) => handleInputChange(`weeklyQuestion${index + 1}`, e.target.value)}
                ></textarea>
              </div>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => onClose()}
              className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                'Save Responses'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoupleCheckInScreen;