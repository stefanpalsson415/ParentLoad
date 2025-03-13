import React, { useState, useEffect } from 'react';
import { LogOut, Filter, Settings, Users } from 'lucide-react';
import { useFamily } from '../../contexts/FamilyContext';
import DashboardTab from './tabs/DashboardTab';
import TasksTab from './tabs/TasksTab';
import WeekHistoryTab from './tabs/WeekHistoryTab';
import HowThisWorksScreen from '../education/HowThisWorksScreen';
import PersonalizedApproachScreen from '../education/PersonalizedApproachScreen';
import InitialSurveyTab from './tabs/InitialSurveyTab';
import UserSettingsScreen from '../user/UserSettingsScreen';
import FamilyMeetingScreen from '../meeting/FamilyMeetingScreen';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import CoupleRelationshipChart from './CoupleRelationshipChart';
import AllieChat from '../chat/AllieChat';





const DashboardScreen = ({ onOpenFamilyMeeting }) => {
  const navigate = useNavigate();
  const { 
    selectedUser, 
    familyMembers,
    completedWeeks,
    currentWeek,
    familyName
  } = useFamily();
  
  // Get loadFamilyData from Auth context
  const { loadFamilyData } = useAuth();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [showFamilyMeeting, setShowFamilyMeeting] = useState(false);


// DEBUGGING: Check for direct family ID parameter
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const forceFamilyId = params.get('forceFamilyId');
  
  if (forceFamilyId) {
    console.log("FORCE LOADING FAMILY:", forceFamilyId);
    
    // Create a visible debug element
    const debugDiv = document.createElement('div');
    debugDiv.style.position = 'fixed';
    debugDiv.style.top = '10px';
    debugDiv.style.right = '10px';
    debugDiv.style.padding = '10px';
    debugDiv.style.background = 'black';
    debugDiv.style.color = 'lime';
    debugDiv.style.zIndex = '9999';
    debugDiv.style.fontFamily = 'monospace';
    debugDiv.style.fontSize = '12px';
    debugDiv.textContent = `Loading family: ${forceFamilyId}`;
    document.body.appendChild(debugDiv);
    
    // Try to load the family
    loadFamilyData(forceFamilyId)
      .then(data => {
        debugDiv.textContent += '\nFamily loaded: ' + (data?.familyName || 'Unknown');
        
        // Force refresh the component state
        window.location.href = '/dashboard';
      })
      .catch(err => {
        debugDiv.textContent += '\nERROR: ' + err.message;
        console.error("Force loading error:", err);
      });
  }
}, []);

  // Check for direct navigation state
const location = useLocation();
useEffect(() => {
  if (location.state?.directAccess && location.state?.familyId) {
    console.log("DIRECT ACCESS via router state:", location.state.familyId);
    
    // Only load if needed
    if (!selectedUser || !familyMembers || familyMembers.length === 0) {
      loadFamilyData(location.state.familyId)
        .then(() => console.log("Family loaded successfully from router state"))
        .catch(error => console.error("Error loading family:", error));
    }
  }
}, [location]);

// PRIORITY: Direct family access bypass
useEffect(() => {
  try {
    const directAccess = localStorage.getItem('directFamilyAccess');
    if (directAccess) {
      const { familyId, familyName, timestamp } = JSON.parse(directAccess);
      
      // Check if this is recent (within last 30 seconds)
      const now = new Date().getTime();
      if (now - timestamp < 30000) {
        console.log("DIRECT FAMILY ACCESS:", familyId, familyName);
        
        // Load this family immediately
        loadFamilyData(familyId).then(() => {
          console.log("DIRECT FAMILY LOADED SUCCESSFULLY");
          // Clear the direct access
          localStorage.removeItem('directFamilyAccess');
        }).catch(err => {
          console.error("DIRECT FAMILY LOAD ERROR:", err);
          alert("Error loading family: " + err.message);
        });
      } else {
        // Expired access attempt, clean up
        localStorage.removeItem('directFamilyAccess');
      }
    }
  } catch (e) {
    console.error("Error in direct family access:", e);
    localStorage.removeItem('directFamilyAccess');
  }
}, []);


// PRIORITY: Direct family access bypass
useEffect(() => {
  try {
    const directAccess = localStorage.getItem('directFamilyAccess');
    if (directAccess) {
      const { familyId, familyName, timestamp } = JSON.parse(directAccess);
      
      // Check if this is recent (within last 30 seconds)
      const now = new Date().getTime();
      if (now - timestamp < 30000) {
        console.log("DIRECT FAMILY ACCESS:", familyId, familyName);
        
        // Load this family immediately
        loadFamilyData(familyId).then(() => {
          console.log("DIRECT FAMILY LOADED SUCCESSFULLY");
          // Clear the direct access
          localStorage.removeItem('directFamilyAccess');
        }).catch(err => {
          console.error("DIRECT FAMILY LOAD ERROR:", err);
          alert("Error loading family: " + err.message);
        });
      } else {
        // Expired access attempt, clean up
        localStorage.removeItem('directFamilyAccess');
      }
    }
  } catch (e) {
    console.error("Error in direct family access:", e);
    localStorage.removeItem('directFamilyAccess');
  }
}, []);

// Extract family ID from URL if present
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const familyId = params.get('family');
  
  if (familyId && (!selectedUser || !familyMembers || familyMembers.length === 0)) {
    console.log("Loading family from URL parameter:", familyId);
    loadFamilyData(familyId).then(() => {
      console.log("Family loaded from URL parameter");
    }).catch(error => {
      console.error("Error loading family from URL:", error);
    });
  }
}, []);

// Check for selected family on load
useEffect(() => {
  const storedFamilyId = localStorage.getItem('selectedFamilyId');
  
  if (storedFamilyId && (!selectedUser || !familyMembers || familyMembers.length === 0)) {
    console.log("Loading family from localStorage:", storedFamilyId);
    loadFamilyData(storedFamilyId).then(() => {
      console.log("Family loaded successfully from localStorage");
      // Clear storage after successful load
      localStorage.removeItem('selectedFamilyId');
    }).catch(error => {
      console.error("Error loading stored family:", error);
    });
  }
}, []);


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
    navigate('/login');
  };
  
  // Start weekly check-in
  const handleStartWeeklyCheckIn = () => {
    navigate('/weekly-check-in');
  };

  // Handle settings toggle
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };
  
  // Handle Family Meeting open/close
  const handleOpenFamilyMeeting = () => {
    console.log("Opening family meeting dialog");
    setShowFamilyMeeting(true);
  };
  
  const handleCloseFamilyMeeting = () => {
    console.log("Closing family meeting dialog");
    setShowFamilyMeeting(false);
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
              
            <div className="flex space-x-3">
  <button
    className="px-4 py-2 bg-black text-white rounded font-roboto"
    onClick={handleLogout}
  >
    Switch User
  </button>
  {!selectedUser.completed && (
    <button
      className="px-4 py-2 bg-black text-white rounded font-roboto"
      onClick={() => navigate('/survey')}
    >
      Start Initial Survey
    </button>
  )}
</div>
          </div>
        </div>
      );
    }
    
    // Render appropriate tab content
    switch (activeTab) {
      case 'how-it-works':
        return <HowThisWorksScreen />;
      case 'personalized':
        return <PersonalizedApproachScreen />;
        case 'relationship':
  return <CoupleRelationshipChart />;

      case 'dashboard':
        return <DashboardTab />;
      case 'tasks':
        return <TasksTab 
          onStartWeeklyCheckIn={handleStartWeeklyCheckIn} 
          onOpenFamilyMeeting={handleOpenFamilyMeeting} 
        />;
      case 'initial-survey':
        return <InitialSurveyTab />;
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

  // Format family name for display
  const displayFamilyName = familyName || "Family";
  const formattedFamilyName = `${displayFamilyName} Family AI Balancer`;
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
<div className="bg-black text-white p-4">
  <div className="container mx-auto flex justify-between items-center">
    <div className="flex flex-col">
      <h1 className="text-xl font-bold font-roboto">Allie</h1>
      <p className="text-sm font-roboto">Balance family responsibilities together</p>
      <p className="text-xs text-gray-300 font-roboto">The {familyName ? familyName.split(' ')[0] : ''} Family</p>
    </div>
    <div className="flex items-center">
      <div 
        className="w-8 h-8 rounded-full overflow-hidden mr-2 cursor-pointer border-2 border-white"
        onClick={toggleSettings}
      >
        <img 
          src={selectedUser.profilePicture}
          alt={selectedUser.name}
          className="w-full h-full object-cover"
        />
      </div>
      <span className="mr-3 font-roboto">{selectedUser.name}</span>
      <button 
        onClick={handleLogout}
        className="flex items-center text-sm bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded font-roboto"
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
            Family Dashboard
          </button>
          <button 
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'tasks' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('tasks')}
          >
            Your To-do List
          </button>
          <button 
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'initial-survey' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('initial-survey')}
          >
            Initial Survey
          </button>
          
          {/* Add completed weeks as tabs */}
          {weekTabs.map(tab => (
  <button 
  key={tab.id}
  className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === tab.id ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
  onClick={() => setActiveTab(tab.id)}
>
  {tab.name.replace('Week', 'Cycle')}
  <span className="text-xs block text-gray-500 font-roboto">Flexible timeframe</span>
</button>
))}

{/* Relationship Tab */}
{selectedUser && selectedUser.role === 'parent' && (
  <button 
    className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'relationship' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
    onClick={() => setActiveTab('relationship')}
  >
    Relationship
  </button>
)}
          
        </div>
          
        {/* Tab content */}
        {renderTabContent()}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <UserSettingsScreen onClose={toggleSettings} />
      )}

      {/* Family Meeting Modal */}
      {showFamilyMeeting && (
        <FamilyMeetingScreen onClose={handleCloseFamilyMeeting} />
      )}
    </div>
  );
};

{/* Allie Chat Widget */}
<AllieChat />

export default DashboardScreen;