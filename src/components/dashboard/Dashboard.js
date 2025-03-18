// src/components/dashboard/Dashboard.js (Enhanced)
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFamily } from '../../contexts/FamilyContext';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { 
    currentFamily, 
    familyMembers, 
    userFamilies, 
    selectedMember,
    currentWeek,
    completedWeeks,
    taskRecommendations,
    loading, 
    error, 
    selectFamily,
    selectMember,
    clearError
  } = useFamily();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [debug, setDebug] = useState({ 
    active: false, 
    messages: [],
    familyLoaded: false 
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Add debug message function
  const addDebugMessage = (message, type = 'info') => {
    setDebug(prev => ({
      ...prev,
      active: true,
      messages: [...prev.messages, { 
        message, 
        type, 
        timestamp: new Date().toISOString() 
      }]
    }));
  };
  
  // Check for family ID in location state (from onboarding)
  useEffect(() => {
    const loadFamilyFromState = async () => {
      // Log state for debugging
      addDebugMessage(`Location state: ${JSON.stringify(location.state || 'none')}`);
      
      if (location.state?.familyId) {
        addDebugMessage(`Attempting to load family with ID: ${location.state.familyId}`);
        
        if (location.state?.newlyCreated) {
          addDebugMessage('This family was just created in onboarding', 'success');
        }
        
        try {
          const family = await selectFamily(location.state.familyId);
          
          if (family) {
            addDebugMessage(`Successfully loaded family: ${family.familyName}`, 'success');
            setDebug(prev => ({ ...prev, familyLoaded: true }));
          } else {
            addDebugMessage('Family data was null or undefined', 'error');
          }
        } catch (err) {
          addDebugMessage(`Error loading family: ${err.message}`, 'error');
        }
      } else if (!currentFamily) {
        addDebugMessage('No family ID in location state, checking available families');
        
        if (userFamilies.length > 0) {
          addDebugMessage(`User has ${userFamilies.length} families, loading first one`);
          try {
            const family = await selectFamily(userFamilies[0].familyId);
            
            if (family) {
              addDebugMessage(`Loaded default family: ${family.familyName}`, 'success');
              setDebug(prev => ({ ...prev, familyLoaded: true }));
            }
          } catch (err) {
            addDebugMessage(`Error loading default family: ${err.message}`, 'error');
          }
        } else {
          addDebugMessage('User has no families yet');
        }
      } else {
        addDebugMessage(`Family already loaded: ${currentFamily.familyName}`);
        setDebug(prev => ({ ...prev, familyLoaded: true }));
      }
    };
    
    if (currentUser) {
      loadFamilyFromState();
    } else {
      addDebugMessage('No authenticated user!', 'error');
    }
  }, [location.state, currentFamily, selectFamily, userFamilies, currentUser]);
  
  // If user has no families, redirect to onboarding
  useEffect(() => {
    if (!loading && userFamilies.length === 0 && currentUser) {
      addDebugMessage('No families found for user, redirecting to onboarding');
      navigate('/onboarding');
    }
  }, [loading, userFamilies, currentUser, navigate]);
  
  // Handle member selection
  const handleMemberSelect = (member) => {
    addDebugMessage(`Selected member: ${member.name}`);
    selectMember(member);
  };
  
  // Handle tab selection
  const handleTabSelect = (tab) => {
    setActiveTab(tab);
  };
  
  // Handle logout
  const handleLogout = () => {
    navigate('/login');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={clearError}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  // Rest of the component remains the same, just add the debug panel at the end

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-light">Allie</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Family selector (if user has multiple families) */}
              {userFamilies.length > 1 && (
                <select
                  className="border border-gray-300 rounded-md px-3 py-1"
                  value={currentFamily?.familyId || ''}
                  onChange={(e) => selectFamily(e.target.value)}
                >
                  {userFamilies.map((family) => (
                    <option key={family.familyId} value={family.familyId}>
                      {family.familyName}
                    </option>
                  ))}
                </select>
              )}
              
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex">
          {/* Sidebar */}
          <aside className="md:w-64 mb-8 md:mb-0 md:mr-8">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <h2 className="font-bold text-lg mb-4">{currentFamily?.familyName || 'Loading...'}</h2>
              
              {/* Family members */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">Family Members</h3>
                <ul className="space-y-2">
                  {familyMembers.map((member) => (
                    <li key={member.id}>
                      <button
                        onClick={() => handleMemberSelect(member)}
                        className={`w-full text-left px-3 py-2 rounded-md ${
                          selectedMember?.id === member.id
                            ? 'bg-blue-100 text-blue-800'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {member.name} {member.role === 'parent' ? `(${member.type})` : ''}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Week info */}
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Progress</h3>
                <div className="bg-gray-100 p-3 rounded-md">
                  <p className="text-sm">Current Week: {currentWeek}</p>
                  <p className="text-sm">Completed Weeks: {completedWeeks.length}</p>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="bg-white rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleTabSelect('overview')}
                    className={`w-full text-left px-3 py-2 rounded-md ${
                      activeTab === 'overview'
                        ? 'bg-black text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Overview
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabSelect('tasks')}
                    className={`w-full text-left px-3 py-2 rounded-md ${
                      activeTab === 'tasks'
                        ? 'bg-black text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Tasks
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabSelect('survey')}
                    className={`w-full text-left px-3 py-2 rounded-md ${
                      activeTab === 'survey'
                        ? 'bg-black text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Survey
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabSelect('settings')}
                    className={`w-full text-left px-3 py-2 rounded-md ${
                      activeTab === 'settings'
                        ? 'bg-black text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Settings
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setDebug(prev => ({ ...prev, active: !prev.active }))}
                    className={`w-full text-left px-3 py-2 rounded-md ${
                      debug.active
                        ? 'bg-purple-800 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Debug Console
                  </button>
                </li>
              </ul>
            </nav>
          </aside>
          
          {/* Main content area */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Welcome banner for newly created families */}
              {location.state?.newlyCreated && (
                <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-md">
                  <h3 className="font-bold mb-2">Welcome to your new family dashboard!</h3>
                  <p>Your family has been created successfully. Now you can start using Allie to balance your family responsibilities.</p>
                </div>
              )}
            
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Family Dashboard</h2>
                  
                  {/* Family data overview */}
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h3 className="text-lg font-medium mb-4">Family Information</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Family Name:</h4>
                        <p>{currentFamily?.familyName}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">Parents:</h4>
                        <ul className="list-disc list-inside">
                          {familyMembers
                            .filter(member => member.role === 'parent')
                            .map((parent, index) => (
                              <li key={index}>
                                {parent.name} ({parent.type})
                              </li>
                            ))}
                        </ul>
                      </div>
                      
                      {familyMembers.some(member => member.role === 'child') && (
                        <div>
                          <h4 className="font-medium">Children:</h4>
                          <ul className="list-disc list-inside">
                            {familyMembers
                              .filter(member => member.role === 'child')
                              .map((child, index) => (
                                <li key={index}>
                                  {child.name} (Age: {child.age})
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-medium">Priorities:</h4>
                        <ol className="list-decimal list-inside">
                          <li>{currentFamily?.priorities?.highestPriority || 'Not set'}</li>
                          <li>{currentFamily?.priorities?.secondaryPriority || 'Not set'}</li>
                          <li>{currentFamily?.priorities?.tertiaryPriority || 'Not set'}</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                  
                  {/* Placeholder for dashboard content */}
                  <div className="bg-gray-100 p-8 rounded-lg text-center">
                    <p className="text-gray-600 mb-4">
                      Welcome to your family dashboard! This is where you'll see your family's balance data
                      and progress metrics.
                    </p>
                    <p className="text-gray-600">
                      Complete the initial survey to start tracking your family's balance.
                    </p>
                    <button 
                      onClick={() => navigate('/survey/initial')}
                      className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                    >
                      Take Initial Survey
                    </button>
                  </div>
                </div>
              )}
              
              {/* Tasks Tab */}
              {activeTab === 'tasks' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Your Tasks</h2>
                  
                  {taskRecommendations.length === 0 ? (
                    <div className="bg-gray-100 p-8 rounded-lg text-center">
                      <p className="text-gray-600">
                        No tasks yet! Complete the initial survey to get personalized task recommendations.
                      </p>
                      <button 
                        onClick={() => navigate('/survey/initial')}
                        className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                      >
                        Take Initial Survey
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {taskRecommendations.map((task) => (
                        <div key={task.id} className="border border-gray-200 rounded-md p-4">
                          <div className="flex items-start">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => {/* Handle task completion */}}
                              className="mt-1 mr-3"
                            />
                            <div>
                              <h3 className="font-medium">{task.title}</h3>
                              <p className="text-gray-600 text-sm">{task.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Survey Tab */}
              {activeTab === 'survey' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Surveys</h2>
                  
                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-md p-6">
                      <h3 className="text-lg font-medium mb-2">Initial Survey</h3>
                      <p className="text-gray-600 mb-4">
                        The 80-question comprehensive assessment that establishes your baseline.
                      </p>
                      <button 
                        onClick={() => navigate('/survey/initial')}
                        className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                      >
                        Take Initial Survey
                      </button>
                    </div>
                    
                    <div className="border border-gray-200 rounded-md p-6">
                      <h3 className="text-lg font-medium mb-2">Weekly Check-In (Week {currentWeek})</h3>
                      <p className="text-gray-600 mb-4">
                        Quick 20-question survey to track your weekly progress.
                      </p>
                      <button 
                        onClick={() => navigate('/survey/weekly')}
                        className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                      >
                        Take Weekly Check-In
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Family Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Family Name</h3>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                        value={currentFamily?.familyName || ''}
                        onChange={() => {/* Handle name change */}}
                      />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Family Members</h3>
                      <div className="space-y-2">
                        {familyMembers.map((member) => (
                          <div key={member.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-md">
                            <div>
                              <p>{member.name}</p>
                              <p className="text-sm text-gray-600">{member.role === 'parent' ? member.type : 'Child'}</p>
                            </div>
                            <button className="text-blue-600 hover:text-blue-800">
                              Edit
                            </button>
                          </div>
                        ))}
                        <button className="flex items-center text-blue-600 hover:text-blue-800">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Add Family Member
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Debug Console */}
              {debug.active && (
                <div className="mt-6 bg-gray-800 text-white p-4 rounded-lg text-sm overflow-auto max-h-96">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold">Debug Console</h3>
                    <button 
                      onClick={() => setDebug(prev => ({...prev, messages: []}))}
                      className="text-xs bg-red-600 px-2 py-1 rounded hover:bg-red-700"
                    >
                      Clear
                    </button>
                  </div>
                  
                  <div className="mb-4 grid grid-cols-2 gap-2">
                    <div className="bg-gray-700 p-2 rounded">
                      <strong>Auth Status:</strong> {currentUser ? 'Authenticated' : 'Not Authenticated'}
                      {currentUser && <div className="text-xs truncate">ID: {currentUser.uid}</div>}
                    </div>
                    <div className="bg-gray-700 p-2 rounded">
                      <strong>Family Loaded:</strong> {debug.familyLoaded ? 'Yes' : 'No'}
                      {currentFamily && <div className="text-xs truncate">ID: {currentFamily.familyId}</div>}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {debug.messages.map((item, index) => (
                      <div 
                        key={index} 
                        className={`pl-2 border-l-2 ${
                          item.type === 'error' ? 'border-red-500 text-red-300' : 
                          item.type === 'success' ? 'border-green-500 text-green-300' :
                          'border-blue-500 text-blue-300'
                        }`}
                      >
                        {item.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;