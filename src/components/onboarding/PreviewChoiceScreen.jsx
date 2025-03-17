import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Star, BarChart, CheckCircle, Heart, Shield, ChevronRight, Pencil, Save, X } from 'lucide-react';

const PreviewChoiceScreen = () => {
  const navigate = useNavigate();
  const [familyData, setFamilyData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedMembers, setEditedMembers] = useState([]);
  
  useEffect(() => {
    // Try to get data from localStorage
    try {
      const savedData = localStorage.getItem('pendingFamilyData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setFamilyData(parsedData);
        setEditedMembers(parsedData.familyMembers || []);
      }
    } catch (e) {
      console.error("Error loading family data:", e);
    }
  }, []);

  const handleGetStarted = () => {
    navigate('/payment', { 
      state: { familyData } 
    });
  };

  const handleMiniAssessment = () => {
    navigate('/mini-survey');
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Discard changes if canceling
      setEditedMembers(familyData.familyMembers || []);
    }
    setEditMode(!editMode);
  };

  const handleSaveChanges = () => {
    const updatedFamilyData = {
      ...familyData,
      familyMembers: editedMembers
    };
    
    // Update state
    setFamilyData(updatedFamilyData);
    
    // Save to localStorage
    localStorage.setItem('pendingFamilyData', JSON.stringify(updatedFamilyData));
    
    // Exit edit mode
    setEditMode(false);
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...editedMembers];
    updatedMembers[index] = {
      ...updatedMembers[index],
      [field]: value
    };
    setEditedMembers(updatedMembers);
  };

  // Filter family members
  const parents = (editMode ? editedMembers : familyData?.familyMembers)?.filter(member => member.role === 'parent') || [];
  const children = (editMode ? editedMembers : familyData?.familyMembers)?.filter(member => member.role === 'child') || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Your Family Profile</h1>
        <p className="text-center text-gray-600 mb-8">
          Based on your inputs, here's a preview of how Allie can help balance your family responsibilities
        </p>
        
        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          {/* Family Name */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold">{familyData?.familyName || 'Your'} Family</h2>
            <p className="text-gray-600">Family balance assessment</p>
          </div>
          
          {/* Family Members - Always visible */}
          <div className="border-b pb-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-lg font-medium">
                <User size={20} className="text-blue-500 mr-2" />
                <span>Family Members</span>
              </div>
              <button 
                className="text-sm flex items-center text-blue-600 hover:text-blue-800"
                onClick={handleEditToggle}
              >
                {editMode ? (
                  <>
                    <X size={16} className="mr-1" /> Cancel
                  </>
                ) : (
                  <>
                    <Pencil size={16} className="mr-1" /> Edit
                  </>
                )}
              </button>
            </div>
            
            <div className="pl-8">
              {/* Parents */}
              {parents.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Parents</h4>
                  <ul className="space-y-3">
                    {parents.map((parent, index) => (
                      <li key={index} className={`${editMode ? 'p-3 border rounded-lg' : ''}`}>
                        {editMode ? (
                          <div className="space-y-2">
                            <div>
                              <label className="block text-sm text-gray-600">Name</label>
                              <input
                                type="text"
                                className="w-full p-2 border rounded"
                                value={parent.name}
                                onChange={(e) => handleMemberChange(
                                  editedMembers.indexOf(parent),
                                  'name',
                                  e.target.value
                                )}
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600">Role</label>
                              <select
                                className="w-full p-2 border rounded"
                                value={parent.roleType}
                                onChange={(e) => handleMemberChange(
                                  editedMembers.indexOf(parent),
                                  'roleType',
                                  e.target.value
                                )}
                              >
                                <option value="Mama">Mama</option>
                                <option value="Papa">Papa</option>
                                <option value="Parent">Parent</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600">Email</label>
                              <input
                                type="email"
                                className="w-full p-2 border rounded"
                                value={parent.email}
                                onChange={(e) => handleMemberChange(
                                  editedMembers.indexOf(parent),
                                  'email',
                                  e.target.value
                                )}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                              <User size={14} className="text-blue-600" />
                            </div>
                            <div>
                              <span className="font-medium">{parent.name}</span>
                              <span className="text-sm text-gray-500 ml-2">({parent.roleType})</span>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Children */}
              {children.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Children</h4>
                  <ul className="space-y-3">
                    {children.map((child, index) => (
                      <li key={index} className={`${editMode ? 'p-3 border rounded-lg' : ''}`}>
                        {editMode ? (
                          <div className="space-y-2">
                            <div>
                              <label className="block text-sm text-gray-600">Name</label>
                              <input
                                type="text"
                                className="w-full p-2 border rounded"
                                value={child.name}
                                onChange={(e) => handleMemberChange(
                                  editedMembers.indexOf(child),
                                  'name',
                                  e.target.value
                                )}
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600">Age</label>
                              <input
                                type="text"
                                className="w-full p-2 border rounded"
                                value={child.age || ''}
                                onChange={(e) => handleMemberChange(
                                  editedMembers.indexOf(child),
                                  'age',
                                  e.target.value
                                )}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                              <User size={14} className="text-green-600" />
                            </div>
                            <div>
                              <span className="font-medium">{child.name}</span>
                              {child.age && <span className="text-sm text-gray-500 ml-2">({child.age} years)</span>}
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Save button - only show when editing */}
              {editMode && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleSaveChanges}
                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    <Save size={16} className="mr-1" /> Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Family Priorities */}
          <div className="border-b pb-6 mb-6">
            <div className="flex items-center text-lg font-medium mb-4">
              <Star size={20} className="text-amber-400 mr-2" />
              <span>Your Family Priorities</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="font-medium">Highest Priority</h4>
                <p className="text-gray-700">{familyData?.priorities?.highestPriority || 'Invisible Parental Tasks'}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium">Secondary Priority</h4>
                <p className="text-gray-700">{familyData?.priorities?.secondaryPriority || 'Visible Parental Tasks'}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium">Tertiary Priority</h4>
                <p className="text-gray-700">{familyData?.priorities?.tertiaryPriority || 'Invisible Household Tasks'}</p>
              </div>
            </div>
          </div>
          
          {/* What Allie Provides */}
          <div>
            <h3 className="text-lg font-medium mb-4">What Allie Provides For Your Family</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Balance Analytics */}
              <div className="flex">
                <div className="mr-3 text-blue-500">
                  <BarChart size={24} />
                </div>
                <div>
                  <h4 className="font-medium">Balance Analytics</h4>
                  <p className="text-gray-600">Scientific workload measurement</p>
                </div>
              </div>
              
              {/* AI-Powered Tasks */}
              <div className="flex">
                <div className="mr-3 text-green-500">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <h4 className="font-medium">AI-Powered Tasks</h4>
                  <p className="text-gray-600">Personalized recommendations</p>
                </div>
              </div>
              
              {/* Relationship Insights */}
              <div className="flex">
                <div className="mr-3 text-red-500">
                  <Heart size={24} />
                </div>
                <div>
                  <h4 className="font-medium">Relationship Insights</h4>
                  <p className="text-gray-600">Strengthen your partnership</p>
                </div>
              </div>
              
              {/* Private & Secure */}
              <div className="flex">
                <div className="mr-3 text-purple-500">
                  <Shield size={24} />
                </div>
                <div>
                  <h4 className="font-medium">Private & Secure</h4>
                  <p className="text-gray-600">Your family data stays private</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <button 
            onClick={handleGetStarted}
            className="flex items-center justify-center py-3 bg-black text-white rounded-md text-lg font-medium md:w-1/2"
          >
            Get Started with Allie <ChevronRight size={20} className="ml-2" />
          </button>
          <button 
            onClick={handleMiniAssessment}
            className="flex items-center justify-center py-3 border border-gray-300 rounded-md text-lg font-medium md:w-1/2"
          >
            Try Mini Assessment First
          </button>
        </div>
        
        <p className="text-center text-gray-500">
          Not sure yet? Try our quick mini assessment to see if Allie is right for your family.
        </p>
      </div>
    </div>
  );
};

export default PreviewChoiceScreen;