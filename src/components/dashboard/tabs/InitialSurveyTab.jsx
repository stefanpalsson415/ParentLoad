// src/components/dashboard/tabs/InitialSurveyTab.jsx
import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, BarChart3, Scale, Search, 
  SlidersHorizontal, ChevronDown, ChevronUp
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useFamily } from '../../../hooks/useFamily';
import { useSurvey } from '../../../hooks/useSurvey';

const InitialSurveyTab = () => {
  const { 
    familyData,
    familyMembers,
    surveyResponses,
    weekHistory
  } = useFamily();
  
  const {
    fullQuestionSet,
    calculateBalance,
    getQuestionsByCategory,
    getHighImpactQuestions
  } = useSurvey();
  
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showWeights, setShowWeights] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [balanceData, setBalanceData] = useState({
    overallBalance: { mama: 50, papa: 50 },
    categoryBalance: {}
  });
  
  const categories = [
    "Visible Household Tasks",
    "Invisible Household Tasks",
    "Visible Parental Tasks",
    "Invisible Parental Tasks"
  ];

  // Load initial survey results on component mount
  useEffect(() => {
    if (fullQuestionSet && Object.keys(surveyResponses).length > 0) {
      // If we have direct history data, use that
      if (weekHistory && weekHistory.initial) {
        setBalanceData({
          overallBalance: weekHistory.initial.balance || { mama: 50, papa: 50 },
          categoryBalance: weekHistory.initial.categoryBalance || {}
        });
      } 
      // Otherwise calculate balance
      else {
        // Get family priorities for calculation
        const familyPriorities = familyData?.priorities || {
          highestPriority: "Invisible Parental Tasks",
          secondaryPriority: "Visible Parental Tasks",
          tertiaryPriority: "Invisible Household Tasks"
        };
        
        // Calculate balance scores
        const balanceScores = calculateBalance();
        setBalanceData(balanceScores || {
          overallBalance: { mama: 50, papa: 50 },
          categoryBalance: {}
        });
      }
    }
  }, [fullQuestionSet, surveyResponses, weekHistory, familyData, calculateBalance]);

  // Toggle expanded state for a question
  const toggleQuestionExpanded = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Filter and search questions
  const getFilteredQuestions = () => {
    // Start with all questions or category-specific questions
    let filteredQuestions = categoryFilter === 'all' 
      ? fullQuestionSet
      : getQuestionsByCategory(categoryFilter);
    
    // Apply search filter if search term exists
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filteredQuestions = filteredQuestions.filter(question => 
        question.text.toLowerCase().includes(searchLower) ||
        question.category.toLowerCase().includes(searchLower)
      );
    }
    
    return filteredQuestions;
  };

  // Get color for balance visualization
  const getBalanceColor = (value) => {
    const imbalance = Math.abs(value - 50);
    if (imbalance < 10) return "#4ade80"; // Green for good balance
    if (imbalance < 20) return "#facc15"; // Yellow for moderate imbalance
    return "#ef4444"; // Red for significant imbalance
  };

  // Prepare chart data
  const prepareCategoryChartData = () => {
    return categories.map(category => {
      const categoryData = balanceData.categoryBalance[category] || { mama: 50, papa: 50 };
      return {
        category: category.replace(' Tasks', ''),
        mama: Math.round(categoryData.mama || 50),
        papa: Math.round(categoryData.papa || 50),
        imbalance: Math.round(Math.abs((categoryData.mama || 50) - (categoryData.papa || 50)))
      };
    });
  };

  const chartData = prepareCategoryChartData();
  const COLORS = ['#8884d8', '#82ca9d'];

  // Get weight impact text
  const getWeightImpactText = (weight) => {
    const numWeight = parseFloat(weight);
    if (numWeight >= 12) return "Very High";
    if (numWeight >= 9) return "High";
    if (numWeight >= 6) return "Medium";
    return "Standard";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center mb-4">
          <ClipboardList className="text-blue-500 mr-2" size={20} />
          <h2 className="text-lg font-semibold">Initial Survey Analysis</h2>
        </div>
        
        <p className="text-gray-600 mb-4">
          These results represent your family's baseline balance from the initial assessment.
          This provides the starting point for measuring your progress over time.
        </p>
      </div>
      
      {/* Balance Overview */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center mb-4">
          <BarChart3 className="text-blue-500 mr-2" size={20} />
          <h2 className="text-lg font-semibold">Overall Balance</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Overall Balance Pie Chart */}
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-center font-medium mb-4">All Tasks</h3>
            <div className="h-40 w-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Mama', value: Math.round(balanceData.overallBalance?.mama || 50) },
                      { name: 'Papa', value: Math.round(balanceData.overallBalance?.papa || 50) }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell key="mama" fill="#8884d8" />
                    <Cell key="papa" fill="#82ca9d" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-center mt-2 space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 mr-1"></div>
                <span className="text-xs">
                  Mama: {Math.round(balanceData.overallBalance?.mama || 50)}%
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 mr-1"></div>
                <span className="text-xs">
                  Papa: {Math.round(balanceData.overallBalance?.papa || 50)}%
                </span>
              </div>
            </div>
            
            {/* Assessment of balance */}
            <div className={`mt-4 text-center px-3 py-1 rounded-full text-xs ${
              Math.abs((balanceData.overallBalance?.mama || 50) - 50) < 10
                ? 'bg-green-50 text-green-600'
                : Math.abs((balanceData.overallBalance?.mama || 50) - 50) < 20
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-red-50 text-red-600'
            }`}>
              {Math.abs((balanceData.overallBalance?.mama || 50) - 50) < 10
                ? 'Well Balanced'
                : Math.abs((balanceData.overallBalance?.mama || 50) - 50) < 20
                  ? 'Slight Imbalance'
                  : 'Significant Imbalance'}
            </div>
          </div>
          
          {/* Category Balance Bar Chart */}
          <div className="col-span-2 flex flex-col">
            <h3 className="font-medium mb-4">Category Breakdown</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={250}>
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
          </div>
        </div>
      </div>
      
      {/* Questions List */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center mb-4">
          <Scale className="text-blue-500 mr-2" size={20} />
          <h2 className="text-lg font-semibold">Survey Questions & Responses</h2>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Search 
                size={18} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={() => setShowWeights(!showWeights)}
              className={`flex items-center px-4 py-2 border rounded-md ${
                showWeights ? 'bg-blue-50 text-blue-600 border-blue-200' : ''
              }`}
            >
              <SlidersHorizontal size={16} className="mr-2" />
              {showWeights ? 'Hide Weights' : 'Show Weights'}
            </button>
          </div>
        </div>
        
        {/* Questions */}
        <div className="space-y-4">
          {getFilteredQuestions().map(question => {
            const response = surveyResponses[question.id];
            return (
              <div 
                key={question.id} 
                className="border rounded-lg overflow-hidden"
              >
                <div 
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    expandedQuestions[question.id] ? 'border-b' : ''
                  }`}
                  onClick={() => toggleQuestionExpanded(question.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{question.text}</h3>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <span>{question.category}</span>
                        {showWeights && question.totalWeight && (
                          <span className="ml-3 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">
                            Weight: {question.totalWeight}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center ml-4">
                      {response && (
                        <span className={`px-3 py-1 rounded-full text-sm mr-3 ${
                          response === 'Mama' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {response}
                        </span>
                      )}
                      
                      {expandedQuestions[question.id] ? (
                        <ChevronUp size={20} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Expanded details */}
                {expandedQuestions[question.id] && (
                  <div className="p-4 bg-gray-50">
                    {/* Response Details */}
                    <div className="mb-4">
                      <h4 className="font-medium text-sm mb-2">Response:</h4>
                      {response ? (
                        <div className="p-3 bg-white rounded border">
                          <span className="font-medium">{response}</span>
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-50 rounded border border-amber-200 text-amber-800">
                          No response recorded
                        </div>
                      )}
                    </div>
                    
                    {/* Question Info */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Question Information:</h4>
                      <div className="p-3 bg-white rounded border">
                        <p className="text-sm mb-2">{question.explanation}</p>
                        
                        {showWeights && (
                          <>
                            <h5 className="font-medium text-sm mt-3 mb-1">Weight Factors:</h5>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                              <div className="p-1.5 bg-gray-50 rounded">
                                <span className="font-medium">Base Weight:</span> {question.baseWeight}/5
                              </div>
                              <div className="p-1.5 bg-gray-50 rounded">
                                <span className="font-medium">Frequency:</span> {question.frequency}
                              </div>
                              <div className="p-1.5 bg-gray-50 rounded">
                                <span className="font-medium">Invisibility:</span> {question.invisibility}
                              </div>
                              <div className="p-1.5 bg-gray-50 rounded">
                                <span className="font-medium">Emotional Labor:</span> {question.emotionalLabor}
                              </div>
                              <div className="p-1.5 bg-gray-50 rounded">
                                <span className="font-medium">Impact Level:</span> {question.researchImpact}
                              </div>
                              <div className="p-1.5 bg-gray-50 rounded">
                                <span className="font-medium">Total Weight:</span> {question.totalWeight}
                              </div>
                            </div>
                            
                            <p className="text-xs mt-3 text-gray-600">
                              {question.weightExplanation}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InitialSurveyTab;