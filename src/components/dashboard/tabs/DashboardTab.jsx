import React, { useState, useEffect } from 'react';
import { Filter, Info, ChevronDown, ChevronUp, TrendingUp, PieChart, Calendar } from 'lucide-react';
import { useFamily } from '../../../contexts/FamilyContext';
import { useSurvey } from '../../../contexts/SurveyContext';
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
  
  const { fullQuestionSet } = useSurvey();
  
  // State for filters and expanded sections
  const [radarFilter, setRadarFilter] = useState('all'); // 'all', 'parents', 'children'
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'initial', 'current', 'week1', 'week1-3', etc.
  const [expandedSections, setExpandedSections] = useState({
    balance: true,
    history: true,
    categories: true,
    insights: true,
    breakdown: false
  });
  
  // Loading states
  const [loading, setLoading] = useState({
    balance: true,
    history: true,
    categories: true,
    insights: true
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
    // Use a Set to track unique IDs
    const uniqueIds = new Set();
    const options = [];
    
    // Add initial options
    options.push({ id: 'all', label: 'All Time' });
    uniqueIds.add('all');
    
    options.push({ id: 'initial', label: 'Initial Survey' });
    uniqueIds.add('initial');
    
    options.push({ id: 'current', label: `Week ${currentWeek}` });
    uniqueIds.add('current');
    
    // Add individual weeks without duplicates
    [...completedWeeks].sort((a, b) => a - b).forEach(week => {
      const weekId = `week${week}`;
      if (!uniqueIds.has(weekId)) {
        options.push({ id: weekId, label: `Week ${week}` });
        uniqueIds.add(weekId);
      }
    });
    
    // Add ranges if we have enough weeks
    if (completedWeeks.length > 1) {
      const rangeId = 'week1-current';
      if (!uniqueIds.has(rangeId)) {
        options.push({ id: rangeId, label: `Week 1 to ${currentWeek}` });
        uniqueIds.add(rangeId);
      }
      
      if (currentWeek >= 4) {
        options.push({ id: 'last4', label: 'Last 4 Weeks' });
      }
      
      if (currentWeek >= 8) {
        options.push({ id: 'last8', label: 'Last 8 Weeks' });
      }
    }
    
    return options;
  };
  
  // Effect to update loading states for each section
  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      // In a real app, this would be fetching data from the database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLoading({
        balance: false,
        history: false,
        categories: false,
        insights: false
      });
    };
    
    loadData();
  }, [timeFilter, radarFilter]);
  
  // Filter data based on selected time period
  const filterDataByTime = (data) => {
    if (!data || data.length === 0) return [];
    
    if (timeFilter === 'all') return data;
    
    if (timeFilter === 'initial') {
      return data.filter(item => item.week === 'Initial');
    }
    
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
  
  // Get radar data - using forced values for demonstration
  const getRadarData = (filter) => {
    console.log("Getting radar data with forced values");
    
    // FORCE DATA FOR DEMONSTRATION
    return [
      { category: "Visible Household", mama: 65, papa: 35 },
      { category: "Invisible Household", mama: 75, papa: 25 },
      { category: "Visible Parental", mama: 55, papa: 45 },
      { category: "Invisible Parental", mama: 70, papa: 30 }
    ];
  };
  
  // Get current balance - forced data for demonstration
  const getCurrentBalance = () => {
    console.log("Getting current balance with forced data");
    
    // FORCE SOME DATA TO DISPLAY FOR TESTING
    return {
      mama: 60,
      papa: 40
    };
  };
  
  // Get balance history data
  const calculateBalanceHistory = () => {
    // Return sample data for now
    return [
      { week: 'Initial', mama: 70, papa: 30 },
      { week: 'Week 1', mama: 65, papa: 35 }
    ];
  };
  
  // Historical data for line chart - filtered by time period
  const balanceHistory = filterDataByTime(calculateBalanceHistory() || []);
  
  // Generate insights based on data
  const generateInsights = () => {
    if (!surveyResponses || Object.keys(surveyResponses).length === 0) {
      return [
        {
          type: 'waiting',
          title: 'Waiting for Survey Data',
          description: 'Complete the initial survey and weekly check-ins to generate insights.',
          icon: <Info size={20} className="text-blue-600" />
        }
      ];
    }
    
    // Create insights based on actual data
    const insights = [];
    const balance = getCurrentBalance();
    
    // Add progress insight if we have history data
    if (balanceHistory.length > 1) {
      const initialBalance = balanceHistory[0];
      const latestBalance = balanceHistory[balanceHistory.length - 1];
      
      if (initialBalance && latestBalance) {
        const change = latestBalance.papa - initialBalance.papa;
        
        if (change > 0) {
          insights.push({
            type: 'progress',
            title: 'Overall Balance Improving',
            description: `The workload distribution has improved by ${change}% since starting ParentLoad.`,
            icon: <TrendingUp size={20} className="text-green-600" />
          });
        }
      }
    }
    
    // Add challenge insight based on category balance
    const categoryData = getRadarData(radarFilter);
    const mostImbalancedCategory = categoryData.sort((a, b) => 
      Math.abs(b.mama - b.papa) - Math.abs(a.mama - a.papa)
    )[0];
    
    if (mostImbalancedCategory && Math.abs(mostImbalancedCategory.mama - mostImbalancedCategory.papa) > 20) {
      insights.push({
        type: 'challenge',
        title: `${mostImbalancedCategory.category} Needs Focus`,
        description: `${mostImbalancedCategory.category} tasks show the biggest imbalance (${mostImbalancedCategory.mama}% vs ${mostImbalancedCategory.papa}%).`,
        icon: <PieChart size={20} className="text-amber-600" />
      });
    }
    
    // Add generic insight if we don't have enough data
    if (insights.length < 2) {
      insights.push({
        type: 'insight',
        title: 'Keep Tracking Your Progress',
        description: 'Continue completing weekly check-ins to generate more personalized insights.',
        icon: <Calendar size={20} className="text-blue-600" />
      });
    }
    
    return insights;
  };
  
  // Get key insights for the dashboard
  const getKeyInsights = () => {
    return generateInsights();
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
  
  // Get current balance
  const currentBalance = getCurrentBalance();
  
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
          <h3 className="text-lg font-semibold">Family Balance</h3>
          {expandedSections.balance ? (
            <ChevronUp size={20} className="text-gray-500" />
          ) : (
            <ChevronDown size={20} className="text-gray-500" />
          )}
        </div>
        
        {expandedSections.balance && (
          <div className="p-6 pt-0">
            {loading.balance ? (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-500">Loading data...</p>
                </div>
              </div>
            ) : !currentBalance || 
            ((currentBalance.mama === 0 && currentBalance.papa === 0) && 
             !(timeFilter === 'all' || timeFilter === 'initial')) ? (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center p-6 bg-gray-50 rounded-lg max-w-md">
                  <p className="text-gray-600">
                    Not enough data to display balance information yet. Complete the initial survey and weekly check-ins to see your family balance data.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-3">
                  {timeFilter === 'initial' 
                    ? 'Initial survey distribution of parental responsibilities'
                    : 'Current distribution of parental responsibilities'}
                </p>
                  
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">Mama ({currentBalance.mama}%)</span>
                    <span className="font-medium">Papa ({currentBalance.papa}%)</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${currentBalance.mama}%` }} />
                  </div>
                </div>
                  
                <div className="flex items-center text-sm text-gray-600">
                  <span>
                    {currentBalance.mama > 60
                      ? "Mama is handling more tasks than Papa. Check the recommendations for ways to improve balance."
                      : currentBalance.mama < 40
                        ? "Papa is handling more tasks than Mama. Check the recommendations for ways to improve balance."
                        : "Your family has a good balance of responsibilities!"}
                  </span>
                </div>
                
                {/* Pie chart of current distribution */}
                <div className="h-64 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartPieChart>
                      <Pie
                        data={[
                          { name: 'Mama', value: currentBalance.mama },
                          { name: 'Papa', value: currentBalance.papa }
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
              </>
            )}
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
            {loading.history ? (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-500">Loading data...</p>
                </div>
              </div>
            ) : !balanceHistory || balanceHistory.length < 2 ? (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center p-6 bg-gray-50 rounded-lg max-w-md">
                  <p className="text-gray-600">
                    Not enough data to display history yet. Complete at least one weekly check-in to see your progress over time.
                  </p>
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
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
            {loading.categories ? (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-500">Loading data...</p>
                </div>
              </div>
            ) : !getRadarData(radarFilter) || getRadarData(radarFilter).every(item => item.mama === 0 && item.papa === 0) ? (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center p-6 bg-gray-50 rounded-lg max-w-md">
                  <p className="text-gray-600">
                    Not enough data to display category distribution yet. Complete the initial survey to see the breakdown by task category.
                  </p>
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
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
            {loading.insights ? (
              <div className="h-24 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-500">Loading insights...</p>
                </div>
              </div>
            ) : (
              <>
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
                        insight.type === 'waiting' ? 'border-gray-200 bg-gray-50' :
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
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Task Breakdown - Advanced section, hidden by default */}
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
            <div className="h-24 flex items-center justify-center">
              <div className="text-center p-6 bg-gray-50 rounded-lg max-w-md">
                <p className="text-gray-600">
                  Advanced analytics will be available once you have completed more weekly check-ins.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardTab;