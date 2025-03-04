import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useFamily } from '../../../contexts/FamilyContext';

const SurveysTab = ({ onStartWeeklyCheckIn }) => {
  const { 
    familyMembers, 
    currentWeek,
    completedWeeks 
  } = useFamily();
  
  // Generate list of all surveys - initial + weekly check-ins
  const getSurveyList = () => {
    // Start with initial survey
    const surveys = [
      {
        id: 'initial',
        name: 'Initial Survey',
        status: 'completed',
        date: new Date().toLocaleDateString(), // In a real app, use actual date
        allCompleted: true
      }
    ];
    
    // Add completed weekly check-ins
    completedWeeks.forEach(week => {
      surveys.push({
        id: `week-${week}`,
        name: `Week ${week} Check-in`,
        status: 'completed',
        date: new Date().toLocaleDateString(), // In a real app, use actual date
        allCompleted: true
      });
    });
    
    // Add current week if not completed
    if (!completedWeeks.includes(currentWeek)) {
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
        date: new Date().toLocaleDateString(), // In a real app, use due date
        allCompleted: false,
        completed: completed,
        pending: familyMembers
          .filter(member => !member.weeklyCompleted?.[currentWeek-1]?.completed)
          .map(member => member.id)
      });
    }
    
    // Add next week
    surveys.push({
      id: `week-${currentWeek + 1}`,
      name: `Week ${currentWeek + 1} Check-in`,
      status: 'upcoming',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(), // One week from now
      allCompleted: false
    });
    
    return surveys;
  };
  
  const surveyList = getSurveyList();
  
  return (
    <div className="space-y-4">
      {/* Completed Surveys List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3">Survey History</h3>
        <p className="text-sm text-gray-600 mb-4">
          Track your family's survey history and progress
        </p>
          
        <div className="space-y-3">
          {surveyList.map(survey => (
            <div key={survey.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {survey.status === 'completed' ? (
                    <CheckCircle className="text-green-500" />
                  ) : survey.status === 'in-progress' ? (
                    <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-gray-300" />
                  )}
                  <div>
                    <h4 className="font-medium">{survey.name}</h4>
                    <p className="text-xs text-gray-500">
                      {survey.status === 'completed' 
                        ? `Completed on ${survey.date}` 
                        : survey.status === 'in-progress'
                          ? `Due by ${survey.date}`
                          : `Upcoming on ${survey.date}`
                      }
                    </p>
                  </div>
                </div>
                  
                <div className="flex items-center">
                  {survey.status === 'completed' ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Complete
                    </span>
                  ) : survey.status === 'in-progress' ? (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      In Progress
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      Upcoming
                    </span>
                  )}
                </div>
              </div>
                
              {survey.status === 'in-progress' && !survey.allCompleted && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-600 mb-2">Family completion status:</p>
                  <div className="flex gap-1">
                    {familyMembers.map(member => (
                      <div 
                        key={member.id} 
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                          survey.completed?.includes(member.id) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                        }`}
                        title={`${member.name}: ${survey.completed?.includes(member.id) ? 'Completed' : 'Not completed'}`}
                      >
                        {survey.completed?.includes(member.id) ? '✓' : member.name.charAt(0)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* For in-progress surveys, show option to continue */}
              {survey.status === 'in-progress' && (
                <div className="mt-3 text-center">
                  <button
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded"
                    onClick={onStartWeeklyCheckIn}
                  >
                    Continue Check-in
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SurveysTab;