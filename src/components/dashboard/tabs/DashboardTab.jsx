import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { useFamily } from '../../../contexts/FamilyContext';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  Radar, Legend, ResponsiveContainer, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';

const DashboardTab = () => {
  const { 
    completedWeeks, 
    currentWeek 
  } = useFamily();
  
  // Filter state for radar chart
  const [radarFilter, setRadarFilter] = useState('all'); // 'all', 'parents', 'children'
  
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
      { week: 'Week 5', mama: 53, papa: 47 }
    ];
    
    // Only include initial survey and completed weeks
    return baseHistory.filter((item, index) => {
      if (item.week === 'Initial') return true;
      const weekNum = parseInt(item.week.split(' ')[1]);
      return completedWeeks.includes(weekNum);
    });
  };
  
  const balanceHistory = getBalanceHistory();
  
  return (
    <div className="space-y-4">
      {/* Balance card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3">Family Balance</h3>
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
          
        <p className="text-sm text-gray-600">
          Mama is currently handling more tasks than Papa. Check the recommendations for ways to improve balance.
        </p>
      </div>
        
      {/* Balance history chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-2">Task Balance History</h3>
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
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="mama" name="Mama's Tasks" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="papa" name="Papa's Tasks" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
          
        <div className="mt-4 text-sm text-center text-gray-500">
          Your balance is improving! Papa's task share has increased since the initial survey.
        </div>
      </div>
        
      {/* Radar chart with filtering */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Task Category Balance</h3>
          <div className="flex items-center text-sm">
            <Filter size={14} className="mr-1" />
            <span className="mr-2">Filter:</span>
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
        <p className="text-sm text-gray-600 mb-4">
          Distribution of responsibilities across the four task categories
        </p>
          
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart outerRadius="80%" data={getRadarData(radarFilter)}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
                
              <Radar
                name="Mama's Tasks"
                dataKey="mama"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.5}
              />
                
              <Radar
                name="Papa's Tasks"
                dataKey="papa"
                stroke="#82ca9d"
                fill="#82ca9d"
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
    </div>
  );
};

export default DashboardTab;