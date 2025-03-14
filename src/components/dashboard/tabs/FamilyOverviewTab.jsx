// src/components/dashboard/tabs/FamilyOverviewTab.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, Users, CheckCircle, AlertTriangle, Brain, Award,
  ChevronRight, Info, CalendarCheck, BarChart, Clock
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

const FamilyOverviewTab = ({ familyData, familyMembers, tasks }) => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // Filter options for the data visualization
  const filterOptions = [
    { id: 'all', label: 'All Time' },
    { id: 'initial', label: 'Initial Survey' },
    ...(familyData?.completedWeeks || []).map(week => ({
      id: `week-${week}`,
      label: `Week ${week}`
    }))
  ];
  
  // Calculate completion percentages
  const calculateCompletion = () => {
    // Parent completion
    const parentMembers = familyMembers.filter(m => m.role === 'parent');
    const completedParents = parentMembers.filter(m => m.completed);
    const parentCompletion = parentMembers.length > 0 
      ? (completedParents.length / parentMembers.length) * 100 
      : 0;
    
    // Weekly check-in completion
    const currentWeek = familyData?.currentWeek || 1;
    const weeklyCompletionCount = parentMembers.filter(m => 
      m.weeklyCompleted && 
      m.weeklyCompleted[currentWeek-1] && 
      m.weeklyCompleted[currentWeek-1].completed
    ).length;
    const weeklyCompletion = parentMembers.length > 0 
      ? (weeklyCompletionCount / parentMembers.length) * 100 
      : 0;
    
    // Task completion
    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter(t => t.completed)?.length || 0;
    const taskCompletion = totalTasks > 0 
      ? (completedTasks / totalTasks) * 100 
      : 0;
    
    return {
      parentCompletion,
      weeklyCompletion,
      taskCompletion
    };
  };
  
  const completion = calculateCompletion();
  
  // Function to extract balance data based on the selected filter
  const getBalanceData = () => {
    const categories = [
      "Visible Household Tasks",
      "Invisible Household Tasks",
      "Visible Parental Tasks",
      "Invisible Parental Tasks"
    ];
    
    // Default balance data
    const defaultData = categories.map(category => ({
      category,
      mama: 50,
      papa: 50,
      imbalance: 0
    }));
    
    if (selectedFilter === 'all') {
      // For all time, use the most recent data
      if (familyData?.weekHistory?.week1) {
        const latestWeekKey = Object.keys(familyData.weekHistory)
          .filter(key => key.startsWith('week'))
          .sort()
          .pop();
        
        if (familyData.weekHistory[latestWeekKey]?.categoryBalance) {
          return categories.map(category => {
            const balance = familyData.weekHistory[latestWeekKey].categoryBalance[category] || { mama: 50, papa: 50, imbalance: 0 };
            return {
              category,
              mama: Math.round(balance.mama || 50),
              papa: Math.round(balance.papa || 50),
              imbalance: Math.round(balance.imbalance || 0)
            };
          });
        }
      }
    }
    else if (selectedFilter === 'initial') {
      // Use initial survey data
      if (familyData?.weekHistory?.initial?.categoryBalance) {
        return categories.map(category => {
          const balance = familyData.weekHistory.initial.categoryBalance[category] || { mama: 50, papa: 50, imbalance: 0 };
          return {
            category,
            mama: Math.round(balance.mama || 50),
            papa: Math.round(balance.papa || 50),
            imbalance: Math.round(balance.imbalance || 0)
          };
        });
      }
    }
    else if (selectedFilter.startsWith('week-')) {
      // Use specific week data
      const weekNumber = selectedFilter.replace('week-', '');
      const weekKey = `week${weekNumber}`;
      
      if (familyData?.weekHistory && familyData.weekHistory[weekKey]?.categoryBalance) {
        return categories.map(category => {
          const balance = familyData.weekHistory[weekKey].categoryBalance[category] || { mama: 50, papa: 50, imbalance: 0 };
          return {
            category,
            mama: Math.round(balance.mama || 50),
            papa: Math.round(balance.papa || 50),
            imbalance: Math.round(balance.imbalance || 0)
          };
        });
      }
    }
    
    // Return default data if no data found
    return defaultData;
  };
  
  const balanceData = getBalanceData();
  
  // Calculate overall balance
  const calculateOverallBalance = () => {
    let overallMama = 0;
    let overallPapa = 0;
    
    balanceData.forEach(item => {
      overallMama += item.mama;
      overallPapa += item.papa;
    });
    
    const total = balanceData.length;
    
    return {
      mama: total > 0 ? Math.round(overallMama / total) : 50,
      papa: total > 0 ? Math.round(overallPapa / total) : 50
    };
  };
  
  const overallBalance = calculateOverallBalance();
  
  // Calculate progress data for each week
  const getProgressData = () => {
    const weekProgress = [];
    
    // Get all week keys from weekHistory
    const weekKeys = Object.keys(familyData?.weekHistory || {})
      .filter(key => key.startsWith('week'))
      .sort((a, b) => {
        const aNum = parseInt(a.replace('week', ''));
        const bNum = parseInt(b.replace('week', ''));
        return aNum - bNum;
      });
    
    // Add initial survey if available
    if (familyData?.weekHistory?.initial?.balance) {
      weekProgress.push({
        name: 'Initial',
        mama: Math.round(familyData.weekHistory.initial.balance.mama || 50),
        papa: Math.round(familyData.weekHistory.initial.balance.papa || 50)
      });
    }
    
    // Add each week's data
    weekKeys.forEach(key => {
      if (familyData?.weekHistory[key]?.balance) {
        weekProgress.push({
          name: `Week ${key.replace('week', '')}`,
          mama: Math.round(familyData.weekHistory[key].balance.mama || 50),
          papa: Math.round(familyData.weekHistory[key].balance.papa || 50)
        });
      }
    });
    
    return weekProgress;
  };
  
  const progressData = getProgressData();
  
  // Most imbalanced categories
  const mostImbalancedCategories = [...balanceData]
    .sort((a, b) => b.imbalance - a.imbalance)
    .slice(0, 2);
  
  // Colors for the charts
  const COLORS = {
    mama: '#8884d8',
    papa: '#82ca9d',
    warning: '#ffc658',
    success: '#4caf50',
    neutral: '#9e9e9e'
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Family Dashboard</h1>
        
        {/* Filter dropdown */}
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">Filter:</span>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="border rounded-md px-2 py-1 text-sm"
          >
            {filterOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Family Members */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="flex items-center mb-4">
          <Users className="text-blue-500 mr-2" size={20} />
          <h2 className="text-lg font-semibold">Family Members</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {familyMembers.map(member => (
            <div key={member.id} className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-2 overflow-hidden border-2 border-gray-200">
                <img 
                  src={member.profilePicture || `/api/placeholder/100/100`} 
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-medium">{member.name}</p>
              <p className="text-xs text-gray-500 capitalize">{member.roleType || member.role}</p>
              {member.role === 'parent' && (
                <div className="mt-2">
                  {member.completed ? (
                    <span className="inline-flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <CheckCircle size={12} className="mr-1" />
                      Survey Complete
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                      <AlertTriangle size={12} className="mr-1" />
                      Survey Pending
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Completion Stat */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Initial Survey</h3>
            <div className={`text-xs px-2 py-1 rounded-full ${
              completion.parentCompletion === 100 
                ? 'bg-green-50 text-green-600' 
                : 'bg-amber-50 text-amber-600'
            }`}>
              {completion.parentCompletion === 100 
                ? 'Complete' 
                : 'In Progress'}
            </div>
          </div>
          
          <div className="h-2 bg-gray-100 rounded-full mb-1">
            <div 
              className={`h-full rounded-full ${
                completion.parentCompletion === 100 
                  ? 'bg-green-500' 
                  : 'bg-amber-500'
              }`}
              style={{ width: `${completion.parentCompletion}%` }}
            ></div>
          </div>
          
          <p className="text-xs text-gray-500">
            {Math.round(completion.parentCompletion)}% of parents completed
          </p>
        </div>
        
        {/* Weekly Check-in Stat */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Week {familyData?.currentWeek || 1} Check-in</h3>
            <div className={`text-xs px-2 py-1 rounded-full ${
              completion.weeklyCompletion === 100 
                ? 'bg-green-50 text-green-600' 
                : 'bg-amber-50 text-amber-600'
            }`}>
              {completion.weeklyCompletion === 100 
                ? 'Complete' 
                : 'In Progress'}
            </div>
          </div>
          
          <div className="h-2 bg-gray-100 rounded-full mb-1">
            <div 
              className={`h-full rounded-full ${
                completion.weeklyCompletion === 100 
                  ? 'bg-green-500' 
                  : 'bg-amber-500'
              }`}
              style={{ width: `${completion.weeklyCompletion}%` }}
            ></div>
          </div>
          
          <p className="text-xs text-gray-500">
            {Math.round(completion.weeklyCompletion)}% of parents completed
          </p>
        </div>
        
        {/* Task Completion Stat */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Task Completion</h3>
            <div className={`text-xs px-2 py-1 rounded-full ${
              completion.taskCompletion > 75 
                ? 'bg-green-50 text-green-600' 
                : completion.taskCompletion > 25
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-red-50 text-red-600'
            }`}>
              {completion.taskCompletion > 75 
                ? 'Good Progress' 
                : completion.taskCompletion > 25
                  ? 'Making Progress'
                  : 'Needs Attention'}
            </div>
          </div>
          
          <div className="h-2 bg-gray-100 rounded-full mb-1">
            <div 
              className={`h-full rounded-full ${
                completion.taskCompletion > 75 
                  ? 'bg-green-500' 
                  : completion.taskCompletion > 25
                    ? 'bg-amber-500'
                    : 'bg-red-500'
              }`}
              style={{ width: `${completion.taskCompletion}%` }}
            ></div>
          </div>
          
          <p className="text-xs text-gray-500">
            {Math.round(completion.taskCompletion)}% of tasks completed
          </p>
        </div>
      </div>
      
      {/* Balance Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex items-center mb-4">
          <BarChart3 className="text-blue-500 mr-2" size={20} />
          <h2 className="text-lg font-semibold">Family Balance Overview</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Overall Balance */}
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-center font-medium mb-4">Overall Balance</h3>
            <div className="h-40 w-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Mama', value: overallBalance.mama },
                      { name: 'Papa', value: overallBalance.papa }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell key="mama" fill={COLORS.mama} />
                    <Cell key="papa" fill={COLORS.papa} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-center mt-2 space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 mr-1"></div>
                <span className="text-xs">Mama: {overallBalance.mama}%</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 mr-1"></div>
                <span className="text-xs">Papa: {overallBalance.papa}%</span>
              </div>
            </div>
            
            {/* Assessment of balance */}
            <div className={`mt-4 text-center px-3 py-1 rounded-full text-xs ${
              Math.abs(overallBalance.mama - 50) < 10
                ? 'bg-green-50 text-green-600'
                : Math.abs(overallBalance.mama - 50) < 20
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-red-50 text-red-600'
            }`}>
              {Math.abs(overallBalance.mama - 50) < 10
                ? 'Well Balanced'
                : Math.abs(overallBalance.mama - 50) < 20
                  ? 'Slight Imbalance'
                  : 'Significant Imbalance'}
            </div>
          </div>
          
          {/* Category Balance */}
          <div className="col-span-2 flex flex-col">
            <h3 className="font-medium mb-4">Category Breakdown</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={250}>
                <RechartsBarChart
                  data={balanceData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="mama" name="Mama" fill={COLORS.mama} />
                  <Bar dataKey="papa" name="Papa" fill={COLORS.papa} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI-Powered Insights */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="flex items-center mb-4">
          <Brain className="text-purple-500 mr-2" size={20} />
          <h2 className="text-lg font-semibold">AI-Powered Insights</h2>
        </div>
        
        <div className="space-y-4">
          {/* Overall Balance Insight */}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <div className="flex items-start">
              <Award className="text-purple-600 mr-3 mt-1 flex-shrink-0" size={18} />
              <div>
                <h3 className="font-medium text-purple-800">Overall Balance Assessment</h3>
                <p className="text-sm text-purple-700 mt-1">
                  {Math.abs(overallBalance.mama - 50) < 10
                    ? `Great job! Your family has achieved a well-balanced distribution of responsibilities with a near 50/50 split.`
                    : Math.abs(overallBalance.mama - 50) < 20
                      ? `Your family has a slight imbalance with ${overallBalance.mama > 50 ? 'Mama' : 'Papa'} handling ${Math.max(overallBalance.mama, overallBalance.papa)}% of tasks. There's room for improvement.`
                      : `Your family has a significant imbalance with ${overallBalance.mama > 50 ? 'Mama' : 'Papa'} handling ${Math.max(overallBalance.mama, overallBalance.papa)}% of tasks. This imbalance should be addressed.`
                  }
                </p>
              </div>
            </div>
          </div>
          
          {/* Category Insights */}
          {mostImbalancedCategories.map((category, index) => (
            <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-start">
                <Info className="text-blue-600 mr-3 mt-1 flex-shrink-0" size={18} />
                <div>
                  <h3 className="font-medium text-blue-800">{category.category} Imbalance</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    {category.mama > category.papa
                      ? `Mama is handling ${category.mama}% of ${category.category.toLowerCase()}, creating a ${category.imbalance}% imbalance. Consider redistributing some of these tasks to Papa.`
                      : `Papa is handling ${category.papa}% of ${category.category.toLowerCase()}, creating a ${category.imbalance}% imbalance. Consider redistributing some of these tasks to Mama.`
                    }
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Progress Insight */}
          {progressData.length > 1 && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-start">
                <Clock className="text-green-600 mr-3 mt-1 flex-shrink-0" size={18} />
                <div>
                  <h3 className="font-medium text-green-800">Progress Over Time</h3>
                  <p className="text-sm text-green-700 mt-1">
                    {Math.abs(progressData[0].mama - progressData[progressData.length - 1].mama) > 5
                      ? `Your family has made noticeable progress in balancing workload, moving from a ${progressData[0].mama}% / ${progressData[0].papa}% split to a ${progressData[progressData.length - 1].mama}% / ${progressData[progressData.length - 1].papa}% split.`
                      : `Your family's workload balance has remained stable over time. Continue working on implementing the recommended tasks.`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Progress Over Time */}
      {progressData.length > 1 && (
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center mb-4">
            <BarChart className="text-blue-500 mr-2" size={20} />
            <h2 className="text-lg font-semibold">Progress Over Time</h2>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={progressData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="mama" name="Mama" fill={COLORS.mama} />
                <Bar dataKey="papa" name="Papa" fill={COLORS.papa} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {/* Upcoming Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="flex items-center mb-4">
          <CalendarCheck className="text-blue-500 mr-2" size={20} />
          <h2 className="text-lg font-semibold">Next Steps</h2>
        </div>
        
        <div className="space-y-3">
          {/* Survey completion reminder */}
          {completion.parentCompletion < 100 && (
            <div className="flex items-center justify-between bg-amber-50 p-3 rounded border border-amber-100">
              <div className="flex items-center">
                <AlertTriangle className="text-amber-500 mr-2" size={18} />
                <span className="text-amber-700">Complete Initial Survey</span>
              </div>
              <button
                onClick={() => navigate('/survey')}
                className="text-xs bg-amber-500 text-white px-3 py-1 rounded hover:bg-amber-600"
              >
                Continue
              </button>
            </div>
          )}
          
          {/* Weekly check-in reminder */}
          {completion.weeklyCompletion < 100 && (
            <div className="flex items-center justify-between bg-blue-50 p-3 rounded border border-blue-100">
              <div className="flex items-center">
                <CheckCircle className="text-blue-500 mr-2" size={18} />
                <span className="text-blue-700">Complete Weekly Check-in</span>
              </div>
              <button
                onClick={() => navigate('/weekly-check-in')}
                className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Start
              </button>
            </div>
          )}
          
          {/* Pending tasks reminder */}
          {tasks && tasks.filter(t => !t.completed).length > 0 && (
            <div className="flex items-center justify-between bg-green-50 p-3 rounded border border-green-100">
              <div className="flex items-center">
                <CheckCircle className="text-green-500 mr-2" size={18} />
                <span className="text-green-700">Complete Assigned Tasks</span>
              </div>
              <button
                onClick={() => navigate('/tasks')}
                className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                View Tasks
              </button>
            </div>
          )}
          
          {/* All complete - next family meeting */}
          {completion.parentCompletion === 100 && 
           completion.weeklyCompletion === 100 && 
           (tasks?.filter(t => !t.completed).length === 0) && (
            <div className="flex items-center justify-between bg-purple-50 p-3 rounded border border-purple-100">
              <div className="flex items-center">
                <CheckCircle className="text-purple-500 mr-2" size={18} />
                <span className="text-purple-700">Schedule Family Meeting</span>
              </div>
              <button
                onClick={() => setActiveTab('relationship')}
                className="text-xs bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
              >
                Learn More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilyOverviewTab;