import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, PlusCircle, CheckCircle, AlertCircle, Upload, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFamily } from '../../contexts/FamilyContext';

export const FamilySelectionScreen = () => {
  const { currentUser } = useAuth();
  const { 
    familyMembers, 
    selectedUser, 
    selectFamilyMember, 
    updateMemberProfile 
  } = useFamily();
  
  const navigate = useNavigate();
  
  const [showProfileUpload, setShowProfileUpload] = useState(false);
  const [uploadForMember, setUploadForMember] = useState(null);
  
  const handleSelectForUpload = (member, e) => {
    e.stopPropagation();
    setUploadForMember(member);
    setShowProfileUpload(true);
  };
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && uploadForMember) {
      // In a real app with Firebase Storage, you would upload the file
      // For this demo, we'll use a local URL
      const imageUrl = URL.createObjectURL(file);
      updateMemberProfile(uploadForMember.id, { profilePicture: imageUrl });
      setShowProfileUpload(false);
    }
  };

  const handleSelectUser = (member) => {
    selectFamilyMember(member);
    
    // Navigate to the appropriate screen based on survey completion
    if (member.completed) {
      navigate('/dashboard');
    } else {
      navigate('/survey');
    }
  };

  // Get the next action for a family member
  const getNextAction = (member) => {
    if (!member.completed) {
      return {
        text: "Initial survey needed",
        icon: <AlertCircle size={12} className="mr-1" />,
        className: "text-amber-600"
      };
    }
    
    // If they've completed the initial survey, check weekly survey status
    const latestWeeklyCheckIn = member.weeklyCompleted && member.weeklyCompleted.length > 0 
      ? member.weeklyCompleted[member.weeklyCompleted.length - 1]
      : null;
      
    if (!latestWeeklyCheckIn || !latestWeeklyCheckIn.completed) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (7 - dueDate.getDay())); // Next Sunday
      
      return {
        text: `Complete weekly check-in by ${dueDate.toLocaleDateString()}`,
        icon: <Calendar size={12} className="mr-1" />,
        className: "text-blue-600"
      };
    }
    
    return {
      text: "All tasks completed",
      icon: <CheckCircle size={12} className="mr-1" />,
      className: "text-green-600"
    };
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-800 mb-2">ParentLoad</h1>
            <p className="text-gray-600">
              Who are you in the family? Select your profile to begin.
            </p>
          </div>

          {/* Family member selection */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-center">Choose Your Profile</h2>
              
            <div className="grid grid-cols-1 gap-4">
              {familyMembers.map((member) => (
                <div 
                  key={member.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedUser?.id === member.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => handleSelectUser(member)}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-4 relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-200">
                        <img 
                          src={member.profilePicture} 
                          alt={`${member.name}'s profile`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full"
                        onClick={(e) => handleSelectForUpload(member, e)}
                      >
                        <Camera size={12} />
                      </button>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{member.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{member.role}</p>
                      <div className="mt-1">
                        {/* Showing next action instead of completion status */}
                        <span className={`text-xs flex items-center ${getNextAction(member).className}`}>
                          {getNextAction(member).icon}
                          {getNextAction(member).text}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="text-center space-y-4">
            <button 
              disabled={!selectedUser}
              onClick={() => selectedUser && handleSelectUser(selectedUser)}
              className={`w-full py-3 px-4 rounded-md font-medium text-white ${
                selectedUser 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-blue-300 cursor-not-allowed'
              }`}
            >
              {selectedUser 
                ? `Continue as ${selectedUser.name}` 
                : "Select your profile to continue"}
            </button>
              
            <button
              onClick={() => navigate('/signup')}
              className="w-full py-3 px-4 rounded-md font-medium text-blue-600 border border-blue-600 hover:bg-blue-50 flex items-center justify-center"
            >
              <PlusCircle size={16} className="mr-2" />
              Create New Family
            </button>
          </div>
        </div>
      </div>

      {/* Progress summary */}
      <div className="p-4 border-t bg-white">
        <div className="w-full max-w-md mx-auto">
          <h3 className="font-medium mb-2 text-center">Family Progress</h3>
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-sm text-center mb-2">
              All family members must complete the initial survey to generate reports
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Completed:</span>
              <div className="flex gap-1">
                {familyMembers.map(member => (
                  <div 
                    key={member.id} 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                      member.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                    }`}
                    title={`${member.name}: ${member.completed ? 'Completed' : 'Not completed'}`}
                  >
                    {member.completed ? '✓' : member.name.charAt(0)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center text-sm text-gray-500">
        <p>ParentLoad v1.0 - Balancing family responsibilities together</p>
      </div>

      {/* Profile picture upload modal */}
      {showProfileUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium mb-4">Update Profile Picture</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select a new photo for {uploadForMember?.name}
            </p>
              
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-200">
                <img 
                  src={uploadForMember?.profilePicture} 
                  alt="Current profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
              
            <div className="flex items-center justify-center mb-4">
              <label className="flex flex-col items-center px-4 py-2 bg-blue-50 text-blue-700 rounded cursor-pointer border border-blue-300">
                <Upload size={18} className="mb-1" />
                <span className="text-sm">Select Photo</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
              
            <div className="flex justify-end">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => setShowProfileUpload(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilySelectionScreen;