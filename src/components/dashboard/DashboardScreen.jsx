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

// Tab components (will import later)
// Updated imports:
import FamilyOverviewTab from './tabs/FamilyOverviewTab';
import TasksTab from './tabs/TasksTab';  // Correct import name
import RelationshipTab from './tabs/RelationshipTab';
import SurveysTab from './tabs/SurveysTab';  // Correct import name
import WeeklyHistoryTab from './tabs/WeeklyHistoryTab';  // More comprehensive implementation

const DashboardScreen = () => {
  const navigate = useNavigate();
  
  // Use our new hooks
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
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load tasks for the family after family data is loaded
        await loadTasks();
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };
    
    if (familyData?.familyId) {
      loadData();
    }
  }, [familyData, loadTasks]);
  
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
    
    const renderTabContent = () => {
      // ... loading and error handling code ...
      
      switch(activeTab) {
        case 'overview':
          return <FamilyOverviewTab 
                  familyData={familyData} 
                  familyMembers={familyMembers}
                  tasks={tasks}
                 />;
        case 'tasks':
          return <TasksTab  // Fixed component name
                  weeklyTasks={weeklyTasks} 
                  familyData={familyData}
                  familyMembers={familyMembers}
                  selectedMember={selectedMember}
                 />;
        case 'relationship':
          return <RelationshipTab familyData={familyData} />;
        case 'survey-results':
          return <SurveysTab familyData={familyData} />;  // Fixed component
        default:
          // If it's a week history tab
          if (activeTab.startsWith('week-') && selectedWeek) {
            return <WeeklyHistoryTab  // Fixed component name
                    weekNumber={selectedWeek}
                   />;
          }
          return <div>Tab content not found</div>;
      }
    };
  
  // If no family data is loaded yet
  if (!familyData && !familyLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">No Family Data Found</h2>
          <p className="text-gray-600">Let's get you started with creating a family.</p>
        </div>
        <button
          onClick={() => navigate('/onboarding')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Create Family
        </button>
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