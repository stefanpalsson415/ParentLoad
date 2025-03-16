// src/components/dashboard/tabs/WeeklyHistoryTab.jsx
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { 
  CheckCircle, BookOpen, ChevronDown, ChevronUp, 
  Lightbulb, Info, Clock, MessageCircle
} from 'lucide-react';
import { useFamily } from '../../../hooks/useFamily';

const WeeklyHistoryTab = ({ weekNumber }) => {
  const { getWeekHistoryData } = useFamily();
  
  // Local state
  const [weekData, setWeekData] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    balance: true,
    tasks: true,
    meeting: false,
    survey: false
  });
  
  // Load week data on component mount or when weekNumber changes
  useEffect(() => {
    const data = getWeekHistoryData(weekNumber);
    setWeekData(data);
  }, [weekNumber, getWeekHistoryData]);
  
  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Format date from ISO string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Handle missing weekData
  if (!weekData) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">No data available for Week {weekNumber}</p>
      </div>
    );
  }
  
  // Create radar chart data
  const getRadarData = () => {
    if (!weekData || !weekData.categoryBalance) {
      return [
        { category: "Visible Household", mama: 50, papa: 50 },
        { category: "Invisible Household", mama: 50, papa: 50 },
        { category: "Visible Parental", mama: 50, papa: 50 },
        { category: "Invisible Parental", mama: 50, papa: 50 }
      ];
    }
    
    return Object.entries(weekData.categoryBalance).map(([category, data]) => ({
      category: category.replace(" Tasks", ""),
      mama: Math.round(data.mama || 50),
      papa: Math.round(data.papa || 50)
    }));
  };
  
  // Generate insights based on the week's data
  const getKeyInsights = () => {
    if (!weekData) return [];
    
    const insights = [];
    
    // Add balance insight
    if (weekData.balance) {
      const { mama, papa } = weekData.balance;
      
      if (Math.abs(mama - papa) > 20) {
        insights.push({
          type: 'challenge',
          title: 'Significant Imbalance',
          description: `Week ${weekNumber} showed a ${Math.abs(mama - papa).toFixed(0)}% imbalance with ${
            mama > papa ? 'Mama' : 'Papa'
          } handling more tasks.`,
          icon: <Info size={20} className="text-amber-600" />
        });
      } else {
        insights.push({
          type: 'success',
          title: 'Good Balance',
          description: `Week ${weekNumber} showed a fairly balanced workload with only a ${
            Math.abs(mama - papa).toFixed(0)
          }% difference.`,
          icon: <CheckCircle size={20} className="text-green-600" />
        });
      }
    }
    
    // Add task completion insight
    if (weekData.tasks) {
      const completedTasks = weekData.tasks.filter(t => t.completed);
      
      if (completedTasks.length > 0) {
        insights.push({
          type: 'progress',
          title: 'Task Completion',
          description: `Your family completed ${completedTasks.length} of ${weekData.tasks.length} assigned tasks in Week ${weekNumber}.`,
          icon: <CheckCircle size={20} className="text-green-600" />
        });
      }
    }
    
    // Add meeting notes insight
    if (weekData.meetingNotes && Object.keys(weekData.meetingNotes).length > 0) {
      insights.push({
        type: 'insight',
        title: 'Family Meeting Completed',
        description: `Your family discussed progress and set new goals in the Week ${weekNumber} meeting.`,
        icon: <Lightbulb size={20} className="text-blue-600" />
      });
    }
    
    return insights;
  };
  
  const radarData = getRadarData();
  const insights = getKeyInsights();
  
  // Extract balance data
  const mamaPercentage = Math.round(weekData.balance?.mama || 50);
  const papaPercentage = Math.round(weekData.balance?.papa || 50);
  
  // COLORS
  const MAMA_COLOR = '#8884d8';
  const PAPA_COLOR = '#82ca9d';
  
  return (
    <div className="space-y-6">
      {/* Week Overview Header */}
      <div 
        className="bg-white rounded-lg shadow overflow-hidden"
      >
        <div 
          className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('overview')}
        >
          <div className="flex items-center">
            <Info className="text-blue-500 mr-2" size={20} />
            <h2 className="text-lg font-semibold">Week {weekNumber} Overview</h2>
          </div>
          {expandedSections.overview ? (
            <ChevronUp size={20} className="text-gray-500" />
          ) : (
            <ChevronDown size={20} className="text-gray-500" />
          )}
        </div>
        
        {expandedSections.overview && (
          <div className="p-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium mb-2">Completion Date</h3>
                <p>{formatDate(weekData.completionDate)}</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium mb-2">Overall Balance</h3>
                <div className="flex items-center">
                  <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500"
                      style={{ width: `${mamaPercentage}%` }}
                    ></div>
                  </div>
                  <div className="ml-3 text-sm">
                    <span className="text-purple-600">{mamaPercentage}%</span>
                    {' / '}
                    <span className="text-green-600">{papaPercentage}%</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Mama</span>
                  <span>Papa</span>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium mb-2">Status</h3>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Complete
                </span>
              </div>
            </div>
            
            {/* Key Insights */}
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">Key Insights:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border ${
                      insight.type === 'progress' ? 'border-green-200 bg-green-50' :
                      insight.type === 'challenge' ? 'border-amber-200 bg-amber-50' :
                      insight.type === 'success' ? 'border-green-200 bg-green-50' :
                      'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="mt-1 mr-3">
                        {insight.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <p className="text-sm mt-1">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Balance Distribution */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div 
          className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('balance')}
        >
          <div className="flex items-center">
            <BarChart size={20} className="text-blue-500 mr-2" />
            <h2 className="text-lg font-semibold">Task Distribution</h2>
          </div>
          {expandedSections.balance ? (
            <ChevronUp size={20} className="text-gray-500" />
          ) : (
            <ChevronDown size={20} className="text-gray-500" />
          )}
        </div>
        
        {expandedSections.balance && (
          <div className="p-6 border-t">
            <p className="text-sm text-gray-600 mb-4">
              Distribution of responsibilities across the four task categories
            </p>
              
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius="80%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <Radar
                    name="Mama's Tasks"
                    dataKey="mama"
                    stroke={MAMA_COLOR}
                    fill={MAMA_COLOR}
                    fillOpacity={0.5}
                  />
                  <Radar
                    name="Papa's Tasks"
                    dataKey="papa"
                    stroke={PAPA_COLOR}
                    fill={PAPA_COLOR}
                    fillOpacity={0.5}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
              
            <div className="mt-4 text-sm text-center text-gray-500">
              The chart shows what percentage of tasks in each category were handled by Mama vs Papa in Week {weekNumber}.
            </div>
          </div>
        )}
      </div>
      
      {/* Completed Tasks */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div 
          className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('tasks')}
        >
          <div className="flex items-center">
            <CheckCircle size={20} className="text-green-500 mr-2" />
            <h2 className="text-lg font-semibold">Completed Tasks</h2>
          </div>
          {expandedSections.tasks ? (
            <ChevronUp size={20} className="text-gray-500" />
          ) : (
            <ChevronDown size={20} className="text-gray-500" />
          )}
        </div>
        
        {expandedSections.tasks && (
          <div className="p-6 border-t">
            {weekData.tasks && weekData.tasks.filter(task => task.completed).length > 0 ? (
              <div className="space-y-4">
                {weekData.tasks.filter(task => task.completed).map(task => (
                  <div key={task.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{task.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        
                        <div className="mt-2 flex items-center text-xs text-gray-500">
                          <Clock size={12} className="mr-1" />
                          <span>Completed: {formatDate(task.completedDate)}</span>
                        </div>
                      </div>
                      
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          task.assignedTo === 'Mama' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {task.assignedToName || task.assignedTo}
                        </span>
                      </div>
                    </div>
                    
                    {/* Subtasks summary if available */}
                    {task.subTasks && task.subTasks.filter(st => st.completed).length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <h4 className="text-xs font-medium mb-2">Completed Subtasks:</h4>
                        <div className="space-y-1">
                          {task.subTasks.filter(st => st.completed).map((subtask, index) => (
                            <div key={index} className="text-xs flex items-start">
                              <CheckCircle size={12} className="text-green-500 mr-2 mt-0.5" />
                              <span>{subtask.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">No tasks completed in Week {weekNumber}</p>
            )}
          </div>
        )}
      </div>
      
      {/* Family Meeting Notes */}
      {weekData.meetingNotes && Object.keys(weekData.meetingNotes).length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div 
            className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
            onClick={() => toggleSection('meeting')}
          >
            <div className="flex items-center">
              <BookOpen size={20} className="text-amber-500 mr-2" />
              <h2 className="text-lg font-semibold">Family Meeting Notes</h2>
            </div>
            {expandedSections.meeting ? (
              <ChevronUp size={20} className="text-gray-500" />
            ) : (
              <ChevronDown size={20} className="text-gray-500" />
            )}
          </div>
          
          {expandedSections.meeting && (
            <div className="p-6 border-t">
              <div className="flex items-center mb-4">
                <MessageCircle size={20} className="text-amber-500 mr-2" />
                <h3 className="text-lg font-medium">Week {weekNumber} Meeting Summary</h3>
              </div>
              
              <div className="space-y-4">
                {/* Render different sections of meeting notes */}
                {weekData.meetingNotes.weeklyDiscussion && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-medium mb-2">Weekly Discussion</h4>
                    <p className="text-sm text-gray-700">{weekData.meetingNotes.weeklyDiscussion}</p>
                  </div>
                )}
                
                {weekData.meetingNotes.celebrations && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium mb-2 text-green-800">Celebrations</h4>
                    <p className="text-sm text-green-700">{weekData.meetingNotes.celebrations}</p>
                  </div>
                )}
                
                {weekData.meetingNotes.challenges && (
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="font-medium mb-2 text-amber-800">Challenges</h4>
                    <p className="text-sm text-amber-700">{weekData.meetingNotes.challenges}</p>
                  </div>
                )}
                
                {weekData.meetingNotes.nextWeekGoals && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium mb-2 text-blue-800">Goals for Week {weekNumber + 1}</h4>
                    <p className="text-sm text-blue-700">{weekData.meetingNotes.nextWeekGoals}</p>
                  </div>
                )}
                
                {weekData.meetingNotes.additionalNotes && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium mb-2 text-purple-800">Additional Notes</h4>
                    <p className="text-sm text-purple-700">{weekData.meetingNotes.additionalNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Survey Responses */}
      {weekData.surveyResponses && Object.keys(weekData.surveyResponses).length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div 
            className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
            onClick={() => toggleSection('survey')}
          >
            <div className="flex items-center">
              <CheckCircle size={20} className="text-blue-500 mr-2" />
              <h2 className="text-lg font-semibold">Survey Responses</h2>
            </div>
            {expandedSections.survey ? (
              <ChevronUp size={20} className="text-gray-500" />
            ) : (
              <ChevronDown size={20} className="text-gray-500" />
            )}
          </div>
          
          {expandedSections.survey && (
            <div className="p-6 border-t">
              <p className="mb-4 text-sm text-gray-600">
                Key responses from the Week {weekNumber} survey
              </p>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Question
                      </th>
                      <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Response
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(weekData.surveyResponses).map(([questionId, response], index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="py-2 px-4 text-sm text-gray-900">
                          {questionId}
                        </td>
                        <td className="py-2 px-4">
                          {typeof response === 'string' ? (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              response === 'Mama' 
                                ? 'bg-purple-100 text-purple-800' 
                                : response === 'Papa'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}>
                              {response}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">
                              {JSON.stringify(response)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeeklyHistoryTab;