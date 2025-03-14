// src/components/dashboard/tabs/WeeklyHistoryTab.jsx
import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, CheckCircle, BarChart3, MessageCircle, 
  ChevronDown, ChevronUp, Scale, Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFamily } from '../../../hooks/useFamily';

const WeeklyHistoryTab = ({ weekNumber }) => {
  const { 
    getWeekHistoryData, 
    getWeekStatus,
    familyMembers
  } = useFamily();
  
  const [weekData, setWeekData] = useState(null);
  const [weekStatus, setWeekStatus] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    tasks: true,
    balance: true,
    meeting: false
  });
  
  // Load weekly data on component mount or when week number changes
  useEffect(() => {
    const data = getWeekHistoryData(weekNumber);
    const status = getWeekStatus(weekNumber);
    
    setWeekData(data);
    setWeekStatus(status);
  }, [weekNumber, getWeekHistoryData, getWeekStatus]);
  
  // Toggle section expanded state
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // If no data found for this week
  if (!weekData) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">No data available for Week {weekNumber}</p>
      </div>
    );
  }
  
  // Format date from ISO string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Extract balance data
  const mamaPercentage = Math.round(weekData.balance?.mama || 50);
  const papaPercentage = Math.round(weekData.balance?.papa || 50);
  
  // Prepare chart data
  const prepareCategoryChartData = () => {
    const categories = [
      "Visible Household Tasks",
      "Invisible Household Tasks",
      "Visible Parental Tasks",
      "Invisible Parental Tasks"
    ];
    
    return categories.map(category => {
      const categoryData = weekData.categoryBalance?.[category] || { mama: 50, papa: 50 };
      return {
        category: category.replace(' Tasks', ''),
        mama: Math.round(categoryData.mama || 50),
        papa: Math.round(categoryData.papa || 50),
        imbalance: Math.round(Math.abs((categoryData.mama || 50) - (categoryData.papa || 50)))
      };
    });
  };
  
  const chartData = prepareCategoryChartData();
  
  return (
    <div className="space-y-6">
      {/* Week Overview Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Week {weekNumber} Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-sm mb-2">Completion Date</h3>
            <p>{formatDate(weekData.completionDate)}</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-sm mb-2">Overall Balance</h3>
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
            <h3 className="font-medium text-sm mb-2">Status</h3>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Complete
            </span>
          </div>
        </div>
      </div>
      
      {/* Balance Analysis */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div 
          className="p-4 border-b flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('balance')}
        >
          <div className="flex items-center">
            <BarChart3 className="text-blue-500 mr-2" size={20} />
            <h2 className="text-lg font-semibold">Balance Analysis</h2>
          </div>
          
          {expandedSections.balance ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </div>
        
        {expandedSections.balance && (
          <div className="p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="mama" name="Mama" fill="#8884d8" />
                  <Bar dataKey="papa" name="Papa" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 space-y-3">
              <h3 className="font-medium">Key Insights:</h3>
              
              {/* Find the most imbalanced category */}
              {chartData.some(cat => cat.imbalance > 20) ? (
                <div className="p-3 bg-amber-50 rounded-md border border-amber-200">
                  <p className="text-amber-800">
                    <strong>Imbalance Alert:</strong> {chartData.sort((a, b) => b.imbalance - a.imbalance)[0].category} tasks 
                    show a significant imbalance of {chartData.sort((a, b) => b.imbalance - a.imbalance)[0].imbalance}%.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-green-50 rounded-md border border-green-200">
                  <p className="text-green-800">
                    <strong>Good Balance:</strong> No major imbalances detected this week.
                  </p>
                </div>
              )}
              
              {/* Progress since last week */}
              {weekNumber > 1 && (
                <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                  <p className="text-blue-800">
                    <strong>Progress Update:</strong> Week-over-week data comparison not available in this view.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Completed Tasks */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div 
          className="p-4 border-b flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('tasks')}
        >
          <div className="flex items-center">
            <CheckCircle className="text-green-500 mr-2" size={20} />
            <h2 className="text-lg font-semibold">Completed Tasks</h2>
          </div>
          
          {expandedSections.tasks ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </div>
        
        {expandedSections.tasks && (
          <div className="p-6">
            {weekData.tasks && weekData.tasks.length > 0 ? (
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
                    {task.subTasks && task.subTasks.length > 0 && (
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
              <p className="text-gray-500 text-center">No tasks completed this week</p>
            )}
          </div>
        )}
      </div>
      
      {/* Family Meeting Notes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div 
          className="p-4 border-b flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('meeting')}
        >
          <div className="flex items-center">
            <MessageCircle className="text-indigo-500 mr-2" size={20} />
            <h2 className="text-lg font-semibold">Family Meeting Notes</h2>
          </div>
          
          {expandedSections.meeting ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </div>
        
        {expandedSections.meeting && (
          <div className="p-6">
            {weekData.meetingNotes ? (
              <div className="space-y-4">
                {/* Weekly Discussion */}
                {weekData.meetingNotes.weeklyDiscussion && (
                  <div>
                    <h3 className="font-medium mb-2">Weekly Discussion</h3>
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-line">
                        {weekData.meetingNotes.weeklyDiscussion}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Celebrations */}
                {weekData.meetingNotes.celebrations && (
                  <div>
                    <h3 className="font-medium mb-2">Celebrations</h3>
                    <div className="p-3 bg-green-50 rounded-md border border-green-200">
                      <p className="text-green-700 whitespace-pre-line">
                        {weekData.meetingNotes.celebrations}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Challenges */}
                {weekData.meetingNotes.challenges && (
                  <div>
                    <h3 className="font-medium mb-2">Challenges</h3>
                    <div className="p-3 bg-amber-50 rounded-md border border-amber-200">
                      <p className="text-amber-700 whitespace-pre-line">
                        {weekData.meetingNotes.challenges}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Action Items */}
                {weekData.meetingNotes.actionItems && (
                  <div>
                    <h3 className="font-medium mb-2">Action Items</h3>
                    <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                      <p className="text-blue-700 whitespace-pre-line">
                        {weekData.meetingNotes.actionItems}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Next Week Goals */}
                {weekData.meetingNotes.nextWeekGoals && (
                  <div>
                    <h3 className="font-medium mb-2">Next Week Goals</h3>
                    <div className="p-3 bg-purple-50 rounded-md border border-purple-200">
                      <p className="text-purple-700 whitespace-pre-line">
                        {weekData.meetingNotes.nextWeekGoals}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center">No meeting notes available for this week</p>
            )}
          </div>
        )}
      </div>
      
      {/* Survey Responses */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div 
          className="p-4 border-b flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('survey')}
        >
          <div className="flex items-center">
            <ClipboardList className="text-blue-500 mr-2" size={20} />
            <h2 className="text-lg font-semibold">Survey Responses</h2>
          </div>
          
          {expandedSections.survey ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </div>
        
        {expandedSections.survey && (
          <div className="p-6">
            {weekData.surveyResponses && Object.keys(weekData.surveyResponses).length > 0 ? (
              <div>
                <p className="mb-4 text-sm text-gray-600">
                  These are the responses from the Weekly Check-in survey for Week {weekNumber}.
                </p>
                
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Question
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Response
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(weekData.surveyResponses).map(([questionId, response], index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                            {questionId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {typeof response === 'string' ? (
                              <span className={`px-2 py-1 rounded-full ${
                                response === 'Mama' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : response === 'Papa'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                              }`}>
                                {response}
                              </span>
                            ) : (
                              <span className="text-gray-500">
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
            ) : (
              <p className="text-gray-500 text-center">No survey response data available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyHistoryTab;