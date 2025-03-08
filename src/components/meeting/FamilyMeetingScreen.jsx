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
    wentWell: '',
    couldImprove: '',
    actionItems: '',
    nextWeekGoals: '',
    additionalNotes: ''
  });
  const [expandedSection, setExpandedSection] = useState('wentWell'); // Default expanded section
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
        id: 'wentWell',
        title: '1. What Went Well',
        duration: '10 min',
        description: 'Celebrate your family\'s wins this week',
        guideQuestions: [
          'What tasks did each parent successfully complete?',
          'What worked well in terms of sharing responsibilities?',
          'When did you feel most balanced as a family this week?'
        ],
        insights: insights.successInsights
      },
      {
        id: 'couldImprove',
        title: '2. What Could Improve',
        duration: '10 min',
        description: 'Identify opportunities for better balance',
        guideQuestions: [
          'What challenges did you face with task completion?',
          'Where did the workload feel unbalanced?',
          'What obstacles prevented better sharing of responsibilities?'
        ],
        insights: insights.challengeInsights
      },
      {
        id: 'actionItems',
        title: '3. Action Items for Next Week',
        duration: '10 min',
        description: 'Commit to specific improvements',
        guideQuestions: [
          'What specific tasks will each parent take ownership of?',
          'How will you address the challenges identified earlier?',
          'What support does each family member need next week?'
        ],
        insights: insights.actionInsights
      }
    ];
  };
  
  // Analyze family data to generate insights
  const analyzeData = () => {
    // In a real app, this would analyze actual survey responses to find patterns
    return {
      successInsights: [
        "Papa completed 2 of 3 assigned tasks this week",
        "Mama successfully took on more meal planning",
        "The family had more balanced evenings together"
      ],
      challengeInsights: [
        "School-related communication is still 80% handled by Mama",
        "Morning routines remain unbalanced",
        "Unexpected work demands made task completion difficult"
      ],
      actionInsights: [
        "Focus on evening routine sharing",
        "Papa can take lead on school communications next week",
        "Set up family calendar to better coordinate schedules"
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
            
            {/* Family Retrospective Info */}
            <div className="p-4 border rounded-lg mb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h4 className="font-medium mb-3 text-blue-800">About Sprint Retrospectives</h4>
              <p className="text-sm text-blue-700 mb-2">
                We're using a format that professional teams use to improve how they work together! This simple 
                structure helps families reflect on what's working and what needs improvement.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">✓ What Went Well</span>
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">⚠ What Could Improve</span>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">→ Action Items</span>
              </div>
            </div>
            
            {/* Retrospective Sections */}
            <div className="space-y-6">
              {/* What Went Well Section */}
              <div className="p-4 border rounded-lg bg-green-50">
                <h4 className="font-medium mb-2 flex items-center text-green-800">
                  <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2 text-green-600">✓</span>
                  What Went Well
                </h4>
                <p className="text-sm text-green-700 mb-3">
                  Celebrate your family's wins this week! What are you proud of? What balanced tasks did you accomplish?
                </p>
                <textarea
                  placeholder="Share your family's successes this week..."
                  className="w-full p-3 border border-green-200 rounded-md h-24 bg-white"
                  value={meetingNotes.wentWell || ''}
                  onChange={(e) => handleInputChange('wentWell', e.target.value)}
                />
              </div>
              
              {/* What Could Improve Section */}
              <div className="p-4 border rounded-lg bg-amber-50">
                <h4 className="font-medium mb-2 flex items-center text-amber-800">
                  <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center mr-2 text-amber-600">⚠</span>
                  What Could Improve
                </h4>
                <p className="text-sm text-amber-700 mb-3">
                  What challenges did your family face? Where do you see room for better balance?
                </p>
                <textarea
                  placeholder="Discuss areas where your family could improve next week..."
                  className="w-full p-3 border border-amber-200 rounded-md h-24 bg-white"
                  value={meetingNotes.couldImprove || ''}
                  onChange={(e) => handleInputChange('couldImprove', e.target.value)}
                />
              </div>
              
              {/* Action Items Section */}
              <div className="p-4 border rounded-lg bg-blue-50">
                <h4 className="font-medium mb-2 flex items-center text-blue-800">
                  <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 text-blue-600">→</span>
                  Action Items
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  What specific changes will your family commit to next week? Who will do what?
                </p>
                <textarea
                  placeholder="List 2-3 concrete actions your family will take next week..."
                  className="w-full p-3 border border-blue-200 rounded-md h-24 bg-white"
                  value={meetingNotes.actionItems || ''}
                  onChange={(e) => handleInputChange('actionItems', e.target.value)}
                />
              </div>
              
              {/* Next Week Goals Section */}
              <div className="p-4 border rounded-lg bg-purple-50">
                <h4 className="font-medium mb-2 flex items-center text-purple-800">
                  <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-2 text-purple-600">🎯</span>
                  Next Week's Goals
                </h4>
                <p className="text-sm text-purple-700 mb-3">
                  What would a successful Week {currentWeek + 1} look like for your family?
                </p>
                <textarea
                  placeholder="Describe your family's vision for next week..."
                  className="w-full p-3 border border-purple-200 rounded-md h-24 bg-white"
                  value={meetingNotes.nextWeekGoals || ''}
                  onChange={(e) => handleInputChange('nextWeekGoals', e.target.value)}
                />
              </div>
              
              {/* Additional Notes */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Additional Notes</h4>
                <textarea
                  placeholder="Any other comments or observations from the family meeting..."
                  className="w-full p-3 border rounded-md h-24"
                  value={meetingNotes.additionalNotes}
                  onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                />
              </div>
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