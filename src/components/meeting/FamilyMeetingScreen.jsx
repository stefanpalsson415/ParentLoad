import React, { useState } from 'react';
import { Clock, Download, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useFamily } from '../../contexts/FamilyContext';

const FamilyMeetingScreen = ({ onClose }) => {
  const { currentWeek, saveFamilyMeetingNotes } = useFamily();
  
  const [meetingNotes, setMeetingNotes] = useState({
    taskCompletion: '',
    surveyResults: '',
    nextWeekGoals: '',
    additionalNotes: ''
  });
  const [expandedSection, setExpandedSection] = useState(null);
  const [viewMode, setViewMode] = useState('agenda'); // 'agenda' or 'report'
  const [isSaving, setIsSaving] = useState(false);
  
  // Simulate meeting topics and data
  const agendaTopics = [
    {
      id: 'taskCompletion',
      title: 'Review Task Completion',
      duration: '10 min',
      description: 'Discuss which tasks were completed and how they went',
      guideQuestions: [
        'Which tasks did each parent complete this week?',
        'Were there any challenges in completing the tasks?',
        'How did completing these tasks affect the family balance?'
      ]
    },
    {
      id: 'surveyResults',
      title: 'Survey Results Discussion',
      duration: '10 min',
      description: 'Review this week\'s survey results and notable changes',
      guideQuestions: [
        'What areas showed the most improvement?',
        'Are there any tasks that one parent is doing significantly more than the other?',
        'How do the children\'s perceptions compare to the parents\' perceptions?'
      ]
    },
    {
      id: 'nextWeekGoals',
      title: 'Next Week\'s Goals',
      duration: '10 min',
      description: 'Set intentions for the coming week and discuss new tasks',
      guideQuestions: [
        'What specific tasks will each parent focus on next week?',
        'Are there any upcoming events that require special planning?',
        'How can we better support each other in the coming week?'
      ]
    }
  ];
  
  // Sample weekly report data
  const weeklyReport = {
    balanceScore: 65, // Mama's percentage
    taskCompletion: [
      { parent: 'Mama', completed: 3, total: 3 },
      { parent: 'Papa', completed: 2, total: 3 }
    ],
    surveyHighlights: [
      'Papa has taken over meal planning for the week',
      'Visible household tasks are becoming more balanced',
      'Children report improvement in Papa\'s involvement with homework'
    ],
    discrepancies: [
      'Parents disagree on who handled doctor appointments this week',
      'Children perceive Mama is still managing most invisible tasks'
    ]
  };
  
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
      
      // Close the meeting modal
      onClose();
    } catch (error) {
      console.error("Error saving meeting notes:", error);
      alert("There was an error saving your meeting notes. Please try again.");
    } finally {
      setIsSaving(false);
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
                  <span className="font-medium">Mama ({weeklyReport.balanceScore}%)</span>
                  <span className="font-medium">Papa ({100 - weeklyReport.balanceScore}%)</span>
                </div>
                <div className="h-2 bg-gray-200 rounded overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${weeklyReport.balanceScore}%` }} 
                  />
                </div>
              </div>
              
              <p className="text-sm text-gray-800">
                This week's balance shows Mama handling {weeklyReport.balanceScore}% of the family tasks.
                {weeklyReport.balanceScore > 60 
                  ? " There's still room for improvement in balancing responsibilities."
                  : " Great progress on achieving a more balanced distribution!"
                }
              </p>
            </div>
            
            {/* Task Completion Summary */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Task Completion</h3>
              <div className="space-y-2">
                {weeklyReport.taskCompletion.map((parent, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span>{parent.parent}</span>
                    <div className="flex items-center">
                      <span className="mr-2">
                        {parent.completed} of {parent.total} tasks completed
                      </span>
                      <div className="w-32 h-2 bg-gray-200 rounded overflow-hidden">
                        <div 
                          className="h-full bg-green-500" 
                          style={{ width: `${(parent.completed / parent.total) * 100}%` }} 
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
      </div>
    </div>
  );
};

export default FamilyMeetingScreen;