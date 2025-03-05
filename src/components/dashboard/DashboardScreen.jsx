import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Filter } from 'lucide-react';
import { useFamily } from '../../contexts/FamilyContext';
import DashboardTab from './tabs/DashboardTab';
import TasksTab from './tabs/TasksTab';
import SurveysTab from './tabs/SurveysTab';
import WeekHistoryTab from './tabs/WeekHistoryTab';
import HowThisWorksScreen from '../education/HowThisWorksScreen';
import PersonalizedApproachScreen from '../education/PersonalizedApproachScreen';

const DashboardScreen = ({ onOpenFamilyMeeting }) => {
  const navigate = useNavigate();
  const { 
    selectedUser, 
    familyMembers,
    completedWeeks,
    currentWeek 
  } = useFamily();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Redirect if no user is selected
  useEffect(() => {
    if (!selectedUser) {
      navigate('/');
    }
  }, [selectedUser, navigate]);
  
  // Check if all family members have completed the survey
  const allSurveysCompleted = familyMembers.every(member => member.completed);
  
  // Handle logout/switch user
  const handleLogout = () => {
    navigate('/');
  };
  
  // Start weekly check-in
  const handleStartWeeklyCheckIn = () => {
    navigate('/weekly-check-in');
  };
  
  // Generate tab content based on active tab
  const renderTabContent = () => {
    // If not all surveys are completed, show waiting screen
    if (!allSurveysCompleted) {
      return (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-6">
            <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center rounded-full bg-amber-100 text-amber-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Waiting for All Survey Responses</h3>
            <p className="text-gray-600 mb-4">
              All family members need to complete the initial survey before we can generate accurate reports.
            </p>
              
            <div className="mb-6">
              <h4 className="font-medium mb-2">Family Progress</h4>
              <div className="flex flex-wrap justify-center gap-3 max-w-sm mx-auto">
                {familyMembers.map(member => (
                  <div key={member.id} className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full overflow-hidden mb-1 border-2 border-gray-200">
                      <img 
                        src={member.profilePicture} 
                        alt={member.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm">{member.name}</span>
                    <span className={`text-xs ${member.completed ? 'text-green-500' : 'text-amber-500'}`}>
                      {member.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
              
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={handleLogout}
            >
              Switch User
            </button>
          </div>
        </div>
      );
    }
    
    // Render appropriate tab content
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'tasks':
        return <TasksTab onStartWeeklyCheckIn={handleStartWeeklyCheckIn} onOpenFamilyMeeting={onOpenFamilyMeeting} />;
      case 'surveys':
        return <SurveysTab onStartWeeklyCheckIn={handleStartWeeklyCheckIn} />;
      case 'how-it-works':
        return <HowThisWorksScreen />;
      case 'personalized':
        return <PersonalizedApproachScreen />;
      default:
        // Handle week history tabs
        if (activeTab.startsWith('week-')) {
          const weekNumber = parseInt(activeTab.split('-')[1]);
          return <WeekHistoryTab weekNumber={weekNumber} />;
        }
        return <div>Select a tab</div>;
    }
  };
  
  // Generate dynamic tabs for completed weeks
  const weekTabs = completedWeeks.map(week => ({
    id: `week-${week}`,
    name: `Week ${week}`
  }));
  
  // If no user is selected, return loading
  if (!selectedUser) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">ParentLoad</h1>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
              <img 
                src={selectedUser.profilePicture}
                alt={selectedUser.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="mr-3">{selectedUser.name}</span>
            <button 
              onClick={handleLogout}
              className="flex items-center text-sm bg-blue-700 hover:bg-blue-800 px-2 py-1 rounded"
            >
              <LogOut size={14} className="mr-1" />
              Switch User
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 container mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex border-b mb-6 overflow-x-auto">
          <button 
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'dashboard' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'tasks' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('tasks')}
          >
            Tasks
          </button>
          <button 
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'surveys' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('surveys')}
          >
            Surveys
          </button>
          <button 
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'how-it-works' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('how-it-works')}
          >
            How This Works?
          </button>
          <button 
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'personalized' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('personalized')}
          >
            Your Personalized Approach
          </button>
          
          {/* Add completed weeks as tabs */}
          {weekTabs.map(tab => (
            <button 
              key={tab.id}
              className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === tab.id ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
            </button>
          ))}
        </div>
          
        {/* Tab content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default DashboardScreen;