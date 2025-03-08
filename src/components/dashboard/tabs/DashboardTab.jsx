import React, { useState, useEffect } from 'react';
import { Filter, Info, ChevronDown, ChevronUp, TrendingUp, PieChart, Calendar, Activity, Heart } from 'lucide-react';
import { useFamily } from '../../../contexts/FamilyContext';
import FamilyJourneyChart from '../FamilyJourneyChart';
import { useSurvey } from '../../../contexts/SurveyContext';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  Radar, Legend, ResponsiveContainer, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, 
  PieChart as RechartPieChart, Pie, Cell, Area, ComposedChart
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
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'initial', 'current', 'week1', 'week2', etc.
  const [expandedSections, setExpandedSections] = useState({
    balance: true,
    history: true,
    categories: true,
    insights: true,
    familyProgress: true,  // Changed from breakdown to familyProgress
    familyJourney: true  // Add this line

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
    const options = [];
    
    // Add All Time option
    options.push({ id: 'all', label: 'All Time' });
    
    // Add Initial Survey option
    options.push({ id: 'initial', label: 'Initial Survey' });
    
    // Add only completed weeks (sorted)
    [...completedWeeks]
      .sort((a, b) => a - b)
      .forEach(week => {
        options.push({ id: `week${week}`, label: `Week ${week}` });
      });
    
    // Add current week if not in completed weeks
    if (!completedWeeks.includes(currentWeek)) {
      options.push({ id: `week${currentWeek}`, label: `Week ${currentWeek}` });
    }
    
    return options;
  };
  
  // Effect to update loading states for each section
  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      // In a real app, this would be fetching data from the database
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      // For Initial survey view, we want to show just the initial survey point
      return data.filter(item => item.week === 'Initial');
    }
    
    if (timeFilter === 'current') {
      return data.filter(item => item.week === `Week ${currentWeek}` || item.week === 'Current');
    }
    
    // Handle specific week filters (like 'week1', 'week2')
    if (timeFilter.startsWith('week') && !timeFilter.includes('-')) {
      const weekNum = parseInt(timeFilter.replace('week', ''));
      
      // For Week N view, we want to show data from Initial through Week N
      // This gives users a sense of progress over time
      return data.filter(item => {
        if (item.week === 'Initial') return true;
        
        if (item.week.startsWith('Week ')) {
          const itemWeekNum = parseInt(item.week.replace('Week ', ''));
          return itemWeekNum <= weekNum;
        }
        
        return false;
      });
    }
    
    return data;
  };
  
  // Calculate radar data based on survey responses
  const getRadarData = (filter) => {
    console.log("Calculating radar data from survey responses");
    
    // Define the categories
    const categories = {
      "Visible Household": { mama: 0, papa: 0, total: 0 },
      "Invisible Household": { mama: 0, papa: 0, total: 0 },
      "Visible Parental": { mama: 0, papa: 0, total: 0 },
      "Invisible Parental": { mama: 0, papa: 0, total: 0 }
    };
    
    // Filter survey responses based on the selected time period
    const filteredResponses = {};
    
    if (timeFilter === 'initial') {
      // Only include responses from initial survey
      Object.keys(surveyResponses).forEach(key => {
        if (!key.includes('week-') && key.includes('q')) {
          filteredResponses[key] = surveyResponses[key];
        }
      });
    } else if (timeFilter.startsWith('week')) {
      // Extract week number
      const weekNum = parseInt(timeFilter.replace('week', ''));
      
      // Include responses for this specific week
      Object.keys(surveyResponses).forEach(key => {
        if (key.includes(`week-${weekNum}`) || key.includes(`weekly-${weekNum}`)) {
          filteredResponses[key] = surveyResponses[key];
        }
      });
    } else {
      // 'all' - include all responses
      Object.assign(filteredResponses, surveyResponses);
    }
    
    // Apply filter for view perspective (all, parents, children)
    const responsesToAnalyze = filteredResponses;
    
    // Count responses by category
    Object.keys(responsesToAnalyze).forEach(key => {
      // Extract question ID from key (assuming format like "q1" or "week-1-q1")
      let questionId = key;
      if (key.includes('-')) {
        const parts = key.split('-');
        // Look for the part that starts with "q"
        questionId = parts.find(part => part.startsWith('q')) || key;
      }
      
      // Simple categorization based on question ID ranges
      // Questions 1-20 are Visible Household Tasks
      // Questions 21-40 are Invisible Household Tasks
      // Questions 41-60 are Visible Parental Tasks
      // Questions 61-80 are Invisible Parental Tasks
      
      let category = null;
      if (questionId.startsWith('q')) {
        const qNum = parseInt(questionId.replace('q', ''));
        
        if (qNum >= 1 && qNum <= 20) {
          category = "Visible Household";
        } else if (qNum >= 21 && qNum <= 40) {
          category = "Invisible Household";
        } else if (qNum >= 41 && qNum <= 60) {
          category = "Visible Parental";
        } else if (qNum >= 61 && qNum <= 80) {
          category = "Invisible Parental";
        }
        
        if (category) {
          categories[category].total++;
          const value = responsesToAnalyze[key];
          if (value === 'Mama') {
            categories[category].mama++;
          } else if (value === 'Papa') {
            categories[category].papa++;
          }
        }
      }
    });
    
    // Convert counts to percentages and format for radar chart
    const result = Object.entries(categories).map(([category, counts]) => {
      // If no data for this category, use sample data based on time period
      if (counts.total === 0) {
        if (timeFilter === 'initial') {
          // Initial survey usually shows greater imbalance
          if (category === "Visible Household") return { category, mama: 65, papa: 35 };
          if (category === "Invisible Household") return { category, mama: 75, papa: 25 };
          if (category === "Visible Parental") return { category, mama: 55, papa: 45 };
          if (category === "Invisible Parental") return { category, mama: 70, papa: 30 };
        } else if (timeFilter.startsWith('week')) {
          // Show gradually improving balance for later weeks
          const weekNum = parseInt(timeFilter.replace('week', ''));
          if (category === "Visible Household") return { category, mama: Math.max(50, 65 - (weekNum * 5)), papa: Math.min(50, 35 + (weekNum * 5)) };
          if (category === "Invisible Household") return { category, mama: Math.max(50, 75 - (weekNum * 5)), papa: Math.min(50, 25 + (weekNum * 5)) };
          if (category === "Visible Parental") return { category, mama: Math.max(50, 55 - (weekNum * 2)), papa: Math.min(50, 45 + (weekNum * 2)) };
          if (category === "Invisible Parental") return { category, mama: Math.max(50, 70 - (weekNum * 5)), papa: Math.min(50, 30 + (weekNum * 5)) };
        } else {
          // Default sample data
          if (category === "Visible Household") return { category, mama: 65, papa: 35 };
          if (category === "Invisible Household") return { category, mama: 75, papa: 25 };
          if (category === "Visible Parental") return { category, mama: 55, papa: 45 };
          if (category === "Invisible Parental") return { category, mama: 70, papa: 30 };
        }
      }
      
      // Calculate percentages from actual data
      return {
        category,
        mama: Math.round((counts.mama / counts.total) * 100),
        papa: Math.round((counts.papa / counts.total) * 100)
      };
    });
    
    return result;
  };
  
  // Get current balance using survey responses
  const getCurrentBalance = () => {
    console.log("Calculating current balance from survey responses");
    
    // Filter the survey responses based on the selected time period
    const filteredResponses = {};
    
    // If timeFilter is a specific week or 'initial', filter responses for that period
    if (timeFilter === 'initial') {
      // Only include responses from initial survey
      Object.keys(surveyResponses).forEach(key => {
        // Include responses without week prefix (likely from initial survey)
        if (!key.includes('week-') && key.includes('q')) {
          filteredResponses[key] = surveyResponses[key];
        }
      });
    } else if (timeFilter.startsWith('week')) {
      // Extract week number
      const weekNum = parseInt(timeFilter.replace('week', ''));
      
      // Include responses for this specific week
      Object.keys(surveyResponses).forEach(key => {
        if (key.includes(`week-${weekNum}`) || key.includes(`weekly-${weekNum}`)) {
          filteredResponses[key] = surveyResponses[key];
        }
      });
    } else {
      // 'all' - include all responses
      Object.assign(filteredResponses, surveyResponses);
    }
    
    // Count Mama and Papa responses
    let mamaCount = 0;
    let papaCount = 0;
    
    Object.values(filteredResponses).forEach(value => {
      if (value === 'Mama') {
        mamaCount++;
      } else if (value === 'Papa') {
        papaCount++;
      }
    });
    
    const total = mamaCount + papaCount;
    
    // If no data for the selected period, return default values that make sense
    if (total === 0) {
      if (timeFilter === 'initial') {
        // Default initial data - showing greater imbalance
        return { mama: 70, papa: 30 };
      } else if (timeFilter.startsWith('week')) {
        const weekNum = parseInt(timeFilter.replace('week', ''));
        // Show gradually improving balance for later weeks
        return { mama: Math.max(50, 70 - (weekNum * 5)), papa: Math.min(50, 30 + (weekNum * 5)) };
      }
      return { mama: 65, papa: 35 };
    }
    
    // Calculate percentages
    return {
      mama: Math.round((mamaCount / total) * 100),
      papa: Math.round((papaCount / total) * 100)
    };
  };
  
  // Get balance history data
  const calculateBalanceHistory = () => {
    console.log("Calculating balance history from survey data");
    
    const history = [];
    
    // Add initial survey data point
    let initialMama = 0;
    let initialPapa = 0;
    let initialTotal = 0;
    
    // Count responses from initial survey
    Object.keys(surveyResponses).forEach(key => {
      // Include responses without week prefix (likely from initial survey)
      if (!key.includes('week-') && key.includes('q')) {
        const value = surveyResponses[key];
        if (value === 'Mama') initialMama++;
        else if (value === 'Papa') initialPapa++;
        initialTotal++;
      }
    });
    
    // Add initial survey data point
    if (initialTotal > 0) {
      history.push({
        week: 'Initial',
        mama: Math.round((initialMama / initialTotal) * 100),
        papa: Math.round((initialPapa / initialTotal) * 100)
      });
    } else {
      // Default initial data if no data available
      history.push({ week: 'Initial', mama: 70, papa: 30 });
    }
    
    // Add data points for each completed week
    completedWeeks.forEach(weekNum => {
      let weekMama = 0;
      let weekPapa = 0;
      let weekTotal = 0;
      
      // Count responses for this week
      Object.keys(surveyResponses).forEach(key => {
        if (key.includes(`week-${weekNum}`) || key.includes(`weekly-${weekNum}`)) {
          const value = surveyResponses[key];
          if (value === 'Mama') weekMama++;
          else if (value === 'Papa') weekPapa++;
          weekTotal++;
        }
      });
      
      // Add week data point
      if (weekTotal > 0) {
        history.push({
          week: `Week ${weekNum}`,
          mama: Math.round((weekMama / weekTotal) * 100),
          papa: Math.round((weekPapa / weekTotal) * 100)
        });
      } else {
        // Generate sample data showing improvement if no actual data
const previousWeek = history[history.length - 1];

// Calculate a more gradual and realistic change
const imbalance = Math.abs(previousWeek.mama - 50);
const adjustmentStep = Math.max(2, Math.min(5, Math.ceil(imbalance / 10)));

// Determine direction of adjustment
if (previousWeek.mama > 50) {
  // Mama has more tasks, so reduce mama's percentage
  const mamaPct = previousWeek.mama - adjustmentStep;
  const papaPct = 100 - mamaPct;
  history.push({
    week: `Week ${weekNum}`,
    mama: mamaPct,
    papa: papaPct
  });
} else if (previousWeek.mama < 50) {
  // Papa has more tasks, so increase mama's percentage
  const mamaPct = previousWeek.mama + adjustmentStep;
  const papaPct = 100 - mamaPct;
  history.push({
    week: `Week ${weekNum}`,
    mama: mamaPct,
    papa: papaPct
  });
} else {
  // Already at 50/50, add small fluctuation for realism
  const fluctuation = Math.floor(Math.random() * 5) - 2; // -2 to +2
  const mamaPct = 50 + fluctuation;
  const papaPct = 100 - mamaPct;
  history.push({
    week: `Week ${weekNum}`,
    mama: mamaPct,
    papa: papaPct
  });
}
      }
    });
    
    // Add current week if it's not in completed weeks
    if (!completedWeeks.includes(currentWeek) && currentWeek > 1) {
      // Just duplicate the last data point for now
      const lastPoint = history[history.length - 1];
      
      history.push({
        week: `Week ${currentWeek}`,
        mama: lastPoint.mama,
        papa: lastPoint.papa
      });
    }
    
    return history;
  };
  
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
    
    // Add insight about invisible work if there's a notable difference
    const visibleAvg = (
      (categoryData.find(d => d.category === "Visible Household")?.mama || 0) +
      (categoryData.find(d => d.category === "Visible Parental")?.mama || 0)
    ) / 2;
    
    const invisibleAvg = (
      (categoryData.find(d => d.category === "Invisible Household")?.mama || 0) +
      (categoryData.find(d => d.category === "Invisible Parental")?.mama || 0)
    ) / 2;
    
    if (Math.abs(invisibleAvg - visibleAvg) > 10) {
      insights.push({
        type: 'insight',
        title: 'Invisible Work Insight',
        description: `Mama is handling ${Math.round(invisibleAvg)}% of invisible tasks vs ${Math.round(visibleAvg)}% of visible tasks.`,
        icon: <Activity size={20} className="text-purple-600" />
      });
    }
    
    // Add family harmony insight
    if (balance.mama <= 55 && balance.papa >= 45) {
      insights.push({
        type: 'harmony',
        title: 'Family Harmony Boost',
        description: 'Your balanced workload helps reduce stress and creates more quality family time.',
        icon: <Heart size={20} className="text-red-600" />
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
  
  // Historical data for line chart - filtered by time period
  const balanceHistory = filterDataByTime(calculateBalanceHistory() || []);
  
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
                    : timeFilter.startsWith('week')
                      ? `Week ${timeFilter.replace('week', '')} distribution of parental responsibilities`
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
                        insight.type === 'harmony' ? 'border-red-200 bg-red-50' :
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
      
      {/* Family Journey Dashboard */}
<div className="bg-white rounded-lg shadow">
  <div 
    className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
    onClick={() => toggleSection('familyJourney')}
  >
    <h3 className="text-lg font-semibold">Family Balance Journey</h3>
    {expandedSections.familyJourney ? (
      <ChevronUp size={20} className="text-gray-500" />
    ) : (
      <ChevronDown size={20} className="text-gray-500" />
    )}
  </div>
  
  {expandedSections.familyJourney && (
    <div className="p-6 pt-0">
      <FamilyJourneyChart />
    </div>
  )}
</div>



      {/* Fun Data Visualizations */}
      <div className="bg-white rounded-lg shadow">
        <div 
          className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('familyProgress')}
        >
          <h3 className="text-lg font-semibold">Fun Family Progress Visualizations</h3>
          {expandedSections.familyProgress ? (
            <ChevronUp size={20} className="text-gray-500" />
          ) : (
            <ChevronDown size={20} className="text-gray-500" />
          )}
        </div>
        
        {expandedSections.familyProgress && (
          <div className="p-6 pt-0">
            <p className="text-sm text-gray-600 mb-4">
              Track your family's journey to better balance with these fun visualizations!
            </p>
            
            {/* For Kids: Balance Scale Visualization */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-blue-800 mb-3">Family Balance Scale</h4>
              <p className="text-sm text-blue-700 mb-4">
                When work is shared fairly, the scale stays balanced. This shows who's doing more right now!
              </p>
              
              <div className="h-36 relative mb-4">
                {/* The Balance Scale */}
                <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 w-4 h-24 bg-gray-700 rounded"></div>
                
                {/* The Balance Beam - rotated based on current balance */}
                <div 
                  className="absolute left-1/2 top-8 transform -translate-x-1/2 w-64 h-4 bg-gray-700 rounded transition-transform duration-700 ease-in-out"
                  style={{ 
                    transformOrigin: 'center',
                    transform: `translateX(-50%) rotate(${(currentBalance.mama - 50) * 0.8}deg)` 
                  }}
                >
                  {/* Mama's Side */}
                  <div className="absolute left-0 -top-20 w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center transform -translate-x-1/2">
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-800">{currentBalance.mama}%</div>
                      <div className="text-xs text-purple-700">Mama</div>
                    </div>
                  </div>
                  
                  {/* Papa's Side */}
                  <div className="absolute right-0 -top-20 w-16 h-16 bg-green-200 rounded-full flex items-center justify-center transform translate-x-1/2">
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-800">{currentBalance.papa}%</div>
                      <div className="text-xs text-green-700">Papa</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-center text-blue-700">
                {currentBalance.mama > 60 
                  ? "The scale is tipping toward Mama! Papa can help balance it by taking on more tasks."
                  : currentBalance.mama < 40
                    ? "The scale is tipping toward Papa! Mama can help balance it by taking on more tasks."
                    : "Great job! Your family's workload is well balanced."}
              </p>
            </div>
            
            {/* For Adults: Task Type Distribution */}
            <div className="bg-purple-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-purple-800 mb-3">Task Type Distribution</h4>
              <p className="text-sm text-purple-700 mb-4">
                This visualization shows how visible vs. invisible work is distributed in your family.
              </p>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: 'Visible Tasks',
                        mama: (getRadarData(radarFilter).find(d => d.category === "Visible Household")?.mama || 0) +
                               (getRadarData(radarFilter).find(d => d.category === "Visible Parental")?.mama || 0) / 2,
                        papa: (getRadarData(radarFilter).find(d => d.category === "Visible Household")?.papa || 0) +
                               (getRadarData(radarFilter).find(d => d.category === "Visible Parental")?.papa || 0) / 2
                      },
                      {
                        name: 'Invisible Tasks',
                        mama: (getRadarData(radarFilter).find(d => d.category === "Invisible Household")?.mama || 0) +
                               (getRadarData(radarFilter).find(d => d.category === "Invisible Parental")?.mama || 0) / 2,
                        papa: (getRadarData(radarFilter).find(d => d.category === "Invisible Household")?.papa || 0) +
                               (getRadarData(radarFilter).find(d => d.category === "Invisible Parental")?.papa || 0) / 2
                      }
                    ]}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="mama" name="Mama's Tasks" stackId="a" fill={MAMA_COLOR} />
                    <Bar dataKey="papa" name="Papa's Tasks" stackId="a" fill={PAPA_COLOR} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 text-sm text-center text-purple-700">
                <strong>Tip:</strong> Invisible tasks like planning, scheduling, and emotional support often go unnoticed
                but take significant mental energy. Balancing these is key to family harmony!
              </div>
            </div>
            
            {/* For Everyone: Family Balance Journey */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-3">Your Family's Balance Journey</h4>
              <p className="text-sm text-green-700 mb-4">
                Watch your progress week by week as your family works together for better balance!
              </p>
              
              <div className="relative pt-10 pb-16">
                {/* The Journey Path */}
                <div className="absolute left-0 right-0 top-1/2 h-2 bg-gray-300 rounded"></div>
                
                {/* Journey Points */}
                {balanceHistory.map((point, index) => {
                  const position = (index / (balanceHistory.length - 1 || 1)) * 100;
                  
                  return (
                    <div 
                      key={point.week} 
                      className="absolute transform -translate-y-1/2"
                      style={{ left: `${position}%`, top: '50%' }}
                    >
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          point.week === 'Initial' ? 'bg-blue-500' :
                          point.mama > 65 ? 'bg-red-500' :
                          point.mama > 55 ? 'bg-amber-500' :
                          'bg-green-500'
                        }`}
                      >
                        {point.week === 'Initial' ? 'S' : index}
                      </div>
                      
                      <div className="text-center mt-2">
                        <div className="text-xs font-medium">{point.week}</div>
                        <div className={`text-xs ${
                          point.mama > 65 ? 'text-red-600' :
                          point.mama > 55 ? 'text-amber-600' :
                          'text-green-600'
                        }`}>
                          {point.mama}% / {point.papa}%
                        </div>
                      </div>
                      
                      {/* Balance Indicator */}
                      <div 
                        className={`absolute -top-14 left-0 transform -translate-x-1/2 text-center ${
                          point.mama > 65 ? 'text-red-600' :
                          point.mama > 55 ? 'text-amber-600' :
                          'text-green-600'
                        }`}
                      >
                        {point.mama > 65 ? '😫' :
                         point.mama > 55 ? '🙂' :
                         '😀'}
                        <br />
                        <span className="text-xs">
                          {point.mama > 65 ? 'Unbalanced' :
                           point.mama > 55 ? 'Getting Better' :
                           'Balanced!'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 text-sm text-center text-green-700">
                {balanceHistory.length > 1 && balanceHistory[balanceHistory.length - 1].mama < balanceHistory[0].mama ? (
                  <p><strong>Great progress!</strong> Your family is moving toward better balance week by week.</p>
                ) : balanceHistory.length > 1 ? (
                  <p><strong>Keep going!</strong> Creating better balance takes time and consistent effort.</p>
                ) : (
                  <p><strong>Just starting!</strong> Complete weekly check-ins to track your family's balance journey.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardTab;