// src/components/dashboard/tabs/RelationshipTab.jsx
import React, { useState, useEffect } from 'react';
import { 
  Heart, MessageCircle, Calendar, Info, 
  CheckCircle, AlertTriangle, Award
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFamily } from '../../../hooks/useFamily';

const RelationshipTab = ({ familyData }) => {
  // Local state for the couple check-in form
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [checkInResponses, setCheckInResponses] = useState({
    satisfaction: 5,
    communication: 5,
    workloadBalance: 5,
    support: 5,
    stress: 5
  });
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Generate trend data from family data
  const getTrendData = () => {
    if (!familyData) return [];
    
    // Default data for demo purposes
    const demoData = [
      { week: 'Initial', satisfaction: 6.2, communication: 5.8, workloadBalance: 4.2 },
      { week: 'Week 1', satisfaction: 6.5, communication: 6.0, workloadBalance: 4.8 },
      { week: 'Week 2', satisfaction: 6.8, communication: 6.3, workloadBalance: 5.5 },
      { week: 'Week 3', satisfaction: 7.1, communication: 6.6, workloadBalance: 6.0 },
      { week: 'Current', satisfaction: 7.4, communication: 6.9, workloadBalance: 6.5 }
    ];
    
    // If we have real data in family data, use that instead
    if (familyData.relationshipData && Array.isArray(familyData.relationshipData.trends)) {
      return familyData.relationshipData.trends;
    }
    
    return demoData;
  };
  
  // Calculate current scores from trend data
  const getCurrentScores = () => {
    const trends = getTrendData();
    if (trends.length === 0) return { satisfaction: 0, communication: 0, workloadBalance: 0 };
    
    const latest = trends[trends.length - 1];
    return {
      satisfaction: latest.satisfaction || 0,
      communication: latest.communication || 0,
      workloadBalance: latest.workloadBalance || 0
    };
  };
  
  // Get color based on score
  const getScoreColor = (score) => {
    if (score >= 7) return "text-green-600";
    if (score >= 5) return "text-blue-600";
    return "text-red-600";
  };
  
  // Submit check-in form
  const handleSubmitCheckIn = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // In a real implementation, you'd save this to your database
      // await saveRelationshipCheckIn(familyData.id, {
      //   timestamp: new Date().toISOString(),
      //   responses: checkInResponses,
      //   feedback
      // });
      
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Hide the form after submission
      setShowCheckInForm(false);
      setFeedback('');
      
      // Reset to default values for next time
      setCheckInResponses({
        satisfaction: 5,
        communication: 5,
        workloadBalance: 5,
        support: 5,
        stress: 5
      });
    } catch (error) {
      console.error("Error submitting check-in:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const scores = getCurrentScores();
  const trendData = getTrendData();
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-3">
          <Heart className="text-red-500 mr-2" size={20} />
          <h2 className="text-xl font-bold">Relationship Health</h2>
        </div>
        
        <p className="text-gray-600 mb-6">
          Research shows that workload balance directly impacts relationship satisfaction and health.
          Track how your efforts affect your relationship here.
        </p>
        
        {/* Score cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <h3 className="text-sm font-medium mb-2">Relationship Satisfaction</h3>
            <div className={`text-2xl font-bold ${getScoreColor(scores.satisfaction)}`}>
              {scores.satisfaction.toFixed(1)}/10
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <h3 className="text-sm font-medium mb-2">Communication Quality</h3>
            <div className={`text-2xl font-bold ${getScoreColor(scores.communication)}`}>
              {scores.communication.toFixed(1)}/10
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <h3 className="text-sm font-medium mb-2">Workload Balance Satisfaction</h3>
            <div className={`text-2xl font-bold ${getScoreColor(scores.workloadBalance)}`}>
              {scores.workloadBalance.toFixed(1)}/10
            </div>
          </div>
        </div>
        
        {/* Action button */}
        <div className="mt-6 text-center">
          <button 
            onClick={() => setShowCheckInForm(!showCheckInForm)}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 inline-flex items-center"
          >
            <Heart size={16} className="mr-2" />
            {showCheckInForm ? 'Cancel Check-in' : 'Start Weekly Check-in'}
          </button>
        </div>
      </div>
      
      {/* Check-in Form */}
      {showCheckInForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Weekly Relationship Check-in</h3>
          
          <form onSubmit={handleSubmitCheckIn}>
            <div className="space-y-6">
              {/* Satisfaction */}
              <div>
                <label className="block text-sm font-medium mb-2">
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
                  <span>1 (Very Dissatisfied)</span>
                  <span>5 (Neutral)</span>
                  <span>10 (Very Satisfied)</span>
                </div>
              </div>
              
              {/* Communication */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Quality of communication this week (1-10):
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
                  <span>1 (Very Poor)</span>
                  <span>5 (Adequate)</span>
                  <span>10 (Excellent)</span>
                </div>
              </div>
              
              {/* Workload Balance */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Satisfaction with workload balance this week (1-10):
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={checkInResponses.workloadBalance}
                  onChange={(e) => setCheckInResponses({
                    ...checkInResponses,
                    workloadBalance: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 (Very Unbalanced)</span>
                  <span>5 (Somewhat Balanced)</span>
                  <span>10 (Very Balanced)</span>
                </div>
              </div>
              
              {/* Support */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Feeling supported by your partner this week (1-10):
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={checkInResponses.support}
                  onChange={(e) => setCheckInResponses({
                    ...checkInResponses,
                    support: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 (Not Supported)</span>
                  <span>5 (Somewhat Supported)</span>
                  <span>10 (Very Supported)</span>
                </div>
              </div>
              
              {/* Stress */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Stress level this week (1-10):
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={checkInResponses.stress}
                  onChange={(e) => setCheckInResponses({
                    ...checkInResponses,
                    stress: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 (Very High Stress)</span>
                  <span>5 (Moderate Stress)</span>
                  <span>10 (Very Low Stress)</span>
                </div>
              </div>
              
              {/* Feedback */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Any observations or feedback about this week:
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Share your thoughts about your relationship this week..."
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  {loading ? 'Submitting...' : 'Submit Check-in'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
      
      {/* Trend Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Relationship Trends</h3>
        
        <div className="h-64">
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
                name="Relationship Satisfaction" 
                stroke="#ef4444" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="communication" 
                name="Communication" 
                stroke="#3b82f6" 
              />
              <Line 
                type="monotone" 
                dataKey="workloadBalance" 
                name="Workload Balance" 
                stroke="#10b981" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* AI Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Heart className="text-red-500 mr-2" size={20} />
          <h3 className="text-lg font-medium">Relationship Insights</h3>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start">
              <Award className="text-green-600 mr-3 mt-1 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-medium text-green-800">Balance Improvement Impact</h4>
                <p className="text-sm text-green-700 mt-1">
                  Your efforts to improve workload balance are having a positive effect on your relationship!
                  Communication scores have increased by 19% since you started.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <Info className="text-blue-600 mr-3 mt-1 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-medium text-blue-800">Correlation Insight</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Weeks with better workload balance scores show a consistent increase in overall relationship
                  satisfaction, confirming that improving balance does strengthen your relationship.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Meeting Schedule */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Calendar className="text-blue-500 mr-2" size={20} />
          <h3 className="text-lg font-medium">Relationship Connection Schedule</h3>
        </div>
        
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Weekly Check-in</h4>
                <p className="text-sm text-gray-600">
                  Quick 5-minute assessment of relationship health
                </p>
              </div>
              <div className="flex items-center">
                {showCheckInForm ? (
                  <span className="text-amber-600 text-sm flex items-center">
                    <AlertTriangle size={14} className="mr-1" />
                    In Progress
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
          
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Monthly Date Night</h4>
                <p className="text-sm text-gray-600">
                  Scheduled time for reconnecting without distractions
                </p>
              </div>
              <button className="text-blue-600 text-sm">
                Schedule
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Resources */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <MessageCircle className="text-blue-500 mr-2" size={20} />
          <h3 className="text-lg font-medium">Relationship Resources</h3>
        </div>
        
        <div className="space-y-3">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="font-medium text-blue-800">Communication Techniques</h4>
            <p className="text-sm text-blue-700 mt-1">
              Learn effective ways to discuss workload and responsibilities without conflict.
            </p>
            <button className="mt-2 text-sm text-blue-600">Read Article</button>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <h4 className="font-medium text-green-800">Appreciation Practices</h4>
            <p className="text-sm text-green-700 mt-1">
              Simple daily rituals to increase feelings of being valued and recognized.
            </p>
            <button className="mt-2 text-sm text-green-600">Read Article</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelationshipTab;