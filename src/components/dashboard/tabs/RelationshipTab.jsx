// src/components/dashboard/tabs/RelationshipTab.jsx
import React, { useState, useEffect } from 'react';
import { 
  Heart, Users, Calendar, BarChart, MessageCircle, 
  AlertTriangle, CheckCircle, Plus
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useFamily } from '../../../hooks/useFamily';

const RelationshipTab = () => {
  const navigate = useNavigate();
  const { 
    familyData,
    familyMembers,
    currentWeek,
    coupleCheckInData,
    saveCoupleCheckInData,
    getCoupleCheckInData,
    getRelationshipTrendData
  } = useFamily();
  
  const [weeklyData, setWeeklyData] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [showStartCheckIn, setShowStartCheckIn] = useState(false);

  // States for the couple check-in form
  const [checkInResponses, setCheckInResponses] = useState({
    satisfaction: 5,
    communication: 5,
    balance: 5,
    stressLevel: 5,
    appreciationLevel: 5
  });
  const [feedback, setFeedback] = useState('');

  // Load data on component mount
  useEffect(() => {
    // Get data for current week
    const currentWeekData = getCoupleCheckInData(currentWeek);
    setWeeklyData(currentWeekData);
    
    // Get trend data
    const relationshipTrends = getRelationshipTrendData();
    setTrendData(relationshipTrends);
    
    // Show start button if no data for current week
    setShowStartCheckIn(!currentWeekData);
  }, [currentWeek, getCoupleCheckInData, getRelationshipTrendData]);

  // Handle check-in form submission
  const handleSubmitCheckIn = async (e) => {
    e.preventDefault();
    
    try {
      // Create check-in data object
      const checkInData = {
        timestamp: new Date().toISOString(),
        responses: {
          ...checkInResponses,
          feedback
        }
      };
      
      // Save to database
      await saveCoupleCheckInData(currentWeek, checkInData);
      
      // Update local state
      setWeeklyData(checkInData);
      setShowStartCheckIn(false);
      
      // Update trend data
      const updatedTrends = getRelationshipTrendData();
      setTrendData(updatedTrends);
    } catch (error) {
      console.error("Error saving couple check-in:", error);
    }
  };

  // Get color based on score
  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-600";
    if (score >= 5) return "text-blue-600";
    return "text-red-600";
  };

  // Find the parent members
  const parents = familyMembers.filter(member => member.role === 'parent');

  // Calculate average scores
  const calculateAverages = () => {
    if (!trendData || trendData.length === 0) {
      return {
        satisfaction: 0,
        communication: 0,
        workloadBalance: 0
      };
    }
    
    const latest = trendData[trendData.length - 1];
    return {
      satisfaction: latest.satisfaction || 0,
      communication: latest.communication || 0,
      workloadBalance: latest.workloadBalance || 0
    };
  };

  const averages = calculateAverages();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center mb-4">
          <Heart className="text-red-500 mr-2" size={20} />
          <h2 className="text-lg font-semibold">Relationship Health</h2>
        </div>
        
        <p className="text-gray-600 mb-4">
          Research shows that workload imbalance is one of the top predictors of relationship
          dissatisfaction. This tab helps you track how your efforts to balance responsibilities
          impact your relationship.
        </p>
        
        {/* Score overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <h3 className="text-sm font-medium mb-2">Relationship Satisfaction</h3>
            <div className={`text-2xl font-bold ${getScoreColor(averages.satisfaction)}`}>
              {averages.satisfaction.toFixed(1)}/10
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <h3 className="text-sm font-medium mb-2">Communication Quality</h3>
            <div className={`text-2xl font-bold ${getScoreColor(averages.communication)}`}>
              {averages.communication.toFixed(1)}/10
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <h3 className="text-sm font-medium mb-2">Workload Balance</h3>
            <div className={`text-2xl font-bold ${getScoreColor(averages.workloadBalance)}`}>
              {averages.workloadBalance.toFixed(1)}/10
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-center">
          {showStartCheckIn ? (
            <button 
              className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center hover:bg-red-600"
              onClick={() => setShowStartCheckIn(true)}
            >
              <Heart size={16} className="mr-2" />
              Start Couple Check-in
            </button>
          ) : (
            <button 
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg flex items-center hover:bg-gray-200"
              onClick={() => navigate('/relationship-meeting')}
            >
              <Users size={16} className="mr-2" />
              Schedule Relationship Meeting
            </button>
          )}
        </div>
      </div>
      
      {/* Trend Chart */}
      {trendData.length > 1 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center mb-4">
            <BarChart className="text-blue-500 mr-2" size={20} />
            <h2 className="text-lg font-semibold">Relationship Trends</h2>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="satisfaction" 
                  stroke="#ef4444" 
                  activeDot={{ r: 8 }} 
                  name="Satisfaction"
                />
                <Line 
                  type="monotone" 
                  dataKey="communication" 
                  stroke="#3b82f6" 
                  name="Communication"
                />
                <Line 
                  type="monotone" 
                  dataKey="workloadBalance" 
                  stroke="#10b981" 
                  name="Workload Balance"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {/* Couple Check-in Form */}
      {showStartCheckIn && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center mb-4">
            <Heart className="text-red-500 mr-2" size={20} />
            <h2 className="text-lg font-semibold">Week {currentWeek} Couple Check-in</h2>
          </div>
          
          <form onSubmit={handleSubmitCheckIn}>
            <div className="space-y-4 mb-6">
              {/* Satisfaction */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Overall relationship satisfaction this week (1-10):
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={checkInResponses.satisfaction}
                  onChange={(e) => setCheckInResponses({
                    ...checkInResponses,
                    satisfaction: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 (Poor)</span>
                  <span>5 (Average)</span>
                  <span>10 (Excellent)</span>
                </div>
              </div>
              
              {/* Communication */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Communication quality this week (1-10):
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={checkInResponses.communication}
                  onChange={(e) => setCheckInResponses({
                    ...checkInResponses,
                    communication: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 (Poor)</span>
                  <span>5 (Average)</span>
                  <span>10 (Excellent)</span>
                </div>
              </div>
              
              {/* Workload Balance */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Satisfaction with workload balance this week (1-10):
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={checkInResponses.balance}
                  onChange={(e) => setCheckInResponses({
                    ...checkInResponses,
                    balance: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 (Very Unbalanced)</span>
                  <span>5 (Somewhat Balanced)</span>
                  <span>10 (Well Balanced)</span>
                </div>
              </div>
              
              {/* Stress Level */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Stress level this week (1-10):
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={checkInResponses.stressLevel}
                  onChange={(e) => setCheckInResponses({
                    ...checkInResponses,
                    stressLevel: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 (Very High)</span>
                  <span>5 (Moderate)</span>
                  <span>10 (Very Low)</span>
                </div>
              </div>
              
              {/* Appreciation */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Feeling appreciated this week (1-10):
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={checkInResponses.appreciationLevel}
                  onChange={(e) => setCheckInResponses({
                    ...checkInResponses,
                    appreciationLevel: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 (Not at all)</span>
                  <span>5 (Somewhat)</span>
                  <span>10 (Very much)</span>
                </div>
              </div>
              
              {/* Feedback */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Any feedback or reflections on this week:
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={3}
                  placeholder="Share your thoughts about your relationship this week..."
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Submit Check-in
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Meeting Schedule */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center mb-4">
          <Calendar className="text-blue-500 mr-2" size={20} />
          <h2 className="text-lg font-semibold">Couple Meeting Schedule</h2>
        </div>
        
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Weekly Check-in</h3>
                <p className="text-sm text-gray-600">
                  Quick 5-minute assessment of relationship health
                </p>
              </div>
              <div className="flex items-center">
                {weeklyData ? (
                  <span className="text-green-600 text-sm flex items-center">
                    <CheckCircle size={14} className="mr-1" />
                    Completed
                  </span>
                ) : (
                  <span className="text-amber-600 text-sm flex items-center">
                    <AlertTriangle size={14} className="mr-1" />
                    Due
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Monthly Relationship Meeting</h3>
                <p className="text-sm text-gray-600">
                  30-minute guided conversation to strengthen connection
                </p>
              </div>
              <button className="text-blue-600 text-sm flex items-center">
                <Plus size={14} className="mr-1" />
                Schedule
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Resources */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center mb-4">
          <MessageCircle className="text-blue-500 mr-2" size={20} />
          <h2 className="text-lg font-semibold">Relationship Resources</h2>
        </div>
        
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="font-medium text-blue-800">Communication Techniques</h3>
            <p className="text-sm text-blue-700 mt-1">
              Learn effective ways to discuss workload and responsibilities without conflict.
            </p>
            <button className="mt-2 text-sm text-blue-600">Learn More</button>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg border border-green-100">
            <h3 className="font-medium text-green-800">Appreciation Practices</h3>
            <p className="text-sm text-green-700 mt-1">
              Simple daily rituals to increase feelings of being valued and recognized.
            </p>
            <button className="mt-2 text-sm text-green-600">Learn More</button>
          </div>
          
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
            <h3 className="font-medium text-purple-800">Connection Exercises</h3>
            <p className="text-sm text-purple-700 mt-1">
              Quick activities to strengthen your bond even during busy parenting periods.
            </p>
            <button className="mt-2 text-sm text-purple-600">Learn More</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelationshipTab;