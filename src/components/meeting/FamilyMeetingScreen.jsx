import React, { useState, useEffect } from 'react';
import { Clock, Download, X, ChevronDown, ChevronUp, Sparkles, Star, Users } from 'lucide-react';
import { useFamily } from '../../contexts/FamilyContext';
import { useSurvey } from '../../contexts/SurveyContext';

// Confetti effect component for celebration
const Fireworks = () => {
  useEffect(() => {
    // Create confetti effect
    const createConfetti = () => {
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
      
      for (let i = 0; i < 150; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confetti.style.opacity = Math.random() + 0.5;
        document.getElementById('confetti-container').appendChild(confetti);
        
        // Remove after animation completes
        setTimeout(() => {
          confetti.remove();
        }, 3000);
      }
    };
    
    // Create confetti at regular intervals
    const interval = setInterval(createConfetti, 300);
    
    // Play celebration sound
    const audio = new Audio('/sounds/celebration.mp3');
    audio.volume = 0.6;
    audio.play().catch(e => console.log("Audio play failed:", e));
    
    // Cleanup
    return () => {
      clearInterval(interval);
      const container = document.getElementById('confetti-container');
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    };
  }, []);
  
  return (
    <div 
      id="confetti-container" 
      className="fixed inset-0 pointer-events-none z-50"
      style={{ perspective: '700px' }}
    >
      <style jsx="true">{`
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          top: -10px;
          animation: confetti-fall 3s linear forwards;
        }
        
        @keyframes confetti-fall {
          0% {
            top: -10px;
            transform: translateZ(0) rotate(0deg);
          }
          100% {
            top: 100vh;
            transform: translateZ(400px) rotate(720deg);
          }
        }
      `}</style>
    </div>
  );
};

const FamilyMeetingScreen = ({ onClose }) => {
  const { 
    currentWeek, 
    saveFamilyMeetingNotes, 
    familyMembers, 
    surveyResponses,
    completeWeek
  } = useFamily();
  
  const { fullQuestionSet } = useSurvey();
  
  const [meetingNotes, setMeetingNotes] = useState({
    taskCompletion: '',
    surveyResults: '',
    nextWeekGoals: '',
    additionalNotes: ''
  });
  const [expandedSection, setExpandedSection] = useState('taskCompletion'); // Default expanded section
  const [viewMode, setViewMode] = useState('agenda'); // 'agenda' or 'report'
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Generate agenda topics based on family data
  const generateAgendaTopics = () => {
    // Analyze survey data to find insights (in a real app, this would be more sophisticated)
    const insights = analyzeData();
    
    return [
      {
        id: 'taskCompletion',
        title: '1. Review Task Completion',
        duration: '10 min',
        description: 'Discuss which tasks were completed and how they went',
        guideQuestions: [
          'Which tasks did each parent complete this week?',
          'Were there any challenges in completing the tasks?',
          'How did completing these tasks affect the family balance?'
        ],
        insights: insights.taskInsights
      },
      {
        id: 'surveyResults',
        title: '2. Survey Results Discussion',
        duration: '10 min',
        description: 'Review this week\'s survey results and notable changes',
        guideQuestions: [
          'What areas showed the most improvement?',
          'Are there any tasks that one parent is doing significantly more than the other?',
          'How do the children\'s perceptions compare to the parents\' perceptions?'
        ],
        insights: insights.surveyInsights
      },
      {
        id: 'nextWeekGoals',
        title: '3. Next Week\'s Goals',
        duration: '10 min',
        description: 'Set intentions for the coming week and discuss new tasks',
        guideQuestions: [
          'What specific tasks will each parent focus on next week?',
          'Are there any upcoming events that require special planning?',
          'How can we better support each other in the coming week?'
        ],
        insights: insights.goalInsights
      }
    ];
  };
  
  // Analyze family data to generate insights
  const analyzeData = () => {
    // In a real app, this would analyze actual survey responses to find patterns
    return {
      taskInsights: [
        "Papa has completed 2 of 3 assigned tasks",
        "Mama has completed 1 of 2 assigned tasks",
        "The 'Meal Planning' task seems to have made the biggest impact so far"
      ],
      surveyInsights: [
        "Papa has taken more responsibility for meal planning",
        "Everyone agrees that Mama still handles most of the invisible household tasks",
        "The children's perception of task distribution is closer to reality this week"
      ],
      goalInsights: [
        "Focus on balancing the Invisible Household Tasks category",
        "Papa should work on family calendar management next week",
        "Mama could delegate more of the mental load tasks"
      ]
    };
  };
  
  // Generate weekly report data
  const generateWeeklyReport = () => {
    // This would use actual data in a real app
    return {
      balanceScore: {
        mama: 65,
        papa: 35
      },
      tasks: {
        mama: {
          completed: 1,
          total: 2,
          items: [
            { title: "Manage Home Repairs", status: 'completed' },
            { title: "Plan Family Activities", status: 'incomplete' }
          ]
        },
        papa: {
          completed: 2,
          total: 3,
          items: [
            { title: "Meal Planning", status: 'completed' },
            { title: "Childcare Coordination", status: 'completed' },
            { title: "Family Calendar Management", status: 'incomplete' }
          ]
        }
      },
      surveyHighlights: [
        "Papa has taken over meal planning for the week",
        "Visible household tasks are becoming more balanced",
        "Children report improvement in Papa's involvement with homework"
      ],
      discrepancies: [
        "Parents disagree on who handled doctor appointments this week",
        "Children perceive Mama is still managing most invisible tasks",
        "There's disagreement about who should coordinate school activities"
      ]
    };
  };
  
  // Get agenda topics
  const agendaTopics = generateAgendaTopics();
  
  // Get weekly report data
  const weeklyReport = generateWeeklyReport();
  
  // Handle input changes
  const handleInputChange = (section, value) => {
    setMeetingNotes({
      ...meetingNotes,
      [section]: value
    });
  };
  
  // Toggle section expansion
  const toggleSection = (sectionId) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionId);
    }
  };
  
  // Handle meeting completion
  const handleCompleteMeeting = async () => {
    setIsSaving(true);
    
    try {
      // Save meeting notes to database
      await saveFamilyMeetingNotes(currentWeek, meetingNotes);
      
      // Show confirmation dialog
      setShowConfirmation(true);
      setIsSaving(false);
    } catch (error) {
      console.error("Error saving meeting notes:", error);
      alert("There was an error saving your meeting notes. Please try again.");
      setIsSaving(false);
    }
  };
  
  const handleCompleteWeekTogether = async () => {
    setIsCompleting(true);
    
    try {
      console.log(`Starting to complete Week ${currentWeek}`);
      
      // Complete the week - this should:
      // 1. Mark the week as completed
      // 2. Create a historical record
      // 3. Advance to the next week
      const result = await completeWeek(currentWeek);
      
      console.log(`Week ${currentWeek} completed successfully:`, result);
      console.log(`Moving to Week ${currentWeek + 1}`);
      
      // Show celebration animation
      setShowCelebration(true);
      
      // Close dialog after celebration (5 seconds)
      setTimeout(() => {
        console.log("Closing meeting dialog after completion");
        onClose();
      }, 5000);
    } catch (error) {
      console.error("Error completing week:", error);
      alert("There was an error completing the week. Please try again.");
      setIsCompleting(false);
    }
  };
  
  // Handle downloadable report
  const handleDownloadReport = () => {
    // In a real app, this would generate a PDF or similar document
    console.log('Downloading report...');
    // For now, we'll just fake it with an alert
    alert('Report downloaded successfully!');
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Week {currentWeek} Family Meeting</h2>
            <div className="flex items-center text-gray-600 text-sm">
              <Clock size={16} className="mr-1" />
              <span>30 minutes</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                viewMode === 'agenda' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
              onClick={() => setViewMode('agenda')}
            >
              Agenda
            </button>
            <button 
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                viewMode === 'report' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
              onClick={() => setViewMode('report')}
            >
              Weekly Report
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {viewMode === 'agenda' ? (
          /* Agenda View */
          <div className="p-4 space-y-4">
            <div className="bg-blue-50 p-4 rounded mb-4">
              <h3 className="font-medium text-blue-800">Meeting Purpose</h3>
              <p className="text-sm mt-1">
                This family meeting helps you discuss your progress in balancing family responsibilities 
                and set goals for the upcoming week. Use the discussion points below for a productive conversation.
              </p>
            </div>
            
            {/* Agenda Topics */}
            <div className="space-y-4">
              {agendaTopics.map(topic => (
                <div 
                  key={topic.id} 
                  className="border rounded-lg overflow-hidden"
                >
                  <div 
                    className="p-4 bg-gray-50 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleSection(topic.id)}
                  >
                    <div>
                      <h3 className="font-medium flex items-center">
                        {topic.title}
                        <span className="ml-2 text-sm text-gray-500">({topic.duration})</span>
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                    </div>
                    {expandedSection === topic.id ? (
                      <ChevronUp size={20} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-500" />
                    )}
                  </div>
                  
                  {expandedSection === topic.id && (
                    <div className="p-4 border-t">
                      {/* AI-generated insights */}
                      <div className="mb-4 bg-amber-50 p-3 rounded">
                        <h4 className="text-sm font-medium text-amber-800 mb-2">This Week's Insights:</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-amber-800">
                          {topic.insights.map((insight, idx) => (
                            <li key={idx}>{insight}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Discussion Questions:</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                          {topic.guideQuestions.map((question, idx) => (
                            <li key={idx}>{question}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Meeting Notes:</h4>
                        <textarea
                          placeholder="Add your family's discussion notes here..."
                          className="w-full p-3 border rounded-md h-24"
                          value={meetingNotes[topic.id]}
                          onChange={(e) => handleInputChange(topic.id, e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Additional Notes */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Additional Notes</h3>
              <textarea
                placeholder="Any other comments or observations from the family meeting..."
                className="w-full p-3 border rounded-md h-24"
                value={meetingNotes.additionalNotes}
                onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end pt-4 space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-50"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteMeeting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Complete Meeting'}
              </button>
            </div>
          </div>
        ) : (
          /* Report View */
          <div className="p-4 space-y-4">
            <div className="flex justify-end mb-2">
              <button
                onClick={handleDownloadReport}
                className="flex items-center text-sm text-blue-600"
              >
                <Download size={16} className="mr-1" />
                Download Report
              </button>
            </div>
            
            {/* Balance Score Card */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Weekly Balance Score</h3>
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">Mama ({weeklyReport.balanceScore.mama}%)</span>
                  <span className="font-medium">Papa ({weeklyReport.balanceScore.papa}%)</span>
                </div>
                <div className="h-2 bg-gray-200 rounded overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${weeklyReport.balanceScore.mama}%` }} 
                  />
                </div>
              </div>
              
              <p className="text-sm text-gray-800">
                This week's balance shows Mama handling {weeklyReport.balanceScore.mama}% of the family tasks.
                {weeklyReport.balanceScore.mama > 60 
                  ? " There's still room for improvement in balancing responsibilities."
                  : " Great progress on achieving a more balanced distribution!"
                }
              </p>
            </div>
            
            {/* Task Completion Summary */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Task Completion</h3>
              <div className="space-y-2">
                {Object.entries(weeklyReport.tasks).map(([parent, data]) => (
                  <div key={parent} className="flex justify-between items-center">
                    <span className="capitalize">{parent}</span>
                    <div className="flex items-center">
                      <span className="mr-2">
                        {data.completed} of {data.total} tasks completed
                      </span>
                      <div className="w-32 h-2 bg-gray-200 rounded overflow-hidden">
                        <div 
                          className="h-full bg-green-500" 
                          style={{ width: `${(data.completed / data.total) * 100}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Survey Highlights */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Survey Highlights</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {weeklyReport.surveyHighlights.map((highlight, idx) => (
                  <li key={idx}>{highlight}</li>
                ))}
              </ul>
            </div>
            
            {/* Areas for Improvement */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Areas for Discussion</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {weeklyReport.discrepancies.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            
            {/* Action Buttons for Report View */}
            <div className="flex justify-end pt-4 space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Back to Agenda
              </button>
            </div>
          </div>
        )}
        
        {/* Confirmation Dialog */}
        {showConfirmation && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles size={24} className="text-green-600" />
              </div>
              
              <h3 className="text-xl font-bold mb-2">Family Meeting Complete!</h3>
              <p className="text-gray-600 mb-6">
                Your family has completed the meeting for Week {currentWeek}. Ready to wrap up the week together?
              </p>
              
              <button
                onClick={handleCompleteWeekTogether}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md text-lg font-bold flex items-center justify-center hover:from-blue-600 hover:to-purple-700 transition-all"
                disabled={isCompleting}
              >
                {isCompleting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    <Star className="mr-2" size={20} />
                    Complete Week Together!
                    <Users className="ml-2" size={20} />
                  </>
                )}
              </button>
              
              <button
                onClick={() => setShowConfirmation(false)}
                className="mt-4 text-gray-600 hover:text-gray-800"
                disabled={isCompleting}
              >
                Not yet
              </button>
            </div>
          </div>
        )}
        
        {/* Celebration Animation */}
        {showCelebration && <Fireworks />}
      </div>
    </div>
  );
};

export default FamilyMeetingScreen;