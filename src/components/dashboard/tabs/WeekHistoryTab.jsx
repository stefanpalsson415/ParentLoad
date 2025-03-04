import React, { useState } from 'react';
import { CheckCircle, BookOpen } from 'lucide-react';
import { useFamily } from '../../../contexts/FamilyContext';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  Radar, Legend, ResponsiveContainer
} from 'recharts';

const WeekHistoryTab = ({ weekNumber }) => {
  const { familyMembers } = useFamily();
  const [activeSection, setActiveSection] = useState('summary');
  
  // Sample week data (in a real app, this would come from the database)
  const weekSummary = {
    balanceScore: {
      mama: 65,
      papa: 35
    },
    tasks: {
      mama: {
        completed: 2,
        total: 3,
        items: [
          { title: "Manage Home Repairs", status: 'completed' },
          { title: "Plan Family Activities", status: 'completed' },
          { title: "School Pickup Coordination", status: 'incomplete' }
        ]
      },
      papa: {
        completed: 3,
        total: 3,
        items: [
          { title: "Meal Planning", status: 'completed' },
          { title: "Childcare Coordination", status: 'completed' },
          { title: "Family Calendar Management", status: 'completed' }
        ]
      }
    },
    meetingNotes: {
      taskCompletion: "We discussed how meal planning went well for Papa. He enjoyed taking over this task and feels it's making a positive difference.",
      surveyResults: "The survey showed improvement in Papa's involvement with household tasks. The kids noticed the change too.",
      nextWeekGoals: "For next week, we want to focus on better sharing school-related responsibilities."
    },
    surveyResults: {
      radarData: [
        {
          category: "Visible Household",
          mama: 65,
          papa: 35
        },
        {
          category: "Invisible Household",
          mama: 70,
          papa: 30
        },
        {
          category: "Visible Parental",
          mama: 60,
          papa: 40
        },
        {
          category: "Invisible Parental",
          mama: 65,
          papa: 35
        }
      ],
      keyHighlights: [
        "Papa's involvement in meal planning was recognized by all family members",
        "The children reported more balanced perception of who handles homework help",
        "Mama still handles most of the invisible household tasks"
      ]
    }
  };
  
  // Render content based on active section
  const renderSectionContent = () => {
    switch(activeSection) {
      case 'summary':
        return (
          <div className="space-y-4">
            {/* Balance Score */}
            <div className="bg-white rounded-lg p-6 border">
              <h3 className="text-lg font-semibold mb-3">Week {weekNumber} Balance</h3>
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">Mama ({weekSummary.balanceScore.mama}%)</span>
                  <span className="font-medium">Papa ({weekSummary.balanceScore.papa}%)</span>
                </div>
                <div className="h-2 bg-gray-200 rounded overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${weekSummary.balanceScore.mama}%` }} />
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <span>
                  {weekSummary.balanceScore.mama > 60
                    ? "Still improving balance - Mama is handling more tasks than Papa"
                    : "Great balance achieved this week!"}
                </span>
              </div>
            </div>
            
            {/* Task Completion Summary */}
            <div className="bg-white rounded-lg p-6 border">
              <h3 className="text-lg font-semibold mb-3">Task Completion</h3>
              
              <div className="space-y-6">
                {/* Papa's Tasks */}
                <div>
                  <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                    Papa's Tasks ({weekSummary.tasks.papa.completed}/{weekSummary.tasks.papa.total})
                  </h4>
                  
                  <div className="space-y-2 pl-5">
                    {weekSummary.tasks.papa.items.map((task, index) => (
                      <div key={index} className="flex items-center">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                          task.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {task.status === 'completed' ? '✓' : '!'}
                        </div>
                        <span className={task.status === 'completed' ? '' : 'text-gray-500'}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Mama's Tasks */}
                <div>
                  <h4 className="font-medium text-purple-800 mb-2 flex items-center">
                    <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                    Mama's Tasks ({weekSummary.tasks.mama.completed}/{weekSummary.tasks.mama.total})
                  </h4>
                  
                  <div className="space-y-2 pl-5">
                    {weekSummary.tasks.mama.items.map((task, index) => (
                      <div key={index} className="flex items-center">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                          task.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {task.status === 'completed' ? '✓' : '!'}
                        </div>
                        <span className={task.status === 'completed' ? '' : 'text-gray-500'}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'meeting':
        return (
          <div className="bg-white rounded-lg p-6 border">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                <BookOpen size={20} className="text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Week {weekNumber} Family Meeting</h3>
                <p className="text-sm text-gray-600">Meeting notes and discussion summary</p>
              </div>
            </div>
            
            <div className="space-y-6 mt-6">
              <div className="p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium mb-2">Review Task Completion</h4>
                <p className="text-gray-700 text-sm">{weekSummary.meetingNotes.taskCompletion}</p>
              </div>
              
              <div className="p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium mb-2">Survey Results Discussion</h4>
                <p className="text-gray-700 text-sm">{weekSummary.meetingNotes.surveyResults}</p>
              </div>
              
              <div className="p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium mb-2">Next Week's Goals</h4>
                <p className="text-gray-700 text-sm">{weekSummary.meetingNotes.nextWeekGoals}</p>
              </div>
            </div>
          </div>
        );
        
      case 'survey':
        return (
          <div className="space-y-4">
            {/* Survey Category Chart */}
            <div className="bg-white rounded-lg p-6 border">
              <h3 className="text-lg font-semibold mb-3">Task Category Distribution</h3>
              <p className="text-sm text-gray-600 mb-4">
                Week {weekNumber} survey results across the four task categories
              </p>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius="80%" data={weekSummary.surveyResults.radarData}>
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
            </div>
            
            {/* Survey Highlights */}
            <div className="bg-white rounded-lg p-6 border">
              <h3 className="text-lg font-semibold mb-3">Key Insights</h3>
              <ul className="space-y-2">
                {weekSummary.surveyResults.keyHighlights.map((highlight, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-2">
                      <CheckCircle size={14} />
                    </div>
                    <span className="text-gray-700">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
        
      case 'report':
        return (
          <div className="bg-white rounded-lg p-6 border">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Week {weekNumber} Full Report</h3>
                <p className="text-sm text-gray-600">Comprehensive data from this week</p>
              </div>
            </div>
            
            <div className="space-y-6 mt-6">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Balance Summary</h4>
                <p className="text-gray-700">
                  Week {weekNumber} showed Mama handling {weekSummary.balanceScore.mama}% of family responsibilities
                  and Papa handling {weekSummary.balanceScore.papa}%. 
                  {weekSummary.balanceScore.papa > weekSummary.balanceScore.papa - 5 && 
                   " This is an improvement from the previous week."}
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Task Completion</h4>
                <p className="text-gray-700">
                  Papa completed {weekSummary.tasks.papa.completed} of {weekSummary.tasks.papa.total} assigned tasks.
                  Mama completed {weekSummary.tasks.mama.completed} of {weekSummary.tasks.mama.total} assigned tasks.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Areas of Progress</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>Better balance in meal planning and preparation</li>
                  <li>Improved sharing of calendar management</li>
                  <li>Children reporting more balanced perception of responsibilities</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Areas for Improvement</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>Invisible household tasks still disproportionately handled by Mama</li>
                  <li>School-related responsibilities need better sharing</li>
                </ul>
              </div>
            </div>
          </div>
        );
        
      default:
        return <div>Select a section</div>;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Navigation tabs */}
      <div className="flex border-b overflow-x-auto">
        <button 
          className={`px-4 py-2 font-medium ${activeSection === 'summary' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveSection('summary')}
        >
          Summary
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeSection === 'meeting' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveSection('meeting')}
        >
          Family Meeting
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeSection === 'survey' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveSection('survey')}
        >
          Survey Results
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeSection === 'report' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveSection('report')}
        >
          Full Report
        </button>
      </div>
      
      {/* Section content */}
      {renderSectionContent()}
    </div>
  );
};

export default WeekHistoryTab;