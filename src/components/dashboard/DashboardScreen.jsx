// src/components/dashboard/DashboardScreen.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, CheckSquare, Heart, ClipboardCheck, History, 
  User, LogOut, Bell, Settings, ChevronDown, ChevronUp,
  Info, MessageCircle, Calendar, Award
} from 'lucide-react';
import { useFamily } from '../../hooks/useFamily';
import { useSurvey } from '../../hooks/useSurvey';
import { useTasks } from '../../hooks/useTasks';

// Tab components
import FamilyOverviewTab from './tabs/FamilyOverviewTab';
import TasksTab from './tabs/TasksTab';
import RelationshipTab from './tabs/RelationshipTab';
import SurveysTab from './tabs/SurveysTab';
import WeeklyHistoryTab from './tabs/WeeklyHistoryTab';
import FamilyMeetingGenerator from '../meeting/FamilyMeetingGenerator';

const DashboardScreen = () => {
  const navigate = useNavigate();
  
  // Use our hooks
  const { 
    familyData,
    familyMembers,
    selectedMember,
    loadFamily,
    loading: familyLoading,
    error: familyError,
    clearError: clearFamilyError
  } = useFamily();
  
  const {
    loadTasks,
    tasks,
    weeklyTasks,
    loading: tasksLoading,
    error: tasksError
  } = useTasks();

// Log localStorage state for debugging
useEffect(() => {
  console.log("--- Dashboard Debug ---");
  console.log("localStorage familyId:", localStorage.getItem('selectedFamilyId'));
  console.log("localStorage memberId:", localStorage.getItem('selectedMemberId'));
  console.log("Current user:", selectedMember);
  console.log("Current family data:", familyData);
  
  // If we have a family ID in localStorage but no family data loaded
  const storedFamilyId = localStorage.getItem('selectedFamilyId');
  if (storedFamilyId && (!familyData || !familyData.familyId)) {
    console.log("Attempting emergency family load with ID:", storedFamilyId);
    loadFamily(storedFamilyId);
  }
}, []);

  
  // Local state
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Load family data and tasks when component mounts
  // Load family data and tasks when component mounts
  useEffect(() => {
    const loadDashboardData = async () => {
      console.log("Dashboard loading - Family data:", 
                   familyData ? `ID: ${familyData.familyId}` : "None");
      
      if (familyData && familyData.familyId) {
        console.log("Loading tasks for family:", familyData.familyId);
        try {
          await loadTasks();
        } catch (error) {
          console.error("Error loading tasks:", error);
        }
      } else {
        console.log("No family data available, cannot load tasks");
      }
    };
    
    // Only attempt to load dashboard data if not in loading state
    if (!familyLoading) {
      loadDashboardData();
    }
  }, [familyData, familyLoading, loadTasks]);

  // Generate notifications based on app state
  useEffect(() => {
    const newNotifications = [];
    
    // Check if user needs to complete initial survey
    if (selectedMember && !selectedMember.completed) {
      newNotifications.push({
        id: 'complete-survey',
        title: 'Complete Your Initial Survey',
        description: 'Help us understand your family balance',
        type: 'action',
        action: () => navigate('/survey')
      });
    }
    
    // Check if weekly check-in is due
    const currentWeek = familyData?.currentWeek || 1;
    if (selectedMember?.weeklyCompleted && 
        (!selectedMember.weeklyCompleted[currentWeek-1] || 
         !selectedMember.weeklyCompleted[currentWeek-1].completed)) {
      newNotifications.push({
        id: 'weekly-check-in',
        title: `Week ${currentWeek} Check-in Due`,
        description: 'Complete your weekly check-in',
        type: 'action',
        action: () => navigate('/weekly-check-in')
      });
    }
    
    // Check if there are pending tasks
    if (weeklyTasks && weeklyTasks.length > 0) {
      const pendingTasks = weeklyTasks.filter(
        task => task.assignedTo === selectedMember?.roleType && !task.completed
      );
      
      if (pendingTasks.length > 0) {
        newNotifications.push({
          id: 'pending-tasks',
          title: `You have ${pendingTasks.length} pending tasks`,
          description: 'View and complete your assigned tasks',
          type: 'info',
          action: () => setActiveTab('tasks')
        });
      }
    }
    
    setNotifications(newNotifications);
  }, [familyData, selectedMember, weeklyTasks, navigate]);
  
  // Handle tab click
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    
    // If selecting a week history tab, set the selected week
    if (tabId.startsWith('week-')) {
      const weekNumber = parseInt(tabId.replace('week-', ''));
      setSelectedWeek(weekNumber);
    } else {
      setSelectedWeek(null);
    }
    
    // Close mobile menu if open
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    navigate('/login');
  };
  
  // Determine which tab component to render
  const renderTabContent = () => {
    if (familyLoading || tasksLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading your dashboard...</p>
          </div>
        </div>
      );
    }
    
    if (familyError || tasksError) {
      return (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h3 className="text-red-700 font-medium mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600">{familyError || tasksError}</p>
          <button 
            onClick={() => {
              clearFamilyError();
              loadFamily(familyData?.familyId);
              loadTasks();
            }}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      );
    }
    
    switch(activeTab) {
      case 'overview':
        return <FamilyOverviewTab 
               familyData={familyData} 
               familyMembers={familyMembers}
               tasks={tasks}
              />;
      case 'tasks':
        return <TasksTab
               weeklyTasks={weeklyTasks} 
               familyData={familyData}
               familyMembers={familyMembers}
               selectedMember={selectedMember}
              />;
      case 'relationship':
        return <RelationshipTab familyData={familyData} />;
      case 'meeting':
        return <FamilyMeetingGenerator 
               weekNumber={familyData?.currentWeek || 1}
               familyData={familyData}
               weeklyTasks={weeklyTasks}
              />;  
              case 'survey-results':
                return selectedMember && !selectedMember.completed ? (
                  <div className="p-6 bg-white rounded-lg shadow">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-4">Welcome to Allie</h2>
                      <div className="mb-6">
                        <p className="text-lg mb-4">Let's complete your initial survey to get started.</p>
                        <p className="text-gray-600 mb-6">This helps us understand your family's current balance so we can provide personalized recommendations.</p>
                        <button 
                          onClick={() => navigate('/survey')}
                          className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                        >
                          Start Initial Survey
                        </button>
                      </div>
                      
                      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                        <h3 className="font-medium mb-2">What to expect:</h3>
                        <ul className="text-left text-gray-600 space-y-2">
                          <li>• A series of questions about who handles different tasks in your family</li>
                          <li>• Takes about 10-15 minutes to complete</li>
                          <li>• Your responses help us identify areas for better balance</li>
                          <li>• You'll get personalized recommendations once completed</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <SurveysTab familyData={familyData} />
                );
      default:
        // If it's a week history tab
        if (activeTab.startsWith('week-') && selectedWeek) {
          return <WeeklyHistoryTab 
                 weekNumber={selectedWeek}
                />;
        }
        return <div>Tab content not found</div>;
    }
  };

  // If no family data is loaded yet
  // If no family data is loaded yet
if (!familyData && !familyLoading) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">No Family Data Found</h2>
        <p className="text-gray-600 mb-6">We couldn't find your family data. What would you like to do?</p>
        
        <div className="space-y-4 max-w-md mx-auto">
          <button
            onClick={() => navigate('/onboarding')}
            className="w-full px-4 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Create New Family
          </button>
          
          <button
            onClick={() => navigate('/login')}
            className="w-full px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Return to Login
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
          >
            Refresh Page
          </button>
        </div>
        
        <p className="mt-6 text-sm text-gray-500">
          If you've just created a family, try refreshing the page or returning to login.
        </p>
      </div>
    </div>
  );
}
  
  // Generate week history tabs
  const weekHistoryTabs = [];
  const completedWeeks = familyData?.completedWeeks || [];
  for (let i = 1; i <= completedWeeks.length; i++) {
    weekHistoryTabs.push({
      id: `week-${i}`,
      label: `Week ${i}`,
      icon: <History size={18} />
    });
  }
  
  // Main tab configuration
  const tabs = [
    { id: 'overview', label: 'Family Dashboard', icon: <BarChart3 size={18} /> },
    { id: 'tasks', label: 'Your To-Do List', icon: <CheckSquare size={18} /> },
    { id: 'relationship', label: 'Relationship', icon: <Heart size={18} /> },
    { id: 'meeting', label: 'Family Meeting', icon: <MessageCircle size={18} /> },
    { id: 'survey-results', label: 'Initial Survey', icon: <ClipboardCheck size={18} /> },
    ...weekHistoryTabs
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Logo and Family Name */}
            <div className="flex items-center">
              <span className="text-2xl font-light">Allie</span>
              {familyData?.familyName && (
                <span className="ml-2 text-sm text-gray-500">
                  {familyData.familyName} Family
                </span>
              )}
            </div>
            
            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 rounded-full hover:bg-gray-100 relative">
                  <Bell size={20} />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
                
                {/* Notification Dropdown (simplified) */}
                {notifications.length > 0 && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                    <div className="p-2 border-b border-gray-200">
                      <h3 className="text-sm font-medium">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map(notification => (
                        <div 
                          key={notification.id}
                          className="p-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
                          onClick={notification.action}
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              {notification.type === 'action' ? (
                                <Info size={16} className="text-blue-500" />
                              ) : (
                                <Bell size={16} className="text-gray-500" />
                              )}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium">{notification.title}</p>
                              <p className="text-xs text-gray-500">{notification.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* User Menu */}
              <div className="flex items-center">
                {selectedMember && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <img 
                        src={selectedMember.profilePicture} 
                        alt={selectedMember.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="ml-2 text-sm hidden md:block">{selectedMember.name}</span>
                  </div>
                )}
                <button 
                  onClick={handleLogout}
                  className="ml-2 p-2 rounded-full hover:bg-gray-100"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Navigation (desktop) */}
        <div className="hidden md:block w-64 bg-white border-r border-gray-200 h-[calc(100vh-64px)] sticky top-16 overflow-y-auto p-4">
          <nav>
            <ul className="space-y-1">
              {tabs.map(tab => (
                <li key={tab.id}>
                  <button
                    onClick={() => handleTabClick(tab.id)}
                    className={`w-full flex items-center px-4 py-2 rounded-md text-left ${
                      activeTab === tab.id 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="mr-3">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden bg-white border-b border-gray-200 sticky top-16 z-10">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-lg font-medium">{tabs.find(tab => tab.id === activeTab)?.label}</h1>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              {mobileMenuOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="p-4 border-t border-gray-200 bg-white shadow-md">
              <ul className="space-y-2">
                {tabs.map(tab => (
                  <li key={tab.id}>
                    <button
                      onClick={() => handleTabClick(tab.id)}
                      className={`w-full flex items-center px-4 py-2 rounded-md text-left ${
                        activeTab === tab.id 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="mr-3">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Main Tab Content */}
        <div className="flex-1 p-4">
          <div className="max-w-5xl mx-auto">
            {/* Render the active tab content */}
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;