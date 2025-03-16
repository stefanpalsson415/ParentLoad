// src/components/meeting/FamilyMeetingGenerator.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, MessageCircle, CheckCircle, Lightbulb, 
  Calendar, Clock, Download, Star, Brain
} from 'lucide-react';

const FamilyMeetingGenerator = ({ weekNumber, familyData, weeklyTasks }) => {
  const [generatedAgenda, setGeneratedAgenda] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  // Generate meeting agenda based on family data
  const generateAgenda = async () => {
    setGenerating(true);
    setError(null);
    
    try {
      // Import AI service
      const aiService = await import('../../services/aiService').then(module => module.default);
      
      // Generate agenda using AI
      const agenda = await aiService.generateMeetingAgenda(familyData, weekNumber);
      
      setGeneratedAgenda(agenda);
    } catch (error) {
      console.error("Error generating AI meeting agenda:", error);
      setError("There was an error generating your meeting agenda. Please try again.");
      
      // Fallback to rule-based agenda
      generateFallbackAgenda();
    } finally {
      setGenerating(false);
    }
  };
  
  // Generate a fallback agenda if AI fails
  const generateFallbackAgenda = () => {
    // Count completed tasks
    const completedTasks = weeklyTasks ? weeklyTasks.filter(t => t.completed).length : 0;
    const totalTasks = weeklyTasks ? weeklyTasks.length : 0;
    
    // Generate sample agenda based on data
    setGeneratedAgenda({
      weekNumber,
      suggestedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      suggestedDuration: "30 minutes",
      sections: [
        {
          title: "Review Progress",
          duration: "10 minutes",
          description: "Discuss task completion and survey responses",
          details: [
            `Review ${completedTasks} of ${totalTasks} completed tasks`,
            "Discuss any challenges with incomplete tasks",
            "Review survey responses from family members"
          ]
        },
        {
          title: "Celebrate Wins",
          duration: "5 minutes",
          description: "Recognize improvements and efforts",
          details: [
            `Acknowledge ${completedTasks} completed tasks`,
            "Recognize effort in balancing responsibilities",
            "Celebrate any improved balance metrics"
          ]
        },
        {
          title: "Address Challenges",
          duration: "10 minutes",
          description: "Discuss obstacles and find solutions",
          details: [
            "Identify ongoing imbalance areas",
            "Brainstorm solutions for difficult tasks",
            "Address any communication issues"
          ]
        },
        {
          title: "Set Next Week's Goals",
          duration: "5 minutes",
          description: "Agree on focus areas for the coming week",
          details: [
            "Set specific goals for Week " + (weekNumber + 1),
            "Assign new rebalancing tasks",
            "Schedule next family meeting"
          ]
        }
      ]
    });
  };
  
  // Get meeting status message based on current date and family data
  const getMeetingStatusMessage = () => {
    const currentWeek = weekNumber || 1;
    const completedTasks = weeklyTasks ? weeklyTasks.filter(t => t.completed).length : 0;
    const totalTasks = weeklyTasks ? weeklyTasks.length : 0;
    
    if (completedTasks < Math.ceil(totalTasks / 2)) {
      return {
        type: "warning",
        message: `It's recommended to complete more tasks before holding your Week ${currentWeek} meeting`
      };
    }
    
    return {
      type: "ready",
      message: `Your family is ready for the Week ${currentWeek} meeting!`
    };
  };
  
  const meetingStatus = getMeetingStatusMessage();
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-3">
          <Users className="text-blue-500 mr-2" size={20} />
          <h2 className="text-xl font-bold">Family Meeting Planner</h2>
        </div>
        
        <p className="text-gray-600 mb-4">
          Generate an AI-powered agenda for your Week {weekNumber} family meeting
        </p>
        
        {/* AI Feature Badge */}
        <div className="mb-4 inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
          <Brain size={14} className="mr-1" />
          Powered by Claude AI
        </div>
        
        {/* Meeting Status */}
        <div className={`p-4 rounded-lg ${
          meetingStatus.type === "ready" 
            ? "bg-green-50 border border-green-200" 
            : "bg-amber-50 border border-amber-200"
        }`}>
          <div className="flex items-start">
            {meetingStatus.type === "ready" ? (
              <CheckCircle className="text-green-600 mr-3 mt-1" size={20} />
            ) : (
              <Clock className="text-amber-600 mr-3 mt-1" size={20} />
            )}
            <p className={`${
              meetingStatus.type === "ready" ? "text-green-700" : "text-amber-700"
            }`}>
              {meetingStatus.message}
            </p>
          </div>
        </div>
        
        {/* Error display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}
        
        {/* Generate Button */}
        <div className="mt-6 text-center">
          <button 
            onClick={generateAgenda}
            disabled={generating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <MessageCircle size={16} className="mr-2" />
                Generate Meeting Agenda
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Generated Agenda */}
      {generatedAgenda && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Lightbulb className="text-blue-500 mr-2" size={20} />
              <h3 className="text-lg font-medium">AI-Generated Meeting Agenda</h3>
            </div>
            
            <button className="text-blue-600 flex items-center">
              <Download size={16} className="mr-1" />
              <span className="text-sm">Download</span>
            </button>
          </div>
          
          {/* Meeting Details */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded">
              <div className="flex items-center">
                <Calendar size={16} className="text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">Suggested Date:</span>
                <span className="ml-2 font-medium">{generatedAgenda.suggestedDate}</span>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded">
              <div className="flex items-center">
                <Clock size={16} className="text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">Suggested Duration:</span>
                <span className="ml-2 font-medium">{generatedAgenda.suggestedDuration}</span>
              </div>
            </div>
          </div>
          
          {/* Agenda Sections */}
          <div className="space-y-4">
            {generatedAgenda.sections.map((section, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{section.title}</h4>
                    <span className="text-sm text-gray-500">{section.duration}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                </div>
                
                <div className="p-4">
                  <ul className="space-y-2">
                    {section.details.map((detail, dIndex) => (
                      <li key={dIndex} className="flex items-start">
                        <Star size={12} className="text-amber-500 mr-2 mt-1" />
                        <span className="text-sm">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          
          {/* Tips */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Meeting Tips</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle size={12} className="text-blue-600 mr-2 mt-1" />
                <span className="text-sm text-blue-700">Choose a time when everyone can be present and focused</span>
              </li>
              <li className="flex items-start">
                <CheckCircle size={12} className="text-blue-600 mr-2 mt-1" />
                <span className="text-sm text-blue-700">Minimize distractions during the meeting</span>
              </li>
              <li className="flex items-start">
                <CheckCircle size={12} className="text-blue-600 mr-2 mt-1" />
                <span className="text-sm text-blue-700">Ensure everyone has a chance to speak</span>
              </li>
              <li className="flex items-start">
                <CheckCircle size={12} className="text-blue-600 mr-2 mt-1" />
                <span className="text-sm text-blue-700">End with clear action items for the coming week</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyMeetingGenerator;