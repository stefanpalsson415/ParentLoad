// src/components/dashboard/TaskEffectivenessAnalysis.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, Info } from 'lucide-react';

const TaskEffectivenessAnalysis = ({ effectivenessData = [] }) => {
  // If no data is provided, use this sample data
  const sampleData = [
    { category: 'Meal Planning', effectiveness: 8.5 },
    { category: 'Bedtime Routine', effectiveness: 7.2 },
    { category: 'Laundry', effectiveness: 6.8 },
    { category: 'School Communication', effectiveness: 6.5 },
    { category: 'Weekend Activities', effectiveness: 8.2 }
  ];
  
  const data = effectivenessData.length > 0 ? effectivenessData : sampleData;
  
  // Sort by effectiveness score
  const sortedData = [...data].sort((a, b) => b.effectiveness - a.effectiveness);
  
  // Format the data for the chart
  const chartData = sortedData.map(item => ({
    category: item.category,
    effectiveness: (item.effectiveness * 10), // Convert to percentage
    fill: getBarColor(item.effectiveness * 10)
  }));
  
  // Get color based on effectiveness
  function getBarColor(score) {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#3b82f6'; // Blue
    if (score >= 40) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  }
  
  // Get the most effective task
  const mostEffective = sortedData[0];
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <TrendingUp className="text-blue-500 mr-2" size={20} />
        <h3 className="text-lg font-medium">Task Effectiveness Analysis</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-6">
        Our AI analyzes which tasks are most effective at improving your family's balance
      </p>
      
      {/* Highlight the most effective task */}
      {mostEffective && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start">
            <Award className="text-green-600 mr-3 mt-1 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-medium text-green-800">Most Effective Task Type</h4>
              <p className="text-sm text-green-700 mt-1">
                <strong>{mostEffective.category}</strong> tasks have been most effective in improving balance, 
                with an effectiveness score of {(mostEffective.effectiveness * 10).toFixed(0)}%.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Effectiveness Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="category" type="category" width={100} />
            <Tooltip 
              formatter={(value) => [`${value}%`, 'Effectiveness']}
            />
            <Bar 
              dataKey="effectiveness" 
              name="Effectiveness" 
              fill="#8884d8"
              background={{ fill: '#eee' }}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Info Panel */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <Info className="text-blue-600 mr-3 mt-1 flex-shrink-0" size={20} />
          <div>
            <h4 className="font-medium text-blue-800">How We Calculate Effectiveness</h4>
            <p className="text-sm text-blue-700 mt-1">
              Effectiveness scores are calculated based on your feedback after completing tasks, 
              changes in survey responses, and improvements in workload balance metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskEffectivenessAnalysis;