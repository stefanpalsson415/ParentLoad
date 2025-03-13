import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, Volume2, ArrowRight, ArrowLeft, Star, Medal, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFamily } from '../../contexts/FamilyContext';
import { useSurvey } from '../../contexts/SurveyContext';

// Task illustrations as SVG components
const TaskIllustrations = {
  // Visible Household Tasks illustrations
  "cleaning": () => (
    <svg width="240" height="180" viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="180" fill="#f9fafb" />
      <path d="M60 140 L180 140 L180 60 L60 60 Z" fill="white" stroke="#4b5563" strokeWidth="2" />
      <path d="M80 110 L160 110 M80 80 L160 80" stroke="#9ca3af" strokeWidth="2" strokeDasharray="5,5" />
      <circle cx="120" cy="100" r="20" fill="#60a5fa" opacity="0.5" />
      <path d="M100 140 L100 110 L140 110 L140 140" fill="#d1d5db" />
      <rect x="105" y="115" width="30" height="5" fill="#9ca3af" />
    </svg>
  ),
  "cooking": () => (
    <svg width="240" height="180" viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="180" fill="#f9fafb" />
      <rect x="70" y="80" width="100" height="60" rx="4" fill="#f87171" />
      <rect x="80" y="70" width="30" height="10" fill="#374151" />
      <rect x="130" y="70" width="30" height="10" fill="#374151" />
      <circle cx="95" cy="110" r="15" fill="#fef3c7" />
      <circle cx="145" cy="110" r="15" fill="#fef3c7" />
      <rect x="70" y="140" width="100" height="5" fill="#4b5563" />
    </svg>
  ),
  
  // Invisible Household Tasks illustrations
  "planning": () => (
    <svg width="240" height="180" viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="180" fill="#f9fafb" />
      <rect x="60" y="40" width="120" height="100" fill="white" stroke="#4b5563" strokeWidth="2" />
      <line x1="60" y1="60" x2="180" y2="60" stroke="#4b5563" strokeWidth="2" />
      <rect x="70" y="70" width="20" height="20" fill="#bfdbfe" rx="2" />
      <rect x="70" y="100" width="20" height="20" fill="#bfdbfe" rx="2" />
      <line x1="100" y1="80" x2="170" y2="80" stroke="#9ca3af" strokeWidth="2" />
      <line x1="100" y1="110" x2="170" y2="110" stroke="#9ca3af" strokeWidth="2" />
      <circle cx="140" cy="50" r="6" fill="#f87171" />
    </svg>
  ),
  "scheduling": () => (
    <svg width="240" height="180" viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="180" fill="#f9fafb" />
      <rect x="70" y="40" width="100" height="100" fill="white" stroke="#4b5563" strokeWidth="2" rx="4" />
      <rect x="70" y="40" width="100" height="20" fill="#60a5fa" rx="4" />
      <line x1="90" y1="40" x2="90" y2="140" stroke="#4b5563" strokeWidth="1" />
      <line x1="110" y1="40" x2="110" y2="140" stroke="#4b5563" strokeWidth="1" />
      <line x1="130" y1="40" x2="130" y2="140" stroke="#4b5563" strokeWidth="1" />
      <line x1="150" y1="40" x2="150" y2="140" stroke="#4b5563" strokeWidth="1" />
      <line x1="70" y1="80" x2="170" y2="80" stroke="#4b5563" strokeWidth="1" />
      <line x1="70" y1="100" x2="170" y2="100" stroke="#4b5563" strokeWidth="1" />
      <line x1="70" y1="120" x2="170" y2="120" stroke="#4b5563" strokeWidth="1" />
      <rect x="92" y="82" width="16" height="16" fill="#fca5a5" rx="2" />
      <rect x="132" y="102" width="16" height="16" fill="#a5b4fc" rx="2" />
    </svg>
  ),
  
  // Visible Parental Tasks illustrations
  "homework": () => (
    <svg width="240" height="180" viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="180" fill="#f9fafb" />
      <rect x="60" y="50" width="90" height="110" fill="white" stroke="#4b5563" strokeWidth="2" />
      <line x1="70" y1="70" x2="140" y2="70" stroke="#9ca3af" strokeWidth="1" />
      <line x1="70" y1="90" x2="140" y2="90" stroke="#9ca3af" strokeWidth="1" />
      <line x1="70" y1="110" x2="140" y2="110" stroke="#9ca3af" strokeWidth="1" />
      <line x1="70" y1="130" x2="140" y2="130" stroke="#9ca3af" strokeWidth="1" />
      <circle cx="170" cy="90" r="30" fill="#fde68a" />
      <circle cx="160" cy="80" r="3" fill="#4b5563" />
      <circle cx="180" cy="80" r="3" fill="#4b5563" />
      <path d="M160 100 Q170 110, 180 100" fill="none" stroke="#4b5563" strokeWidth="2" />
    </svg>
  ),
  "driving": () => (
    <svg width="240" height="180" viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="180" fill="#f9fafb" />
      <rect x="60" y="90" width="120" height="40" rx="10" fill="#60a5fa" />
      <rect x="70" y="70" width="100" height="30" rx="5" fill="#93c5fd" />
      <circle cx="90" cy="130" r="15" fill="#1f2937" />
      <circle cx="150" cy="130" r="15" fill="#1f2937" />
      <rect x="80" y="85" width="20" height="15" fill="#bfdbfe" />
      <rect x="110" y="85" width="20" height="15" fill="#bfdbfe" />
      <rect x="140" y="85" width="20" height="15" fill="#bfdbfe" />
    </svg>
  ),
  
  // Invisible Parental Tasks illustrations
  "emotional": () => (
    <svg width="240" height="180" viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="180" fill="#f9fafb" />
      <circle cx="90" cy="90" r="30" fill="#fca5a5" />
      <circle cx="150" cy="90" r="30" fill="#fca5a5" />
      <path d="M90 90 L150 90 Z" stroke="#4b5563" strokeWidth="2" />
      <path d="M80 75 Q90 65, 100 75" fill="none" stroke="#4b5563" strokeWidth="2" />
      <path d="M140 75 Q150 65, 160 75" fill="none" stroke="#4b5563" strokeWidth="2" />
      <path d="M120 120 Q100 150, 80 120" fill="#fca5a5" />
      <path d="M120 120 Q140 150, 160 120" fill="#fca5a5" />
    </svg>
  ),
  "planning_kids": () => (
    <svg width="240" height="180" viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="180" fill="#f9fafb" />
      <rect x="60" y="50" width="120" height="80" fill="white" stroke="#4b5563" strokeWidth="2" />
      <rect x="60" y="50" width="120" height="20" fill="#a5b4fc" />
      <circle cx="100" cy="110" r="15" fill="#fde68a" />
      <circle cx="140" cy="110" r="15" fill="#fde68a" />
      <rect x="70" y="80" width="20" height="10" fill="#a5b4fc" />
      <rect x="100" y="80" width="20" height="10" fill="#a5b4fc" />
      <rect x="130" y="80" width="20" height="10" fill="#a5b4fc" />
      <path d="M80 140 L120 140 L120 130 L80 130 Z" fill="#a5b4fc" />
    </svg>
  ),
  
  // Generic/default illustration
  "default": () => (
    <svg width="240" height="180" viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="180" fill="#f9fafb" />
      <rect x="60" y="60" width="120" height="80" fill="#f9fafb" stroke="#4b5563" strokeWidth="2" />
      <path d="M50 70 L120 30 L190 70" fill="none" stroke="#4b5563" strokeWidth="2" />
      <rect x="100" y="100" width="40" height="40" fill="#60a5fa" />
      
      {/* Family figures */}
      <circle cx="80" cy="110" r="10" fill="#e9b1da" /> {/* Mama */}
      <rect x="77" y="120" width="6" height="20" fill="#e9b1da" />
      
      <circle cx="160" cy="110" r="10" fill="#84c4e2" /> {/* Papa */}
      <rect x="157" y="120" width="6" height="20" fill="#84c4e2" />
      
      <circle cx="120" cy="110" r="7" fill="#fcd34d" /> {/* Child */}
      <rect x="118" y="117" width="4" height="15" fill="#fcd34d" />
    </svg>
  )
};

const KidFriendlySurvey = ({ surveyType = "initial" }) => {
  const navigate = useNavigate();
  const { 
    fullQuestionSet, 
    updateSurveyResponse, 
    resetSurvey, 
    getSurveyProgress,
    generateWeeklyQuestions,
    currentSurveyResponses
  } = useSurvey();
  
  const { 
    selectedUser, 
    familyMembers, 
    completeInitialSurvey,
    completeWeeklyCheckIn,
    saveSurveyProgress, // Add this line
    currentWeek 
  } = useFamily();
  
  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [viewingQuestionList, setViewingQuestionList] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [userResponses, setUserResponses] = useState({});
  const [gameStatus, setGameStatus] = useState({
    mamaPosition: 0,
    papaPosition: 0,
    stars: 0
  });
  const [showReward, setShowReward] = useState(false);
  const [totalStars, setTotalStars] = useState(0);
  const [filterQuestions, setFilterQuestions] = useState(false);
  const [showAnimatedProgress, setShowAnimatedProgress] = useState(false);
  const [animation, setAnimation] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const keyboardInitialized = useRef(false);

  
  // Create a filtered list of questions for kids if needed
  const [questions, setQuestions] = useState([]);
  const questionTimerRef = useRef(null);
  
// Handle pause function
const handlePauseSurvey = async () => {
  if (isProcessing) return; // Prevent actions while processing
  
  setIsProcessing(true);
  
  try {
    // Ensure we have the latest responses from state
    const allResponses = {...currentSurveyResponses, ...userResponses};
    
    // Save the current progress without marking as completed
    if (selectedUser && Object.keys(allResponses).length > 0) {
      console.log("Saving survey progress before pausing...");
      console.log("Responses to save:", allResponses);
      if (surveyType === "weekly") {
        await saveSurveyProgress(selectedUser.id, allResponses);
      } else {
        await saveSurveyProgress(selectedUser.id, allResponses);
      }
      console.log("Progress saved successfully");
    }
    
    // Now navigate to dashboard
    navigate('/dashboard');
  } catch (error) {
    console.error('Error saving survey progress:', error);
    alert('There was an error saving your progress, but you can continue later.');
    navigate('/dashboard');
  } finally {
    setIsProcessing(false);
  }
};

// Handle switch user function
const handleSwitchUser = async () => {
  if (isProcessing) return; // Prevent actions while processing
  
  setIsProcessing(true);
  
  try {
    // Ensure we have the latest responses from state
    const allResponses = {...currentSurveyResponses, ...userResponses};
    
    // Save the current progress without marking as completed
    if (selectedUser && Object.keys(allResponses).length > 0) {
      console.log("Saving survey progress before switching user...");
      console.log("Responses to save:", allResponses);
      if (surveyType === "weekly") {
        await saveSurveyProgress(selectedUser.id, allResponses);
      } else {
        await saveSurveyProgress(selectedUser.id, allResponses);
      }
      console.log("Progress saved successfully");
    }
    
    // Navigate to login screen
    navigate('/login');
  } catch (error) {
    console.error('Error saving survey progress:', error);
    alert('There was an error saving your progress, but you can still switch users.');
    navigate('/login');
  } finally {
    setIsProcessing(false);
  }
};

// Set up keyboard shortcuts
// Set up keyboard shortcuts
useEffect(() => {
  // Function to handle key press
  const handleKeyPress = (e) => {
    // Guard against processing state or viewing question list
    if (isProcessing || viewingQuestionList === true) return;
    
    console.log(`Key pressed: ${e.key}, processing: ${isProcessing}, question: ${currentQuestionIndex}`);
    
    // 'M' key selects Mama
    if (e.key.toLowerCase() === 'm') {
      console.log("M key pressed - selecting Mama");
      handleSelectParent('Mama');
    }
    // 'P' key selects Papa
    else if (e.key.toLowerCase() === 'p') {
      console.log("P key pressed - selecting Papa");
      handleSelectParent('Papa');
    }
  };
  
  // Add the listener immediately
  window.addEventListener('keydown', handleKeyPress);
  keyboardInitialized.current = true;
  
  // Cleanup function
  return () => {
    window.removeEventListener('keydown', handleKeyPress);
    keyboardInitialized.current = false;
  };
}, [currentQuestionIndex, viewingQuestionList, isProcessing]); // Removed handleSelectParent

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
  }, []); 
  
  // Cleanup function to run when component unmounts
  useEffect(() => {
    return () => {
      // Clear any pending timers
      if (questionTimerRef.current) {
        clearTimeout(questionTimerRef.current);
        questionTimerRef.current = null;
      }
      
      // Clear any other possible timeouts
      const allTimeouts = [];
      for (let i = setTimeout(() => {}, 0); i > 0; i--) {
        clearTimeout(i);
      }
      
      console.log("Kid survey component unmounted, all timers cleared");
    };
  }, []);
  
  // Set up questions for kids based on survey type
  useEffect(() => {
    if (!fullQuestionSet || fullQuestionSet.length === 0) return;
    
    let questionSet;
    
    // Determine which questions to use based on the survey type
    if (surveyType === "weekly") {
      questionSet = generateWeeklyQuestions(currentWeek);
    } else {
      questionSet = fullQuestionSet;
    }
    
    let filteredList = questionSet;
    
    // For very young children, use a smaller set of simpler questions (40 total)
if (selectedUser && selectedUser.role === 'child' && selectedUser.age < 8) {
  // Pick simpler questions - 10 from each category
  const categories = [
    "Visible Household Tasks",
    "Invisible Household Tasks",
    "Visible Parental Tasks",
    "Invisible Parental Tasks"
  ];
  

  
  
  const simpleQuestions = [];
  categories.forEach(category => {
    const categoryQuestions = questionSet.filter(q => q.category === category);
    // Pick 10 questions from each category (40 total)
    for (let i = 0; i < 10; i++) {
      const index = (i < categoryQuestions.length) ? i : i % categoryQuestions.length;
      simpleQuestions.push(categoryQuestions[index]);
    }
  });
  
  filteredList = simpleQuestions;
  setFilterQuestions(true);
} else if (selectedUser && selectedUser.role === 'child' && selectedUser.age < 18) {
  // For older children, use more questions (60 total)
  const categories = [
    "Visible Household Tasks",
    "Invisible Household Tasks",
    "Visible Parental Tasks",
    "Invisible Parental Tasks"
  ];

  // Add after other functions, before return statement
const handlePauseSurvey = async () => {
  if (isProcessing) return; // Prevent actions while processing
  
  setIsProcessing(true);
  
  try {
    // Save the current progress without marking as completed
    if (selectedUser && Object.keys(currentSurveyResponses).length > 0) {
      console.log("Saving survey progress before pausing...");
      if (surveyType === "weekly") {
        await saveSurveyProgress(selectedUser.id, currentSurveyResponses);
      } else {
        await saveSurveyProgress(selectedUser.id, currentSurveyResponses);
      }
      console.log("Progress saved successfully");
    }
    
    // Now navigate to dashboard
    navigate('/dashboard');
  } catch (error) {
    console.error('Error saving survey progress:', error);
    alert('There was an error saving your progress, but you can continue later.');
    navigate('/dashboard');
  } finally {
    setIsProcessing(false);
  }
};

  
  const mediumQuestions = [];
  categories.forEach(category => {
    const categoryQuestions = questionSet.filter(q => q.category === category);
    // Pick 15 questions per category (60 total)
    for (let i = 0; i < 15; i++) {
      const index = (i < categoryQuestions.length) ? i : i % categoryQuestions.length;
      mediumQuestions.push(categoryQuestions[index]);
    }
  });
  
  filteredList = mediumQuestions;
  setFilterQuestions(true);
}
    
    // Simplify question text for children as needed
    const childFriendlyQuestions = filteredList.map(question => {
      // Create a more child-friendly version of question text
      let childText = question.text;
      
      // Simplify language for children
      childText = childText.replace("responsible for", "does");
      childText = childText.replace("typically", "usually");
      childText = childText.replace("coordinates", "plans");
      childText = childText.replace("manages", "takes care of");
      childText = childText.replace("oversees", "watches over");
      childText = childText.replace("maintains", "keeps up");
      childText = childText.replace("anticipates", "thinks ahead about");
      
      // Add "Who" at the beginning if not already there
      if (!childText.startsWith("Who")) {
        childText = "Who " + childText.toLowerCase();
      }
      
      return {
        ...question,
        childText: childText,
        illustration: getIllustrationForQuestion(question)
      };
    });
    
    setQuestions(childFriendlyQuestions);
    
  }, [fullQuestionSet, selectedUser, surveyType, currentWeek, generateWeeklyQuestions]);
  
  // Find Mama and Papa users from family members
  const mamaUser = familyMembers.find(m => m.roleType === 'Mama' || m.name === 'Mama');
  const papaUser = familyMembers.find(m => m.roleType === 'Papa' || m.name === 'Papa');
  
  // Parent data with fallbacks
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
  
  // Current question
  const currentQuestion = questions.length > 0 ? questions[currentQuestionIndex] : null;
  
  // Set up keyboard shortcuts
  const handleSelectParent = (parent) => {
    if (isProcessing) return; // Prevent multiple selections while processing
    setIsProcessing(true);
    
    // Clear any pending timers
    if (questionTimerRef.current) {
      clearTimeout(questionTimerRef.current);
      questionTimerRef.current = null;
    }
    
    setSelectedParent(parent);
    
    // Save response
    if (currentQuestion) {
      const updatedResponses = {
        ...userResponses,
        [currentQuestion.id]: parent
      };
      setUserResponses(updatedResponses);
      
      // Update parent component through context
      updateSurveyResponse(currentQuestion.id, parent);
    
      // Show some animation
      setAnimation(`selected-${parent.toLowerCase()}`);
      setTimeout(() => {
        setAnimation(null);
      }, 800);
      
      // Move to next question with a shorter delay
      questionTimerRef.current = setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          // Show progress animation between questions
          setShowAnimatedProgress(true);
          
          // Now update game state ONLY when actually advancing to next question
          setGameStatus(prev => {
            const newState = {
              ...prev,
              // Use currentQuestionIndex + 1 for positions to match the next question
              mamaPosition: parent === 'Mama' ? currentQuestionIndex + 1 : prev.mamaPosition,
              papaPosition: parent === 'Papa' ? currentQuestionIndex + 1 : prev.papaPosition,
              // Add a star every 20 questions
              stars: (currentQuestionIndex + 1) % 20 === 0 ? prev.stars + 1 : prev.stars
            };
            
            return newState;
          });
          
          // Show rewards animation every 20 questions
          if ((currentQuestionIndex + 1) % 20 === 0) {
            setShowReward(true);
            setTotalStars(prev => prev + 1);
            
            // Hide reward after 3 seconds
            setTimeout(() => {
              setShowReward(false);
            }, 3000);
          }
          
          setTimeout(() => {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
            setSelectedParent(null);
            setShowAnimatedProgress(false);
            setIsProcessing(false); // Reset processing state
          }, 800);
        } else {
          // Survey completed
          handleCompleteSurvey();
        }
      }, 500);
    }
  };
  
  // Helper function to get illustration for a question
  function getIllustrationForQuestion(question) {
    // This function determines which illustration to show based on keywords in the question
    const text = question.text.toLowerCase();
    const id = question.id || '';
    
    // Create a simple hash from the question text or ID for consistent selection
    const hashCode = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash);
    };
    
    const questionHash = hashCode(text + id);
    
    // More extensive keyword matching
    // Cleaning related
    if (text.includes('clean') || text.includes('dust') || text.includes('vacuum') || 
        text.includes('mop') || text.includes('sweep') || text.includes('tidy') ||
        text.includes('wash') || text.includes('dishes') || text.includes('laundry') ||
        text.includes('clothes') || text.includes('fold')) {
      return 'cleaning';
    }
    
    // Cooking related
    else if (text.includes('cook') || text.includes('meal') || text.includes('food') || 
             text.includes('dinner') || text.includes('breakfast') || text.includes('lunch') ||
             text.includes('kitchen') || text.includes('recipe') || text.includes('grocery') ||
             text.includes('shopping')) {
      return 'cooking';
    }
    
    // Planning related
    else if (text.includes('plan') || text.includes('remember') || text.includes('organize') ||
             text.includes('arrange') || text.includes('prepare') || text.includes('manage') ||
             text.includes('coordinate') || text.includes('oversee') || text.includes('supervise')) {
      return 'planning';
    }
    
    // Scheduling related
    else if (text.includes('schedule') || text.includes('calendar') || text.includes('appointment') ||
             text.includes('date') || text.includes('time') || text.includes('event') || 
             text.includes('activity')) {
      return 'scheduling';
    }
    
    // Homework/school related
    else if (text.includes('homework') || text.includes('school') || text.includes('study') ||
             text.includes('learn') || text.includes('education') || text.includes('teacher') ||
             text.includes('class') || text.includes('assignment') || text.includes('project')) {
      return 'homework';
    }
    
    // Driving/transportation related
    else if (text.includes('drive') || text.includes('pick up') || text.includes('transport') ||
             text.includes('car') || text.includes('vehicle') || text.includes('ride')) {
      return 'driving';
    }
    
    // Emotional support related
    else if (text.includes('emotional') || text.includes('support') || text.includes('feel') ||
             text.includes('comfort') || text.includes('care') || text.includes('listen') ||
             text.includes('talk') || text.includes('discuss') || text.includes('help')) {
      return 'emotional';
    }
    
    // Child planning/scheduling related
    else if ((text.includes('plan') || text.includes('schedule') || text.includes('organize')) && 
             (text.includes('child') || text.includes('kid') || text.includes('son') || 
              text.includes('daughter') || text.includes('children'))) {
      return 'planning_kids';
    }
    
    // Default illustration based on category and question hash
    if (question.category === "Visible Household Tasks") {
      // Use hash to consistently select between cleaning and cooking
      return (questionHash % 2 === 0) ? 'cleaning' : 'cooking';
    } else if (question.category === "Invisible Household Tasks") {
      // Use hash to consistently select between planning and scheduling
      return (questionHash % 2 === 0) ? 'planning' : 'scheduling';
    } else if (question.category === "Visible Parental Tasks") {
      // Use hash to consistently select between homework and driving
      return (questionHash % 2 === 0) ? 'homework' : 'driving';
    } else if (question.category === "Invisible Parental Tasks") {
      // Use hash to consistently select between emotional and planning_kids
      return (questionHash % 2 === 0) ? 'emotional' : 'planning_kids';
    }
    
    // Use hash-based selection as a last resort to ensure consistent variety
    const illustrations = ['cleaning', 'cooking', 'planning', 'scheduling', 'homework', 'driving', 'emotional', 'planning_kids'];
    return illustrations[questionHash % illustrations.length];
  }
  

  
  // Handle survey completion
  // Handle survey completion
// Handle survey completion
const handleCompleteSurvey = async () => {
  // Show a big celebration!
  setShowReward(true);
  
  try {
    console.log(`Attempting to save ${surveyType} survey data...`);
    // First try to save the data before any navigation
    if (surveyType === "weekly") {
      // Save weekly check-in
      await completeWeeklyCheckIn(selectedUser.id, currentWeek, currentSurveyResponses);
      console.log("Weekly check-in saved successfully");
    } else {
      // Save initial survey
      await completeInitialSurvey(selectedUser.id, currentSurveyResponses);
      console.log("Initial survey saved successfully");
    }
    
    // Only navigate after confirmed save - with error handling
    setTimeout(() => {
      try {
        console.log("Navigating to loading screen");
        navigate('/loading');
        
        // Navigate to dashboard after delay with increased timeout
        setTimeout(() => {
          try {
            console.log("Navigating to dashboard");
            navigate('/dashboard', { replace: true }); // Use replace to prevent back navigation issues
          } catch (navError) {
            console.error("Navigation error:", navError);
            window.location.href = '/dashboard'; // Fallback to direct URL change
          }
        }, 3000);
      } catch (navError) {
        console.error("Navigation error:", navError);
        window.location.href = '/dashboard'; // Fallback
      }
    }, 3000);
  } catch (error) {
    console.error(`Error completing ${surveyType} survey:`, error);
    alert('There was an error saving your responses. Please try again.');
    
    // Don't navigate away on error
    setShowReward(false);
    setIsProcessing(false);
  }
};  
  // Calculate progress percentage
  const progressPercentage = questions.length > 0 
    ? ((currentQuestionIndex) / (questions.length - 1)) * 100 
    : 0;
  
  // Render the appropriate illustration
  const renderIllustration = () => {
    if (!currentQuestion) return null;
    
    const illustrationKey = currentQuestion.illustration || 'default';
    const IllustrationComponent = TaskIllustrations[illustrationKey] || TaskIllustrations.default;
    
    return <IllustrationComponent />;
  };
  
  // Only render when questions are loaded
  if (!currentQuestion) {
    return <div className="flex items-center justify-center h-64">Loading fun questions...</div>;
  }
  
  return (
    <div className="max-w-3xl mx-auto bg-gradient-to-b from-blue-50 to-purple-50 rounded-lg p-4 shadow-lg">
      {/* Header with user info */}
      <div className="flex items-center justify-between mb-4">
  <div className="flex items-center">
    <div className="w-10 h-10 rounded-full overflow-hidden mr-2 border-2 border-indigo-300">
      <img 
        src={selectedUser?.profilePicture} 
        alt={selectedUser?.name}
        className="w-full h-full object-cover"
      />
    </div>
    <div>
      <h2 className="font-bold text-indigo-800">{selectedUser?.name}'s {surveyType === "weekly" ? "Weekly" : "Survey"}</h2>
      <div className="flex items-center">
        {[...Array(totalStars)].map((_, i) => (
          <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
        ))}
        {totalStars > 0 && <span className="text-xs text-amber-600 ml-1">Stars earned!</span>}
      </div>
    </div>
  </div>
  <div className="flex flex-col items-end">
    <button 
      onClick={handleSwitchUser}
      className="text-xs bg-black text-white px-2 py-1 rounded mb-1"
      disabled={isProcessing}
    >
      Switch User
    </button>
    <p className="text-sm font-medium text-purple-700">
      Question {currentQuestionIndex + 1} of {questions.length}
    </p>
    <p className="text-xs text-purple-600">
      {Math.round(progressPercentage)}% complete
    </p>
  </div>
</div>
      
      {/* Game-like progress tracker */}
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2 text-center text-indigo-800">Family Adventure Track!</h2>
        <div className="relative h-20 bg-white rounded-lg overflow-hidden border-2 border-indigo-200">
          {/* Track background with markers */}
          <div className="absolute inset-0 flex items-center justify-between px-4">
            {[...Array(6)].map((_, index) => (
              <div 
                key={index} 
                className={`w-6 h-6 rounded-full z-10 flex items-center justify-center ${
                  index * (questions.length/5) <= currentQuestionIndex 
                    ? 'bg-purple-200 text-purple-800' 
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
          
          {/* Path line */}
          <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-200 transform -translate-y-1/2"></div>
          
          {/* Progress line */}
          <div 
            className={`absolute top-1/2 left-0 h-2 bg-gradient-to-r from-blue-400 to-purple-500 transform -translate-y-1/2 transition-all duration-500 ${
              showAnimatedProgress ? 'animate-pulse' : ''
            }`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
          
          {/* Mama character */}
          <div 
            className={`absolute top-2 w-10 h-10 transition-all duration-500 ${
              animation === 'selected-mama' ? 'animate-bounce' : ''
            }`}
            style={{ 
              left: `calc(${Math.min(gameStatus.mamaPosition, questions.length - 1) / (questions.length - 1) * 100}% - 16px)`,
              maxLeft: 'calc(100% - 32px)'
            }}
          >
            <div className="w-10 h-10 bg-purple-200 rounded-full border-2 border-purple-500 flex items-center justify-center overflow-hidden">
              <img 
                src={parents.mama.image} 
                alt="Mama"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Papa character */}
          <div 
            className={`absolute bottom-2 w-10 h-10 transition-all duration-500 ${
              animation === 'selected-papa' ? 'animate-bounce' : ''
            }`}
            style={{ 
              left: `calc(${Math.min(gameStatus.papaPosition, questions.length - 1) / (questions.length - 1) * 100}% - 16px)`,
              maxLeft: 'calc(100% - 32px)'
            }}
          >
            <div className="w-10 h-10 bg-blue-200 rounded-full border-2 border-blue-500 flex items-center justify-center overflow-hidden">
              <img 
                src={parents.papa.image} 
                alt="Papa"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Reward icons at intervals */}
          {[1, 2, 3, 4, 5].map(idx => (
            <div 
              key={idx}
              className="absolute top-1/2 transform -translate-y-1/2 z-0"
              style={{ left: `${(idx * 20) - 3}%` }}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <Star size={16} className={`${
                  currentQuestionIndex >= (idx * questions.length/5) 
                    ? 'text-amber-400 fill-amber-400' 
                    : 'text-gray-300'
                }`} />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Current question */}
      <div className="bg-white rounded-xl p-6 shadow-md mb-6 border-2 border-indigo-100">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold text-indigo-800">
            {currentQuestion.childText || currentQuestion.text}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {currentQuestion.category}
          </p>
        </div>
        
        {/* Task Illustration */}
        <div className="flex justify-center mb-6">
          <div className="task-illustration p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            {renderIllustration()}
          </div>
        </div>
        
        {/* Question helper button */}
        <div className="flex justify-center mb-2">
          <button 
            onClick={() => setShowExplanation(!showExplanation)}
            className={`flex items-center text-sm ${
              showExplanation ? 'text-indigo-800' : 'text-blue-600'
            }`}
          >
            <Info size={16} className="mr-1" />
            {showExplanation ? 'Hide hint' : 'Need a hint?'}
          </button>
        </div>
        
        {showExplanation && (
          <div className="mb-4 bg-indigo-50 p-3 rounded-md text-sm text-indigo-800 border border-indigo-100">
            <p>Think about who you usually see doing this in your family!</p>
            <p className="mt-1 text-xs">Remember: there are no wrong answers - we just want to know what YOU think.</p>
          </div>
        )}
      </div>
      
      {/* Parent selection with animations */}
      <div className="flex justify-center items-center mb-8">
        <div className="flex w-full max-w-md justify-between items-center">
          {/* Mama */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => !isProcessing && handleSelectParent('Mama')}
              className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full focus:outline-none border-4 overflow-hidden transition-all transform hover:scale-105 ${
                selectedParent === 'Mama' 
                  ? 'border-purple-500 scale-110 animate-pulse' 
                  : 'border-purple-200 hover:border-purple-300'
              } ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
              aria-label="Select Mama"
              disabled={isProcessing}
            >
              <img 
                src={parents.mama.image}
                alt="Mama"
                className="w-full h-full object-cover"
              />
            </button>
            <p className="mt-2 font-medium text-purple-800">{parents.mama.name}</p>
            <p className="text-xs text-purple-600">(press 'M' key)</p>
          </div>
          
          {/* Center divider with VS text */}
          <div className="flex flex-col items-center">
            <div className="h-32 sm:h-40 w-px bg-gray-300"></div>
            <div className="bg-indigo-100 rounded-full w-8 h-8 flex items-center justify-center text-indigo-800 font-bold text-sm absolute">
              VS
            </div>
          </div>
          
          {/* Papa */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => !isProcessing && handleSelectParent('Papa')}
              className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full focus:outline-none border-4 overflow-hidden transition-all transform hover:scale-105 ${
                selectedParent === 'Papa' 
                  ? 'border-blue-500 scale-110 animate-pulse' 
                  : 'border-blue-200 hover:border-blue-300'
              } ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
              aria-label="Select Papa"
              disabled={isProcessing}
            >
              <img 
                src={parents.papa.image}
                alt="Papa"
                className="w-full h-full object-cover"
              />
            </button>
            <p className="mt-2 font-medium text-blue-800">{parents.papa.name}</p>
            <p className="text-xs text-blue-600">(press 'P' key)</p>
          </div>
        </div>
      </div>
      
      {/* Navigation footer with fun design */}
      <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-lg">
  <button 
    onClick={() => {
      if (isProcessing) return;
      
      // Clear any pending timers
      if (questionTimerRef.current) {
        clearTimeout(questionTimerRef.current);
        questionTimerRef.current = null;
      }
      
      // Go to previous question
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prevIndex => prevIndex - 1);
        setSelectedParent(userResponses[questions[currentQuestionIndex - 1].id] || null);
      }
    }}
    disabled={currentQuestionIndex === 0 || isProcessing}
    className={`px-4 py-2 rounded-md flex items-center ${
      currentQuestionIndex === 0 || isProcessing
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
        : 'bg-white text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
    }`}
  >
    <ArrowLeft size={16} className="mr-1" />
    Back
  </button>
  
  <button
    onClick={handlePauseSurvey}
    disabled={isProcessing}
    className="px-4 py-2 rounded-md bg-white text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
  >
    Pause Survey
  </button>
  
  <div className="font-medium text-indigo-800 bg-white px-3 py-1 rounded-lg border border-indigo-200">
    <div className="flex items-center">
      {Math.floor(currentQuestionIndex / (questions.length / 20)) >= 1 && 
        <Star size={14} className="text-amber-400 fill-amber-400 mr-1" />}
      Question {currentQuestionIndex + 1} of {questions.length}
    </div>
  </div>
  
  <button 
    onClick={() => {
      if (isProcessing) return;
      
      // Clear any pending timers
      if (questionTimerRef.current) {
        clearTimeout(questionTimerRef.current);
        questionTimerRef.current = null;
      }
      
      // Skip to next question
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        setSelectedParent(null);
      } else {
        handleCompleteSurvey();
      }
    }}
    disabled={isProcessing}
    className={`px-4 py-2 rounded-md ${
      isProcessing 
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border border-indigo-200 flex items-center'
    }`}
  >
    Skip
    <ArrowRight size={16} className="ml-1" />
  </button>
</div>
      
      {/* Celebration overlay - shown when earning stars */}
      {showReward && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            <div className="relative">
              {/* Stars animation */}
              <div className="absolute inset-0 stars-animation">
                {[...Array(20)].map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute animate-ping" 
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${1 + Math.random() * 2}s`
                    }}
                  >
                    <Star 
                      size={10 + Math.random() * 20} 
                      className="text-amber-400 fill-amber-400" 
                    />
                  </div>
                ))}
              </div>
              
              <div className="mb-4 flex justify-center">
                <div className="relative">
                  <Medal size={60} className="text-amber-500" />
                  <Star size={24} className="absolute -top-2 -right-2 text-amber-400 fill-amber-400 animate-pulse" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-indigo-800 mb-2">Amazing Job!</h2>
              
              {currentQuestionIndex < questions.length - 1 ? (
                <>
                  <p className="text-indigo-600 mb-3">You earned a star for your help!</p>
                  <p className="text-sm text-gray-600 mb-6">
                    Keep going to earn more stars and finish the survey!
                  </p>
                </>
              ) : (
                <>
                  <p className="text-indigo-600 mb-3">You completed the whole survey!</p>
                  <p className="text-sm text-gray-600 mb-6">
                    Thank you for helping your family balance responsibilities!
                  </p>
                </>
              )}
              
              <button 
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-bold hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105 transition-all"
                onClick={() => setShowReward(false)}
              >
                {currentQuestionIndex < questions.length - 1 ? "Continue Adventure!" : "Finish!"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom styles for animations */}
      <style jsx="true">{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        .stars-animation {
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default KidFriendlySurvey;