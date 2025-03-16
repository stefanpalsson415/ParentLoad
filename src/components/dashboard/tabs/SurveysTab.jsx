// src/components/dashboard/tabs/SurveysTab.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, Calendar, Edit, AlertTriangle,
  X, ChevronDown, ChevronUp, Info
} from 'lucide-react';
import { useFamily } from '../../../hooks/useFamily';

const SurveysTab = ({ familyData }) => {
  const navigate = useNavigate();
  
  // Local state
  const [surveyList, setSurveyList] = useState([]);
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [newSurveyDate, setNewSurveyDate] = useState('');
  const [expandedInfo, setExpandedInfo] = useState({
    initialSurvey: false,
    weeklySurvey: false,
    meetingInfo: false
  });
  
  // Generate survey list
  useEffect(() => {
    if (!familyData) return;
    
    const { currentWeek = 1, completedWeeks = [] } = familyData;
    const familyMembers = familyData.familyMembers || [];
    
    // Get initial survey date
    const completedMembers = familyMembers.filter(m => m.completed);
    const initialDate = completedMembers.length > 0 
      ? new Date(Math.max(...completedMembers
          .filter(m => m.completedDate)
          .map(m => new Date(m.completedDate).getTime())))
      : new Date();
    
    // Build survey list
    const surveys = [
      {
        id: 'initial',
        name: 'Initial Survey',
        status: completedMembers.length === familyMembers.filter(m => m.role === 'parent').length 
          ? 'completed' 
          : 'in-progress',
        date: initialDate.toLocaleDateString(),
        scheduledDate: initialDate,
        allCompleted: completedMembers.length === familyMembers.filter(m => m.role === 'parent').length
      }
    ];
    
    // Add completed weekly check-ins
    completedWeeks.forEach(week => {
      // Create a date 7 days after initial survey for each week
      const weekDate = new Date(initialDate);
      weekDate.setDate(initialDate.getDate() + (week * 7));
      
      surveys.push({
        id: `week-${week}`,
        name: `Week ${week} Check-in`,
        status: 'completed',
        date: weekDate.toLocaleDateString(),
        scheduledDate: weekDate,
        allCompleted: true
      });
    });
    
    // Add current week if not completed
    if (!completedWeeks.includes(currentWeek)) {
      // Create a date 7 days after initial survey for current week
      const currentWeekDate = new Date(initialDate);
      currentWeekDate.setDate(initialDate.getDate() + (currentWeek * 7));
      
      // Check if any family members have completed this week
      const someCompleted = familyMembers.some(member => 
        member.weeklyCompleted?.[currentWeek-1]?.completed
      );
      
      const completed = familyMembers
        .filter(member => member.weeklyCompleted?.[currentWeek-1]?.completed)
        .map(member => member.id);
      
      surveys.push({
        id: `week-${currentWeek}`,
        name: `Week ${currentWeek} Check-in`,
        status: someCompleted ? 'in-progress' : 'upcoming',
        date: currentWeekDate.toLocaleDateString(),
        scheduledDate: currentWeekDate,
        allCompleted: false,
        completed: completed,
        pending: familyMembers
          .filter(member => !member.weeklyCompleted?.[currentWeek-1]?.completed)
          .map(member => member.id)
      });
    }
    
    // Add next 3 upcoming weeks
    const lastWeek = Math.max(currentWeek, ...completedWeeks, 0);
    for (let week = lastWeek + 1; week <= lastWeek + 3; week++) {
      // Create a date 7 days after initial survey for each upcoming week
      const weekDate = new Date(initialDate);
      weekDate.setDate(initialDate.getDate() + (week * 7));
      
      surveys.push({
        id: `week-${week}`,
        name: `Week ${week} Check-in`,
        status: 'upcoming',
        date: weekDate.toLocaleDateString(),
        scheduledDate: weekDate,
        allCompleted: false
      });
    }
    
    setSurveyList(surveys);
  }, [familyData]);
  
  // Format date for input field
  const formatDateForInput = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };
  
  // Start editing a survey date
  const startEditingDate = (survey) => {
    if (survey.status === 'completed') return; // Don't edit completed surveys
    setEditingSurvey(survey.id);
    setNewSurveyDate(formatDateForInput(survey.scheduledDate));
  };
  
  // Handle date change
  const handleDateChange = (e) => {
    setNewSurveyDate(e.target.value);
  };
  
  // Save new date
  const saveNewDate = async (surveyId) => {
    try {
      // Extract week number from surveyId
      const weekNum = parseInt(surveyId.replace('week-', ''));
      const newDate = new Date(newSurveyDate);
      
      // Here you would update the survey schedule in the database
      // await updateSurveySchedule(weekNum, newDate);
      
      // For now, we'll just update local state
      const updatedSurveys = surveyList.map(survey => {
        if (survey.id === surveyId) {
          return {
            ...survey,
            date: newDate.toLocaleDateString(),
            scheduledDate: newDate
          };
        }
        return survey;
      });
      
      setSurveyList(updatedSurveys);
      
      // Exit edit mode
      setEditingSurvey(null);
    } catch (error) {
      console.error("Error saving date:", error);
    }
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setEditingSurvey(null);
    setNewSurveyDate('');
  };
  
  // Toggle info sections
  const toggleInfoSection = (section) => {
    setExpandedInfo(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Start weekly check-in
  const startWeeklyCheckIn = () => {
    navigate('/weekly-check-in');
  };
  
  // Check if a survey is due soon (within 3 days)
  const isSurveyDueSoon = (survey) => {
    if (survey.status !== 'upcoming') return false;
    
    const surveyDate = survey.scheduledDate;
    const today = new Date();
    const diffTime = surveyDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= 3;
  };
  
  // Check if it's the current week's survey
  const isCurrentWeekSurvey = (survey) => {
    if (!familyData) return false;
    return survey.id === `week-${familyData.currentWeek}`;
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-2">Survey Schedule</h2>
        <p className="text-gray-600">
          Track survey completion and schedule upcoming check-ins
        </p>
      </div>
      
      {/* Current Week Call-to-Action */}
      {surveyList.find(s => isCurrentWeekSurvey(s) && s.status !== 'completed') && (
        <div className="bg-blue-50 rounded-lg shadow p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-blue-800">
                Week {familyData?.currentWeek} Check-in Available
              </h3>
              <p className="text-blue-700 mt-1">
                Complete your weekly check-in to track your family's progress
              </p>
            </div>
            <button 
              onClick={startWeeklyCheckIn}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Start Check-in
            </button>
          </div>
        </div>
      )}
      
      {/* Surveys List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Survey Timeline</h3>
        
        <div className="space-y-3">
          {surveyList.map(survey => (
            <div 
              key={survey.id} 
              className={`border rounded-lg p-4 ${
                isCurrentWeekSurvey(survey) && survey.status !== 'completed' 
                  ? 'border-blue-300 bg-blue-50' 
                  : isSurveyDueSoon(survey) 
                    ? 'border-amber-300 bg-amber-50' 
                    : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {survey.status === 'completed' ? (
                    <CheckCircle className="text-green-500" size={20} />
                  ) : survey.status === 'in-progress' ? (
                    <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-gray-300" />
                  )}
                  <div>
                    <h4 className="font-medium">{survey.name}</h4>
                    
                    {editingSurvey === survey.id ? (
                      <div className="flex items-center mt-1">
                        <input
                          type="date"
                          value={newSurveyDate}
                          onChange={handleDateChange}
                          className="border rounded px-2 py-1 text-sm"
                        />
                        <button
                          onClick={() => saveNewDate(survey.id)}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <p className="text-xs text-gray-500">
                          {survey.status === 'completed' 
                            ? `Completed on ${survey.date}` 
                            : survey.status === 'in-progress'
                              ? `Due by ${survey.date}`
                              : `Scheduled for ${survey.date}`
                          }
                        </p>
                        
                        {survey.status !== 'completed' && (
                          <button
                            onClick={() => startEditingDate(survey)}
                            className="ml-2 text-gray-500 hover:text-gray-700"
                          >
                            <Edit size={12} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center">
                  {survey.status === 'completed' ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Completed
                    </span>
                  ) : survey.status === 'in-progress' ? (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      In Progress
                    </span>
                  ) : isSurveyDueSoon(survey) ? (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full flex items-center">
                      <AlertTriangle size={12} className="mr-1" />
                      Due Soon
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                      Upcoming
                    </span>
                  )}
                </div>
              </div>
              
              {/* Family member completion status */}
              {survey.status === 'in-progress' && survey.completed && survey.pending && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-600 mb-2">Family completion status:</p>
                  <div className="flex flex-wrap gap-2">
                    {familyData?.familyMembers?.map(member => (
                      <div 
                        key={member.id} 
                        className={`px-2 py-1 rounded-full text-xs flex items-center ${
                          survey.completed.includes(member.id)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {survey.completed.includes(member.id) ? (
                          <CheckCircle size={10} className="mr-1" />
                        ) : (
                          <X size={10} className="mr-1" />
                        )}
                        {member.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Current week action button */}
              {isCurrentWeekSurvey(survey) && survey.status !== 'completed' && (
                <div className="mt-3 text-center">
                  <button
                    onClick={startWeeklyCheckIn}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    {survey.status === 'in-progress' ? 'Continue Check-in' : 'Start Check-in'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Survey Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">About Allie Surveys</h3>
        
        {/* Initial Survey Info */}
        <div className="border rounded-lg overflow-hidden mb-3">
          <div 
            className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
            onClick={() => toggleInfoSection('initialSurvey')}
          >
            <div className="flex items-center">
              <Calendar className="text-blue-500 mr-2" size={18} />
              <h4 className="font-medium">Initial Survey</h4>
            </div>
            <div>
              {expandedInfo.initialSurvey ? (
                <ChevronUp size={18} className="text-gray-500" />
              ) : (
                <ChevronDown size={18} className="text-gray-500" />
              )}
            </div>
          </div>
          
          {expandedInfo.initialSurvey && (
            <div className="p-4 bg-gray-50 border-t">
              <p className="text-sm text-gray-700">
                The initial survey establishes your family's baseline workload distribution. It includes 
                approximately 80 questions covering all aspects of household and parenting responsibilities.
                Each parent should complete this survey independently to get an accurate picture of current 
                task distribution.
              </p>
              <ul className="mt-3 space-y-1 text-sm text-gray-700 list-disc pl-5">
                <li>Takes about 20 minutes to complete</li>
                <li>Covers visible and invisible work</li>
                <li>Measures emotional labor</li>
                <li>Creates your family's baseline metrics</li>
              </ul>
            </div>
          )}
        </div>
        
        {/* Weekly Survey Info */}
        <div className="border rounded-lg overflow-hidden mb-3">
          <div 
            className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
            onClick={() => toggleInfoSection('weeklySurvey')}
          >
            <div className="flex items-center">
              <Calendar className="text-green-500 mr-2" size={18} />
              <h4 className="font-medium">Weekly Check-ins</h4>
            </div>
            <div>
              {expandedInfo.weeklySurvey ? (
                <ChevronUp size={18} className="text-gray-500" />
              ) : (
                <ChevronDown size={18} className="text-gray-500" />
              )}
            </div>
          </div>
          
          {expandedInfo.weeklySurvey && (
            <div className="p-4 bg-gray-50 border-t">
              <p className="text-sm text-gray-700">
                Weekly check-ins track your family's progress over time. They focus on a smaller set of questions
                (about 20) that are most relevant to your family's specific situation. Our AI selects these questions
                based on your previous responses and areas of imbalance.
              </p>
              <ul className="mt-3 space-y-1 text-sm text-gray-700 list-disc pl-5">
                <li>Takes 5-10 minutes to complete</li>
                <li>Adapts to your family's needs</li>
                <li>Helps track week-to-week progress</li>
                <li>Builds your family history data</li>
              </ul>
            </div>
          )}
        </div>
        
        {/* Meeting Info */}
        <div className="border rounded-lg overflow-hidden">
          <div 
            className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
            onClick={() => toggleInfoSection('meetingInfo')}
          >
            <div className="flex items-center">
              <Calendar className="text-purple-500 mr-2" size={18} />
              <h4 className="font-medium">Family Meetings</h4>
            </div>
            <div>
              {expandedInfo.meetingInfo ? (
                <ChevronUp size={18} className="text-gray-500" />
              ) : (
                <ChevronDown size={18} className="text-gray-500" />
              )}
            </div>
          </div>
          
          {expandedInfo.meetingInfo && (
            <div className="p-4 bg-gray-50 border-t">
              <p className="text-sm text-gray-700">
                After completing weekly check-ins, we recommend holding a family meeting to discuss results and 
                plan for the week ahead. Your Allie dashboard will generate an AI-powered agenda based on your 
                survey responses to help guide productive discussions.
              </p>
              <ul className="mt-3 space-y-1 text-sm text-gray-700 list-disc pl-5">
                <li>Suggested time: 15-30 minutes</li>
                <li>Review progress and celebrate wins</li>
                <li>Discuss areas for improvement</li>
                <li>Set goals for the coming week</li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {/* Help Section */}
      <div className="bg-blue-50 rounded-lg shadow p-4 border border-blue-200">
        <div className="flex items-start">
          <Info className="text-blue-500 mr-3 mt-1" size={20} />
          <div>
            <h3 className="font-medium text-blue-800">Need Help?</h3>
            <p className="text-sm text-blue-700 mt-1">
              If you need to reschedule a survey or have questions about the process, you can contact our support
              team or refer to the FAQ section for guidance.
            </p>
            <div className="mt-3">
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                View FAQ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveysTab;