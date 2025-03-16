// src/components/dashboard/tabs/FamilyOverviewTab.jsx
import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Brain, Award, Info, ArrowRight, Users } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { useFamily } from '../../../hooks/useFamily';
import ResearchInsightsCard from '../ResearchInsightsCard';

const FamilyOverviewTab = ({ familyData, familyMembers, tasks }) => {
  // Simple, focused state
  const [timeFilter, setTimeFilter] = useState('all');
  const [expandedSections, setExpandedSections] = useState({
    balance: true,
    insights: true,
    categories: true
  });
  
  // Colors for charts
  const MAMA_COLOR = '#8884d8';
  const PAPA_COLOR = '#82ca9d';
  
  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Current balance calculation with simplified logic
  const getCurrentBalance = () => {
    // Default values if data isn't available
    const defaultBalance = { mama: 50, papa: 50 };
    
    if (!familyData) return defaultBalance;
    
    // If we have history data for the current week, use that
    const currentWeek = familyData.currentWeek || 1;
    
    if (familyData.weekHistory && familyData.weekHistory[`week${currentWeek}`]?.balance) {
      return {
        mama: Math.round(familyData.weekHistory[`week${currentWeek}`].balance.mama),
        papa: Math.round(familyData.weekHistory[`week${currentWeek}`].balance.papa)
      };
    }
    
    // If we have overall balance data directly on family data, use that
    if (familyData.balance) {
      return {
        mama: Math.round(familyData.balance.mama),
        papa: Math.round(familyData.balance.papa)
      };
    }
    
    return defaultBalance;
  };
  
  // Category data for radar chart
  const getCategoryData = () => {
    // Default categories with balanced values
    const defaultCategories = [
      { category: "Visible Household", mama: 50, papa: 50 },
      { category: "Invisible Household", mama: 50, papa: 50 },
      { category: "Visible Parental", mama: 50, papa: 50 },
      { category: "Invisible Parental", mama: 50, papa: 50 }
    ];
    
    if (!familyData) return defaultCategories;
    
    // If we have category balance data, use that
    const currentWeek = familyData.currentWeek || 1;
    
    if (familyData.weekHistory && familyData.weekHistory[`week${currentWeek}`]?.categoryBalance) {
      const categoryBalance = familyData.weekHistory[`week${currentWeek}`].categoryBalance;
      
      return Object.entries(categoryBalance).map(([category, data]) => ({
        category: category.replace(" Tasks", ""),
        mama: Math.round(data.mama),
        papa: Math.round(data.papa)
      }));
    }
    
    // Use default demo data if no real data available
    return defaultCategories;
  };
  
  // Generate key insights based on data
  const getKeyInsights = () => {
    if (!familyData) {
      return [
        {
          type: 'waiting',
          title: 'Waiting for Survey Data',
          description: 'Complete the initial survey and weekly check-ins to generate insights.',
          icon: <Info size={20} className="text-blue-600" />
        }
      ];
    }
    
    const insights = [];
    const balance = getCurrentBalance();
    const categoryData = getCategoryData();
    
    // Find the most imbalanced category
    const mostImbalancedCategory = [...categoryData].sort((a, b) => 
      Math.abs(b.mama - b.papa) - Math.abs(a.mama - a.papa)
    )[0];
    
    // Add challenge insight based on category balance
    if (mostImbalancedCategory && Math.abs(mostImbalancedCategory.mama - mostImbalancedCategory.papa) > 20) {
      insights.push({
        type: 'challenge',
        title: `${mostImbalancedCategory.category} Needs Focus`,
        description: `${mostImbalancedCategory.category} tasks show the biggest imbalance (${mostImbalancedCategory.mama}% vs ${mostImbalancedCategory.papa}%).`,
        icon: <AlertTriangle size={20} className="text-amber-600" />
      });
    }
    
    // Add progress insight if we have completed tasks
    if (tasks && tasks.filter(t => t.completed).length > 0) {
      insights.push({
        type: 'progress',
        title: 'Task Completion',
        description: `Your family has completed ${tasks.filter(t => t.completed).length} of ${tasks.length} assigned tasks.`,
        icon: <CheckCircle size={20} className="text-green-600" />
      });
    }
    
    // Add insight about balance improvement if we're in a good state
    if (Math.abs(balance.mama - 50) < 15) {
      insights.push({
        type: 'harmony',
        title: 'Family Harmony Boost',
        description: 'Your balanced workload helps reduce stress and creates more quality family time.',
        icon: <Users size={20} className="text-purple-600" />
      });
    }
    
    // Add AI insight (placeholder for real AI in phase 4)
    insights.push({
      type: 'insight',
      title: 'AI Recommendation',
      description: 'Based on your family data, focus on invisible tasks this week for better balance.',
      icon: <Brain size={20} className="text-blue-600" />
    });
    
    return insights.slice(0, 3); // Just return top 3 insights
  };
  
  const currentBalance = getCurrentBalance();
  const categoryData = getCategoryData();
  
  // Loading state
  if (!familyData) {
    return <div className="p-6 text-center">Loading family data...</div>;
  }
  
  return (
    <div className="space-y-6">
      {/* Family Dashboard Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-2">Family Dashboard</h2>
        <p className="text-gray-600">
          Week {familyData.currentWeek || 1} of your balance journey
        </p>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-xl font-bold text-blue-700">
              {familyData.currentWeek || 1}
            </div>
            <div className="text-sm text-blue-600">Current Week</div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-xl font-bold text-green-700">
              {tasks ? tasks.filter(t => t.completed).length : 0}
            </div>
            <div className="text-sm text-green-600">Tasks Completed</div>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <div className="text-xl font-bold text-purple-700">
              {familyData.completedWeeks?.length || 0}
            </div>
            <div className="text-sm text-purple-600">Weeks Completed</div>
          </div>
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
            <span className="text-gray-500">▲</span>
          ) : (
            <span className="text-gray-500">▼</span>
          )}
        </div>
        
        {expandedSections.balance && (
          <div className="p-6 pt-0">
            <p className="text-sm text-gray-600 mb-3">
              Current distribution of parental responsibilities
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
                <PieChart>
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
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
      
      {/* Task Category Distribution */}
      <div className="bg-white rounded-lg shadow">
        <div 
          className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('categories')}
        >
          <h3 className="text-lg font-semibold">Task Category Distribution</h3>
          {expandedSections.categories ? (
            <span className="text-gray-500">▲</span>
          ) : (
            <span className="text-gray-500">▼</span>
          )}
        </div>
        
        {expandedSections.categories && (
          <div className="p-6 pt-0">
            <p className="text-sm text-gray-600 mb-4">
              Distribution of responsibilities across the four task categories
            </p>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius="80%" data={categoryData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <Tooltip />
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
            <span className="text-gray-500">▲</span>
          ) : (
            <span className="text-gray-500">▼</span>
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
                    insight.type === 'harmony' ? 'border-purple-200 bg-purple-50' :
                    'border-gray-200 bg-gray-50'
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
      {/* Research Insights */}
{/* Data Interpretation Section */}
<div className="bg-white rounded-lg shadow p-6">
  <h3 className="text-lg font-medium mb-4">How Allie Uses Your Data</h3>
  
  <div className="bg-white rounded-lg p-4 mb-4 border border-black">
    <h4 className="font-medium text-lg mb-2">Allie Task Weighting System</h4>
    <p className="text-sm mb-3">
      Our proprietary task weighting system goes beyond simple counting to analyze the true impact of different tasks:
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex items-start">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
          <Clock size={16} className="text-blue-600" />
        </div>
        <div>
          <h5 className="font-medium text-sm">Time & Frequency</h5>
          <p className="text-xs text-gray-600">Tasks done daily or requiring significant time receive higher weight</p>
        </div>
      </div>
      
      <div className="flex items-start">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
          <Brain size={16} className="text-purple-600" />
        </div>
        <div>
          <h5 className="font-medium text-sm">Invisibility Factor</h5>
          <p className="text-xs text-gray-600">Mental load from tasks that go unnoticed receives higher weight</p>
        </div>
      </div>
      
      <div className="flex items-start">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-2">
          <Heart size={16} className="text-red-600" />
        </div>
        <div>
          <h5 className="font-medium text-sm">Emotional Labor</h5>
          <p className="text-xs text-gray-600">Tasks requiring emotional energy are weighted more heavily</p>
        </div>
      </div>
      
      <div className="flex items-start">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
          <Users size={16} className="text-green-600" />
        </div>
        <div>
          <h5 className="font-medium text-sm">Child Development Impact</h5>
          <p className="text-xs text-gray-600">Tasks that influence how children view gender roles receive higher weight</p>
        </div>
      </div>
    </div>
  </div>
</div>
<ResearchInsightsCard />
    </div>
  );
};

export default FamilyOverviewTab;