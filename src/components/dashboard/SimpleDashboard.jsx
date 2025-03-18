import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// A simplified dashboard that doesn't rely on complex contexts
const SimpleDashboard = () => {
  const navigate = useNavigate();
  const [familyData, setFamilyData] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  // Get data from window emergency storage
  useEffect(() => {
    if (window.__familyData && window.__selectedMember) {
      setFamilyData(window.__familyData);
      setSelectedMember(window.__selectedMember);
    } else {
      navigate('/dashboard-bootstrapper');
    }
  }, [navigate]);

  if (!familyData || !selectedMember) {
    return <div>Loading dashboard data...</div>;
  }

  // Simplified logout that just sends back to login screen
  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Basic header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-light">Allie</h1>
            {familyData?.familyName && (
              <span className="ml-2 text-sm text-gray-500">
                {familyData.familyName} Family
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* User profile */}
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img 
                  src={selectedMember.profilePicture || "/api/placeholder/150/150"} 
                  alt={selectedMember.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="ml-2 text-sm">{selectedMember.name}</span>
            </div>
            
            {/* Logout button */}
            <button 
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {selectedMember.name}!</h2>
          <p className="mb-4">
            Your family data has been successfully loaded. This is a simplified dashboard
            that bypasses the complex context system.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Family Members</h3>
              <ul className="space-y-2">
                {familyData.familyMembers.map((member) => (
                  <li key={member.id} className="flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                      <img 
                        src={member.profilePicture || "/api/placeholder/150/150"} 
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span>
                      {member.name} 
                      <span className="text-gray-500 text-sm ml-1">
                        ({member.roleType || member.role})
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Next Steps</h3>
              <p className="text-sm text-gray-600 mb-4">
                What would you like to do next?
              </p>
              <div className="space-y-2">
                <button className="w-full py-2 bg-blue-600 text-white rounded">
                  Take Initial Survey
                </button>
                <button className="w-full py-2 border border-gray-300 rounded">
                  View Family Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;