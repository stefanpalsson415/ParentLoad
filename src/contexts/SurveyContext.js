// src/contexts/SurveyContext.js
import React, { createContext, useContext, useState } from 'react';

// Create the survey context
const SurveyContext = createContext();

// Custom hook to use the survey context
export function useSurvey() {
  return useContext(SurveyContext);
}

// Provider component
export function SurveyProvider({ children }) {
  // Generate full set of 80 questions (20 per category)
  const generateFullQuestionSet = () => {
    const categories = [
      "Visible Household Tasks",
      "Invisible Household Tasks",
      "Visible Parental Tasks",
      "Invisible Parental Tasks"
    ];
      
    const questions = [];
    const questionTexts = {
      "Visible Household Tasks": [
        "Who is responsible for cleaning floors in your home?",
        "Who usually washes the dishes after meals?",
        "Who typically cooks meals for the family?",
        "Who does the laundry in your household?",
        "Who does the grocery shopping?",
        "Who takes out the trash regularly?",
        "Who handles yard work like mowing and gardening?",
        "Who cleans the bathrooms?",
        "Who dusts surfaces around the house?",
        "Who makes the beds each day?",
        "Who irons clothes when needed?",
        "Who changes bed linens regularly?",
        "Who feeds the pets?",
        "Who walks the dog?",
        "Who handles small home repairs?",
        "Who washes the windows?",
        "Who sets the table for meals?",
        "Who shovels snow in winter?",
        "Who cleans the refrigerator?",
        "Who organizes closets and storage spaces?"
      ],
      "Invisible Household Tasks": [
        "Who plans meals for the week?",
        "Who schedules family appointments?",
        "Who manages the family calendar?",
        "Who remembers birthdays and special occasions?",
        "Who makes shopping lists?",
        "Who handles paying bills on time?",
        "Who coordinates childcare arrangements?",
        "Who plans family vacations and trips?",
        "Who oversees children's educational needs?",
        "Who keeps track of household supplies?",
        "Who provides emotional support during tough times?",
        "Who maintains social relationships and family connections?",
        "Who anticipates family needs like seasonal clothing?",
        "Who decides on home organization systems?",
        "Who researches products before purchasing?",
        "Who maintains important documents?",
        "Who plans for holidays and special events?",
        "Who tracks maintenance schedules for appliances?",
        "Who manages family health needs?",
        "Who guides family values and addresses behavioral issues?"
      ],
      "Visible Parental Tasks": [
        "Who drives kids to school and activities?",
        "Who helps with homework?",
        "Who attends parent-teacher conferences?",
        "Who prepares school lunches?",
        "Who coordinates extracurricular activities?",
        "Who attends children's performances and games?",
        "Who organizes playdates?",
        "Who supervises bath time?",
        "Who manages bedtime routines?",
        "Who shops for school supplies and clothing?",
        "Who schedules children's medical appointments?",
        "Who prepares children for school each morning?",
        "Who volunteers at school functions?",
        "Who communicates with teachers and school staff?",
        "Who plans and hosts birthday parties?",
        "Who monitors screen time?",
        "Who teaches life skills?",
        "Who disciplines and sets behavioral expectations?",
        "Who assists with college or career preparation?",
        "Who engages in recreational activities with kids?"
      ],
      "Invisible Parental Tasks": [
        "Who coordinates children's schedules to prevent conflicts?",
        "Who provides emotional labor for the family?",
        "Who anticipates developmental needs?",
        "Who networks with other parents?",
        "Who monitors academic progress?",
        "Who develops strategies for behavioral issues?",
        "Who watches for signs of illness or stress?",
        "Who plans for future educational expenses?",
        "Who maintains family traditions?",
        "Who handles cultural and moral education?",
        "Who mediates conflicts between siblings?",
        "Who customizes parenting approaches for each child?",
        "Who coordinates with teachers and coaches?",
        "Who stays informed on child safety best practices?",
        "Who keeps track of details like clothing sizes and allergies?",
        "Who manages their own emotions to provide stability?",
        "Who encourages children's personal interests?",
        "Who decides on appropriate screen time rules?",
        "Who helps children navigate social relationships?",
        "Who supports the co-parent emotionally and practically?"
      ]
    };
      
    let questionId = 1;
    categories.forEach(category => {
      questionTexts[category].forEach(text => {
        questions.push({
          id: `q${questionId}`,
          text: text,
          category: category,
          explanation: `This question helps us understand who is primarily handling ${category.toLowerCase()} in your family and allows us to track changes over time.`
        });
        questionId++;
      });
    });
      
    return questions;
  };

  // Generate weekly check-in questions (20 selected questions)
  const generateWeeklyQuestions = (weekNumber) => {
    // Select 5 questions from each category, based on week number for variety
    const weeklyQuestions = [];
    
    const categories = [
      "Visible Household Tasks",
      "Invisible Household Tasks",
      "Visible Parental Tasks",
      "Invisible Parental Tasks"
    ];
    
    categories.forEach(category => {
      const categoryQuestions = fullQuestionSet.filter(q => q.category === category);
      // Get 5 questions from each category
      for (let i = 0; i < 5; i++) {
        const index = (weekNumber * i) % categoryQuestions.length; // Use week number to vary questions
        weeklyQuestions.push({
          ...categoryQuestions[index],
          weeklyExplanation: `We're asking about this again to track changes over time and see if our recommendations are helping create more balance in your family.`
        });
      }
    });
    
    return weeklyQuestions;
  };
  
  // Initial questions
  const fullQuestionSet = generateFullQuestionSet();
  
  // State for temporary survey progress
  const [currentSurveyResponsesState, setCurrentSurveyResponsesState] = useState({});
  const [completedQuestions, setCompletedQuestions] = useState([]);

  // Add or update a survey response
  const updateSurveyResponse = (questionId, answer) => {
    setCurrentSurveyResponsesState(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    if (!completedQuestions.includes(questionId)) {
      setCompletedQuestions(prev => [...prev, questionId]);
    }
  };

  // Reset survey progress
  const resetSurvey = () => {
    setCurrentSurveyResponsesState({});
    setCompletedQuestions([]);
  };

  // Get survey progress percentage
  const getSurveyProgress = (totalQuestions) => {
    return (completedQuestions.length / totalQuestions) * 100;
  };
  
  // Set survey responses from outside (like when loading saved responses)
  const setCurrentSurveyResponses = (responses) => {
    setCurrentSurveyResponsesState(responses);
    
    // Update completedQuestions state based on the responses
    const questionIds = Object.keys(responses);
    setCompletedQuestions(questionIds);
  };

  // Context value
  const value = {
    fullQuestionSet,
    generateWeeklyQuestions,
    currentSurveyResponses: currentSurveyResponsesState,
    completedQuestions,
    updateSurveyResponse,
    resetSurvey,
    getSurveyProgress,
    setCurrentSurveyResponses
  };

  return (
    <SurveyContext.Provider value={value}>
      {children}
    </SurveyContext.Provider>
  );
}