import React, { useState, useEffect } from 'react';
import { Filter, Info, ChevronDown, ChevronUp, Calendar, TrendingUp, PieChart } from 'lucide-react';
import { useFamily } from '../../../contexts/FamilyContext';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  Radar, Legend, ResponsiveContainer, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, 
  PieChart as RechartPieChart, Pie, Cell, Sector, ComposedChart, Area,
  ScatterChart, Scatter, ZAxis
} from 'recharts';

const DashboardTab = () => {
  const { 
    completedWeeks, 
    currentWeek, 
    familyMembers,
    surveyResponses
  } = useFamily();
  
  // State for filters and expanded sections
  const [radarFilter, setRadarFilter] = useState('all'); // 'all', 'parents', 'children'
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'current', 'week1', 'week1-3', etc.
  const [expandedSections, setExpandedSections] = useState({
    balance: true,
    history: true,
    categories: true,
    insights: true,
    breakdown: false
  });
  
  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Calculate time filter options based on completed weeks
  const getTimeFilterOptions = () => {
    const options = [
      { id: 'all', label: 'All Time' },
      { id: 'current', label: `Week ${currentWeek}` }
    ];
    
    // Add individual weeks
    [...completedWeeks].sort((a, b) => a - b).forEach(week => {
      options.push({ id: `week${week}`, label: `Week ${week}` });
    });
    
    // Add ranges if we have enough weeks
    if (completedWeeks.length > 1) {
      options.push({ id: 'week1-current', label: `Week 1 to ${currentWeek}` });
      
      if (currentWeek >= 4) {
        options.push({ id: 'last4', label: 'Last 4 Weeks' });
      }
      
      if (currentWeek >= 8) {
        options.push({ id: 'last8', label: 'Last 8 Weeks' });
      }
    }
    
    return options;
  };
  
  // Filter data based on selected time period
  const filterDataByTime = (data) => {
    if (timeFilter === 'all') return data;
    
    if (timeFilter === 'current') {
      return data.filter(item => item.week === `Week ${currentWeek}` || item.week === 'Current');
    }
    
    if (timeFilter === 'last4') {
      return data.filter(item => {
        const weekNum = item.week === 'Initial' ? 0 : parseInt(item.week.split(' ')[1]);
        return weekNum > 0 && weekNum > currentWeek - 4 && weekNum <= currentWeek;
      });
    }
    
    if (timeFilter === 'last8') {
      return data.filter(item => {
        const weekNum = item.week === 'Initial' ? 0 : parseInt(item.week.split(' ')[1]);
        return weekNum > 0 && weekNum > currentWeek - 8 && weekNum <= currentWeek;
      });
    }
    
    if (timeFilter.startsWith('week') && !timeFilter.includes('-')) {
      const weekNum = parseInt(timeFilter.replace('week', ''));
      return data.filter(item => item.week === `Week ${weekNum}`);
    }
    
    if (timeFilter === 'week1-current') {
      return data.filter(item => {
        if (item.week === 'Initial') return true;
        const weekNum = parseInt(item.week.split(' ')[1]);
        return weekNum > 0 && weekNum <= currentWeek;
      });
    }
    
    return data;
  };
  
  // Sample data for radar chart
  const getRadarData = (filter) => {
    // This would be calculated from actual survey responses
    // Based on the filter, we'd show different data views
    switch(filter) {
      case 'parents':
        return [
          {
            category: "Visible Household",
            mama: 68,
            papa: 32
          },
          {
            category: "Invisible Household",
            mama: 80,
            papa: 20
          },
          {
            category: "Visible Parental",
            mama: 58,
            papa: 42
          },
          {
            category: "Invisible Parental",
            mama: 75,
            papa: 25
          }
        ];
      case 'children':
        return [
          {
            category: "Visible Household",
            mama: 62,
            papa: 38
          },
          {
            category: "Invisible Household",
            mama: 70,
            papa: 30
          },
          {
            category: "Visible Parental",
            mama: 50,
            papa: 50
          },
          {
            category: "Invisible Parental",
            mama: 65,
            papa: 35
          }
        ];
      case 'all':
      default:
        return [
          {
            category: "Visible Household",
            mama: 65,
            papa: 35
          },
          {
            category: "Invisible Household",
            mama: 75,
            papa: 25
          },
          {
            category: "Visible Parental",
            mama: 55,
            papa: 45
          },
          {
            category: "Invisible Parental",
            mama: 70,
            papa: 30
          }
        ];
    }
  };
  
  // Sample historical balance data for line chart
  // Only show up to current week
  const getBalanceHistory = () => {
    const baseHistory = [
      { week: 'Initial', mama: 68, papa: 32 },
      { week: 'Week 1', mama: 65, papa: 35 },
      { week: 'Week 2', mama: 62, papa: 38 },
      { week: 'Week 3', mama: 58, papa: 42 },
      { week: 'Week 4', mama: 56, papa: 44 },
      { week: 'Week 5', mama: 53, papa: 47 },
      { week: 'Week 6', mama: 52, papa: 48 },
      { week: 'Week 7', mama: 51, papa: 49 },
      { week: 'Week 8', mama: 50, papa: 50 }
    ];
    
    // Only include initial survey and completed weeks
    return baseHistory.filter((item, index) => {
      if (item.week === 'Initial') return true;
      const weekNum = parseInt(item.week.split(' ')[1]);
      return completedWeeks.includes(weekNum) || weekNum <= currentWeek;
    });
  };
  
  // Get task breakdown by category
  const getTaskBreakdown = () => {
    return [
      { name: 'Meal Planning', hours: 4.5, category: 'Invisible Household' },
      { name: 'Cleaning', hours: 5.2, category: 'Visible Household' },
      { name: 'Childcare', hours: 12.3, category: 'Visible Parental' },
      { name: 'Calendar Management', hours: 2.1, category: 'Invisible Household' },
      { name: 'Homework Help', hours: 3.7, category: 'Visible Parental' },
      { name: 'Mental Load', hours: 8.2, category: 'Invisible Parental' },
      { name: 'Cooking', hours: 7.3, category: 'Visible Household' },
      { name: 'Doctor Appointments', hours: 1.8, category: 'Invisible Parental' },
      { name: 'Home Repairs', hours: 2.4, category: 'Visible Household' },
      { name: 'Shopping', hours: 3.6, category: 'Visible Household' }
    ];
  };
  
  // Get time investment data
  const getTimeInvestmentData = () => {
    return [
      { name: 'Mama', visible: 22, invisible: 28 },
      { name: 'Papa', visible: 18, invisible: 12 }
    ];
  };
  
  // Get distribution over time
  const getDistributionOverTime = () => {
    return [
      { week: 'Initial', visibleMama: 65, invisibleMama: 72, visiblePapa: 35, invisiblePapa: 28 },
      { week: 'Week 1', visibleMama: 62, invisibleMama: 70, visiblePapa: 38, invisiblePapa: 30 },
      { week: 'Week 2', visibleMama: 60, invisibleMama: 68, visiblePapa: 40, invisiblePapa: 32 },
      { week: 'Week 3', visibleMama: 58, invisibleMama: 65, visiblePapa: 42, invisiblePapa: 35 },
      { week: 'Week 4', visibleMama: 56, invisibleMama: 62, visiblePapa: 44, invisiblePapa: 38 },
      { week: 'Week 5', visibleMama: 54, invisibleMama: 58, visiblePapa: 46, invisiblePapa: 42 },
      { week: 'Week 6', visibleMama: 52, invisibleMama: 55, visiblePapa: 48, invisiblePapa: 45 },
      { week: 'Week 7', visibleMama: 52, invisibleMama: 52, visiblePapa: 48, invisiblePapa: 48 },
      { week: 'Week 8', visibleMama: 50, invisibleMama: 50, visiblePapa: 50, invisiblePapa: 50 }
    ].filter((item) => {
      if (item.week === 'Initial') return true;
      const weekNum = parseInt(item.week.split(' ')[1]);
      return completedWeeks.includes(weekNum) || weekNum <= currentWeek;
    });
  };
  
  // Filter data based on time selection
  const balanceHistory = filterDataByTime(getBalanceHistory());
  const distributionOverTime = filterDataByTime(getDistributionOverTime());
  
  // Get key insights based on data
  const getKeyInsights = () => {
    // This would be generated based on actual data analysis
    return [
      {
        type: 'progress',
        title: 'Overall Balance Improving',
        description: 'The workload distribution has improved by 18% since starting ParentLoad.',
        icon: <TrendingUp size={20} className="text-green-600" />
      },
      {
        type: 'challenge',
        title: 'Invisible Tasks Need Focus',
        description: 'Invisible household tasks still show the biggest imbalance (75% vs 25%).',
        icon: <PieChart size={20} className="text-amber-600" />
      },
      {
        type: 'insight',
        title: 'Children See More Balance',
        description: 'Children perceive the workload as more balanced than the parents do themselves.',
        icon: <Info size={20} className="text-blue-600" />
      },
      {
        type: 'actionable',
        title: 'Next Steps',
        description: 'Focus on calendar management and meal planning to address the invisible task imbalance.',
        icon: <Calendar size={20} className="text-purple-600" />
      }
    ];
  };
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium text-sm">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.value}%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // COLORS
  const MAMA_COLOR = '#8884d8';
  const PAPA_COLOR = '#82ca9d';
  
  return (
    <div className="space-y-4">
      {/* Time Filter */}
      <div className="bg-white rounded-lg shadow p-4 flex items-center justify-end">
        <div className="flex items-center text-sm">
          <Filter size={14} className="mr-1" />
          <span className="mr-2">Time Period:</span>
          <select 
            className="border rounded py-1 px-2 bg-white"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            {getTimeFilterOptions().map(option => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Balance card */}
      <div className="bg-white rounded-lg shadow">
        <div 
          className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('balance')}
        >
          <h3 className="text-lg font-semibold">Current Family Balance</h3>
          {expandedSections.balance ? (
            <ChevronUp size={20} className="text-gray-500" />
          ) : (
            <ChevronDown size={20} className="text-gray-500" />
          )}
        </div>
        
        {expandedSections.balance && (
          <div className="p-6 pt-0">
            <p className="text-sm text-gray-600 mb-3">
              Current distribution of parental responsibilities
            </p>
              
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="font-medium">Mama (65%)</span>
                <span className="font-medium">Papa (35%)</span>
              </div>
              <div className="h-2 bg-gray-200 rounded overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '65%' }} />
              </div>
            </div>
              
            <div className="flex items-center text-sm text-gray-600">
              <span>
                Mama is handling more tasks than Papa. Check the recommendations for ways to improve balance.
              </span>
            </div>
            
            {/* Pie chart of current distribution */}
            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RechartPieChart>
                  <Pie
                    data={[
                      { name: 'Mama', value: 65 },
                      { name: 'Papa', value: 35 }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell key="cell-0" fill={MAMA_COLOR} />
                    <Cell key="cell-1" fill={PAPA_COLOR} />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
        
      {/* Balance history chart */}
      <div className="bg-white rounded-lg shadow">
        <div 
          className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('history')}
        >
          <h3 className="text-lg font-semibold">Task Balance History</h3>
          {expandedSections.history ? (
            <ChevronUp size={20} className="text-gray-500" />
          ) : (
            <ChevronDown size={20} className="text-gray-500" />
          )}
        </div>
        
        {expandedSections.history && (
          <div className="p-6 pt-0">
            <p className="text-sm text-gray-600 mb-4">
              See how your family's task balance has changed over time
            </p>
              
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={balanceHistory}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="mama" name="Mama's Tasks" stroke={MAMA_COLOR} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="papa" name="Papa's Tasks" stroke={PAPA_COLOR} />
                </LineChart>
              </ResponsiveContainer>
            </div>
              
            <div className="mt-4 text-sm text-center text-gray-500">
              {balanceHistory.length > 2 ? (
                <>
                  Your balance is improving! Papa's task share has increased by 
                  {' '}{balanceHistory[balanceHistory.length - 1].papa - balanceHistory[0].papa}% 
                  since the initial survey.
                </>
              ) : (
                "Complete more weekly check-ins to see your progress over time."
              )}
            </div>
          </div>
        )}
      </div>
        
      {/* Task Category Balance */}
      <div className="bg-white rounded-lg shadow">
        <div 
          className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('categories')}
        >
          <h3 className="text-lg font-semibold">Task Category Distribution</h3>
          {expandedSections.categories ? (
            <ChevronUp size={20} className="text-gray-500" />
          ) : (
            <ChevronDown size={20} className="text-gray-500" />
          )}
        </div>
        
        {expandedSections.categories && (
          <div className="p-6 pt-0">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                Distribution of responsibilities across the four task categories
              </p>
              <div className="flex items-center text-sm">
                <span className="mr-2">View:</span>
                <div className="flex border rounded overflow-hidden">
                  <button 
                    className={`px-2 py-1 ${radarFilter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-white'}`}
                    onClick={() => setRadarFilter('all')}
                  >
                    All
                  </button>
                  <button 
                    className={`px-2 py-1 border-l ${radarFilter === 'parents' ? 'bg-blue-100 text-blue-700' : 'bg-white'}`}
                    onClick={() => setRadarFilter('parents')}
                  >
                    Parents
                  </button>
                  <button 
                    className={`px-2 py-1 border-l ${radarFilter === 'children' ? 'bg-blue-100 text-blue-700' : 'bg-white'}`}
                    onClick={() => setRadarFilter('children')}
                  >
                    Children
                  </button>
                </div>
              </div>
            </div>
              
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius="80%" data={getRadarData(radarFilter)}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    
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
              The chart shows what percentage of tasks in each category are handled by Mama vs Papa.
            </div>
          </div>
        )}
      </div>
      
      {/* Key Insights */}
      <div className="bg-white rounded-lg shadow">
        <div 
          className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('insights')}
        >
          <h3 className="text-lg font-semibold">Key Insights</h3>
          {expandedSections.insights ? (
            <ChevronUp size={20} className="text-gray-500" />
          ) : (
            <ChevronDown size={20} className="text-gray-500" />
          )}
        </div>
        
        {expandedSections.insights && (
          <div className="p-6 pt-0">
            <p className="text-sm text-gray-600 mb-4">
              Actionable insights based on your family's data
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getKeyInsights().map((insight, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border ${
                    insight.type === 'progress' ? 'border-green-200 bg-green-50' :
                    insight.type === 'challenge' ? 'border-amber-200 bg-amber-50' :
                    insight.type === 'insight' ? 'border-blue-200 bg-blue-50' :
                    'border-purple-200 bg-purple-50'
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
        )}
      </div>
      
      {/* Task Breakdown */}
      <div className="bg-white rounded-lg shadow">
        <div 
          className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('breakdown')}
        >
          <h3 className="text-lg font-semibold">Advanced Analytics</h3>
          {expandedSections.breakdown ? (
            <ChevronUp size={20} className="text-gray-500" />
          ) : (
            <ChevronDown size={20} className="text-gray-500" />
          )}
        </div>
        
        {expandedSections.breakdown && (
          <div className="p-6 pt-0">
            <p className="text-sm text-gray-600 mb-4">
              Detailed breakdown of task distribution and time investment
            </p>
            
            {/* Task breakdown */}
            <h4 className="font-medium text-md mt-6 mb-3">Top 10 Tasks by Time Investment</h4>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getTaskBreakdown().sort((a, b) => b.hours - a.hours)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 'dataMax']} />
                  <YAxis dataKey="name" type="category" width={90} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hours" name="Hours per Week" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Visible vs Invisible */}
            <h4 className="font-medium text-md mt-8 mb-3">Visible vs Invisible Tasks</h4>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getTimeInvestmentData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="visible" name="Visible Tasks (hours/week)" stackId="a" fill="#8884d8" />
                  <Bar dataKey="invisible" name="Invisible Tasks (hours/week)" stackId="a" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Distribution over time */}
            <h4 className="font-medium text-md mt-8 mb-3">Task Type Distribution Over Time</h4>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={distributionOverTime}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="visibleMama" name="Mama - Visible" fill="#8884d8" stroke="#8884d8" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="invisibleMama" name="Mama - Invisible" fill="#8884d8" stroke="#8884d8" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="visiblePapa" name="Papa - Visible" fill="#82ca9d" stroke="#82ca9d" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="invisiblePapa" name="Papa - Invisible" fill="#82ca9d" stroke="#82ca9d" fillOpacity={0.6} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardTab;