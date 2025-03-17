import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, PlusCircle, CheckCircle, AlertCircle, Upload, Calendar, Mail, Lock, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFamily } from '../../contexts/FamilyContext';
import { storage } from '../../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const FamilySelectionScreen = () => {
  const { currentUser, availableFamilies, loadFamilyData, familyData, login, logout, loadAllFamilies } = useAuth();
  const { 
    familyMembers, 
    selectedUser, 
    selectFamilyMember, 
    updateMemberProfile 
  } = useFamily();
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [showProfileUpload, setShowProfileUpload] = useState(false);
  const [uploadForMember, setUploadForMember] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [localFamilyMembers, setLocalFamilyMembers] = useState([]);

  // Handle selecting a user from the family
  const handleSelectUser = (member) => {
    // Log the selection for debugging
    console.log("User selected:", member);
    
    // Store selection in localStorage directly
    try {
      localStorage.setItem('selectedMemberId', member.id);
      localStorage.setItem('selectedMemberName', member.name);
      localStorage.setItem('selectedMemberRole', member.role);
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
    
    // Force navigation based on completion status
    if (member.completed) {
      console.log("User has completed survey, redirecting to dashboard");
      // Direct browser navigation as a fallback
      window.location.href = '/dashboard';
    } else {
      console.log("User has not completed survey, redirecting to survey");
      // Direct browser navigation as a fallback
      window.location.href = '/survey';
    }
  };
  
  // Effect to check for direct navigation
  useEffect(() => {
    console.log("Location state:", location.state);
    
    // Handle direct access from payment screen
    if (location.state?.directAccess && location.state?.fromPayment && location.state?.familyData) {
      console.log("DIRECT ACCESS from payment page with family data");
      
      // Extract family data passed from payment
      const incomingFamilyData = location.state.familyData;
      console.log("Family data received:", incomingFamilyData);
      
      // If we have parent data, construct family members from it
      if (incomingFamilyData.parentData && incomingFamilyData.parentData.length > 0) {
        // Create family members array from parent data and child data
        const constructedMembers = [
          ...incomingFamilyData.parentData.map(parent => ({
            id: parent.id || `parent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: parent.name,
            role: 'parent',
            roleType: parent.role,
            email: parent.email,
            completed: false,
            profilePicture: '/api/placeholder/150/150'
          }))
        ];
        
        // Add children if available
        if (incomingFamilyData.childrenData && incomingFamilyData.childrenData.length > 0) {
          constructedMembers.push(
            ...incomingFamilyData.childrenData.map(child => ({
              id: child.id || `child-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: child.name,
              role: 'child',
              age: child.age,
              completed: false,
              profilePicture: '/api/placeholder/150/150'
            }))
          );
        }
        
        // Set the family members
        if (constructedMembers.length > 0) {
          setLocalFamilyMembers(constructedMembers);
          console.log("Set local family members:", constructedMembers);
        }
        
        // Store family ID for later use if available
        if (incomingFamilyData.familyId) {
          try {
            localStorage.setItem('selectedFamilyId', incomingFamilyData.familyId);
          } catch (e) {
            console.error("Error saving family ID to localStorage:", e);
          }
        }
      }
      // If we have family members directly, use those
      else if (incomingFamilyData.familyMembers && incomingFamilyData.familyMembers.length > 0) {
        setLocalFamilyMembers(incomingFamilyData.familyMembers);
        console.log("Set family members directly:", incomingFamilyData.familyMembers);
        
        // Store family ID for later use
        try {
          localStorage.setItem('selectedFamilyId', incomingFamilyData.familyId);
        } catch (e) {
          console.error("Error saving family ID to localStorage:", e);
        }
      }
    }
    // Original direct access from landing page
    else if (location.state?.directAccess && location.state?.fromLanding) {
      console.log("DIRECT ACCESS from landing page");
      
      // Only load if needed
      if (!selectedUser || !familyMembers || familyMembers.length === 0) {
        // Let's make sure we load the family data correctly
        loadAllFamilies(currentUser?.uid)
          .then(families => {
            if (families && families.length > 0) {
              return loadFamilyData(families[0].familyId);
            }
          })
          .then(() => {
            console.log("Family loaded successfully for direct access");
          })
          .catch(error => console.error("Error loading family:", error));
      }
    }
  }, [location, loadAllFamilies, loadFamilyData, currentUser]);

  // Sync family members from context
  useEffect(() => {
    if (familyMembers && familyMembers.length > 0) {
      console.log("Syncing family members from context:", familyMembers);
      setLocalFamilyMembers(familyMembers);
    }
  }, [familyMembers]);

  // Effect to update login form visibility based on auth state
  useEffect(() => {
    if (currentUser) {
      setShowLoginForm(false);
    } else {
      setShowLoginForm(true);
    }
  }, [currentUser]);
  
  // Effect to update empty state visibility based on whether we have family members
  useEffect(() => {
    console.log("Current user:", currentUser);
    console.log("Family members:", familyMembers);
    console.log("Local family members:", localFamilyMembers);
    console.log("Available families:", availableFamilies);
    
    if (currentUser && localFamilyMembers.length === 0 && familyMembers.length === 0 && availableFamilies.length === 0) {
      // Only show empty state if there are truly no families
      setShowEmptyState(true);
    } else {
      setShowEmptyState(false);
    }
    
    // Auto-redirect to onboarding if logged in with no families
    // but only if we're not in the process of logging in
    if (currentUser && availableFamilies.length === 0 && localFamilyMembers.length === 0 && familyMembers.length === 0 && !isLoggingIn) {
      console.log("No families found, redirecting to onboarding");
      navigate('/onboarding');
    }
  }, [currentUser, familyMembers, localFamilyMembers, availableFamilies, navigate, isLoggingIn]);
  
  // Get default profile image based on role
  const getDefaultProfileImage = (member) => {
    if (!member || !member.profilePicture) {
      if (member && member.role === 'parent') {
        return member.roleType === 'Mama' 
          ? 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyOCIgZmlsbD0iI2U5YjFkYSIvPjxjaXJjbGUgY3g9IjEyOCIgY3k9IjkwIiByPSI0MCIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0yMTUsMTcyLjVjMCwzNS05NSwzNS05NSwzNXMtOTUsMC05NS0zNWMwLTIzLjMsOTUtMTAsOTUtMTBTMjE1LDE0OS4yLDIxNSwxNzIuNVoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=' 
          : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyOCIgZmlsbD0iIzg0YzRlMiIvPjxjaXJjbGUgY3g9IjEyOCIgY3k9IjkwIiByPSI0MCIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0yMTUsMTcyLjVjMCwzNS05NSwzNS05NSwzNXMtOTUsMC05NS0zNWMwLTIzLjMsOTUtMTAsOTUtMTBTMjE1LDE0OS4yLDIxNSwxNzIuNVoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=';
      } else {
        // Child icon
        return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyOCIgZmlsbD0iI2ZkZTY4YSIvPjxjaXJjbGUgY3g9IjEyOCIgY3k9IjkwIiByPSI0MCIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0yMTUsMTcyLjVjMCwzNS05NSwzNS05NSwzNXMtOTUsMC05NS0zNWMwLTIzLjMsOTUtMTAsOTUtMTBTMjE1LDE0OS4yLDIxNSwxNzIuNVoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=';
      }
    }
    return member.profilePicture;
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
  
  // Profile picture upload functions
  const handleSelectForUpload = (member, e) => {
    e.stopPropagation();
    setUploadForMember(member);
    setShowProfileUpload(true);
  };
  
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file && uploadForMember) {
      handleImageFile(file);
    }
  };
  
  const handleImageFile = async (file) => {
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `profiles/${uploadForMember.id}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(snapshot.ref);
      await updateMemberProfile(uploadForMember.id, { profilePicture: imageUrl });
      setShowProfileUpload(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      let errorMessage = "Failed to upload image. Please try again.";
      
      if (error.code === 'storage/unauthorized') {
        errorMessage = "You don't have permission to upload files.";
      } else if (error.code === 'storage/canceled') {
        errorMessage = "Upload was canceled.";
      } else if (error.code === 'storage/unknown') {
        errorMessage = "An unknown error occurred during upload.";
      }
      
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Camera capture function
  const openCameraCapture = () => {
    const videoElement = document.createElement('video');
    const canvasElement = document.createElement('canvas');
    
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoElement.srcObject = stream;
        videoElement.play();
        
        // Create camera UI
        const cameraModal = document.createElement('div');
        cameraModal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
        
        const cameraContainer = document.createElement('div');
        cameraContainer.className = 'bg-white p-4 rounded-lg max-w-md w-full';
        
        const title = document.createElement('h3');
        title.textContent = 'Take a Profile Picture';
        title.className = 'text-lg font-medium mb-4';
        
        const videoContainer = document.createElement('div');
        videoContainer.className = 'relative mb-4';
        videoContainer.appendChild(videoElement);
        videoElement.className = 'w-full rounded';
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'flex justify-between';
        
        const captureButton = document.createElement('button');
        captureButton.textContent = 'Take Photo';
        captureButton.className = 'px-4 py-2 bg-black text-white rounded';
        
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.className = 'px-4 py-2 border rounded';
        
        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(captureButton);
        
        cameraContainer.appendChild(title);
        cameraContainer.appendChild(videoContainer);
        cameraContainer.appendChild(buttonContainer);
        cameraModal.appendChild(cameraContainer);
        
        document.body.appendChild(cameraModal);
        
        // Handle capture
        captureButton.addEventListener('click', () => {
          // Set canvas dimensions to match video
          canvasElement.width = videoElement.videoWidth;
          canvasElement.height = videoElement.videoHeight;
          
          // Draw current video frame to canvas
          canvasElement.getContext('2d').drawImage(
            videoElement, 0, 0, canvasElement.width, canvasElement.height
          );
          
          // Convert to blob
          canvasElement.toBlob(blob => {
            // Stop all tracks to close camera
            videoElement.srcObject.getTracks().forEach(track => track.stop());
            
            // Remove modal
            document.body.removeChild(cameraModal);
            
            // Process the image blob
            const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
            handleImageFile(file);
          }, 'image/jpeg');
        });
        
        // Handle cancel
        cancelButton.addEventListener('click', () => {
          // Stop all tracks to close camera
          videoElement.srcObject.getTracks().forEach(track => track.stop());
          
          // Remove modal
          document.body.removeChild(cameraModal);
        });
      })
      .catch(error => {
        console.error("Error accessing camera:", error);
        alert("Could not access camera. Please check permissions or use file upload instead.");
      });
  };
  
  // Login and logout functions
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    
    try {
      const user = await login(email, password);
      console.log("Login successful:", user);
  
      // Add a short delay to ensure auth state propagates
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Explicitly load all families
      const families = await loadAllFamilies(user.uid);
      console.log("Loaded families:", families);
  
      // If families exist, load the first one to populate familyMembers
      if (families && families.length > 0) {
        console.log("Loading first family:", families[0].familyId);
        const familyData = await loadFamilyData(families[0].familyId);
        
        // Store selected family ID for persistence
        try {
          localStorage.setItem('selectedFamilyId', families[0].familyId);
        } catch (e) {
          console.error("Error saving family ID to localStorage:", e);
        }
  
        // If we successfully loaded a family, update UI
        if (familyData) {
          console.log("Successfully loaded family data:", familyData);
          setShowLoginForm(false);
        }
      } else {
        // If no families found, redirect to onboarding
        console.log("No families found, redirecting to onboarding");
        navigate('/onboarding');
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError('Invalid email or password. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      setShowLoginForm(true);
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  // Login Form UI
  const renderLoginForm = () => {
    return (
      <div className="min-h-screen bg-white flex flex-col font-roboto">
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* Header with Logout */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-black font-roboto">Allie</h1>
              <button 
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center font-roboto"
              >
                <LogOut size={16} className="mr-1" />
                Log Out
              </button>
            </div>
              
              {/* Login Form */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-center font-roboto">Log In</h2>
                
                {loginError && (
                  <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm font-roboto">
                    {loginError}
                  </div>
                )}
                
                <form onSubmit={handleLogin} className="font-roboto">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="flex border rounded-md overflow-hidden">
                        <div className="bg-gray-100 p-2 flex items-center justify-center">
                          <Mail size={18} className="text-gray-500" />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="flex-1 p-2 focus:outline-none font-roboto"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <div className="flex border rounded-md overflow-hidden">
                        <div className="bg-gray-100 p-2 flex items-center justify-center">
                          <Lock size={18} className="text-gray-500" />
                        </div>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="flex-1 p-2 focus:outline-none font-roboto"
                          placeholder="Enter your password"
                          required
                        />
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center justify-center font-roboto"
                    >
                      {isLoggingIn ? (
                        <>
                          <div className="mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Logging in...
                        </>
                      ) : (
                        'Log In'
                      )}
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Create New Family Button */}
              <button
                onClick={() => navigate('/onboarding')}
                className="w-full py-3 px-4 rounded-md font-medium text-black border border-black hover:bg-gray-50 flex items-center justify-center font-roboto"
              >
                <PlusCircle size={16} className="mr-2" />
                Create New Family
              </button>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-4 text-center text-sm text-gray-500 font-roboto">
            <p>Allie v1.0 - Balance family responsibilities together</p>
          </div>
        </div>
    );
  };
  
  // Empty state UI for when there are no families
  const renderEmptyState = () => {
    return (
      <div className="min-h-screen bg-white flex flex-col font-roboto">
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-black mb-2 font-roboto">Allie</h1>
              <p className="text-gray-600 font-roboto">
                Welcome to Allie, your family workload balancer
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-center font-roboto">No Families Found</h2>
              <p className="text-center text-gray-600 mb-6 font-roboto">
                It looks like you don't have any families set up yet. Would you like to create one?
              </p>
              
              <button
                onClick={() => navigate('/onboarding')}
                className="w-full py-3 px-4 rounded-md font-medium text-white bg-black hover:bg-gray-800 flex items-center justify-center font-roboto"
              >
                <PlusCircle size={16} className="mr-2" />
                Create New Family
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full mt-4 py-3 px-4 rounded-md font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center justify-center font-roboto"
              >
                <LogOut size={16} className="mr-2" />
                Log Out
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4 text-center text-sm text-gray-500 font-roboto">
          <p>Allie v1.0 - Balance family responsibilities together</p>
        </div>
      </div>
    );
  };
  
  // If showing login form, render it
  if (showLoginForm) {
    return renderLoginForm();
  }
  
  // If there are no family members, show empty state
  if (showEmptyState) {
    return renderEmptyState();
  }
  
  // Normal profile selection view
  return (
    <div className="min-h-screen bg-white flex flex-col font-roboto">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Header with Logout */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-black font-roboto">Allie</h1>
            <button 
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center font-roboto"
            >
              <LogOut size={16} className="mr-1" />
              Log Out
            </button>
          </div>
          
          <p className="text-gray-600 text-center mb-6 font-roboto">
            Who are you in the family? Select your profile to begin.
          </p>

          {/* Family member selection */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-center font-roboto">Choose Your Profile</h2>
              
            <div className="grid grid-cols-1 gap-4">
              {console.log("Rendering family members:", localFamilyMembers)}
              {console.log("Context family members:", familyMembers)}
              {(localFamilyMembers.length > 0 || familyMembers.length > 0) ? (
                (localFamilyMembers.length > 0 ? localFamilyMembers : familyMembers).map((member) => (
                  <div 
                    key={member.id || member.name}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedUser?.id === member.id 
                        ? 'border-black bg-gray-50' 
                        : 'border-gray-200 hover:border-gray-900'
                    }`}
                    onClick={() => handleSelectUser(member)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-4 relative">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 relative">
                          <img 
                            src={getDefaultProfileImage(member)} 
                            alt={`${member.name}'s profile`}
                            className="w-full h-full object-cover"
                          />
                          {!member.profilePicture && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center p-1 text-white">
                              <span className="text-xs font-bold">Add a pic!</span>
                              <span className="text-[7px]">It's better!</span>
                            </div>
                          )}
                        </div>
                        <button
                          className="absolute bottom-0 right-0 bg-black text-white p-1 rounded-full"
                          onClick={(e) => handleSelectForUpload(member, e)}
                        >
                          <Camera size={12} />
                        </button>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-lg font-roboto">{member.name}</h3>
                        <p className="text-sm text-gray-500 capitalize font-roboto">{member.role}</p>
                        <div className="mt-1">
                          <span className={`text-xs flex items-center ${getNextAction(member).className} font-roboto`}>
                            {getNextAction(member).icon}
                            {getNextAction(member).text}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-6 text-gray-500 font-roboto">
                  <p>No family members found. Please check your account or create a new family.</p>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="text-center space-y-4">
            <button 
              disabled={!selectedUser}
              onClick={() => selectedUser && handleSelectUser(selectedUser)}
              className={`w-full py-3 px-4 rounded-md font-medium text-white font-roboto ${
                selectedUser 
                  ? 'bg-black hover:bg-gray-800' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {selectedUser 
                ? `Continue as ${selectedUser.name}` 
                : "Select your profile to continue"}
            </button>
              
            <button
              onClick={() => navigate('/onboarding')}
              className="w-full py-3 px-4 rounded-md font-medium text-black border border-black hover:bg-gray-50 flex items-center justify-center font-roboto"
            >
              <PlusCircle size={16} className="mr-2" />
              Create New Family
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center text-sm text-gray-500 font-roboto">
        <p>Allie v1.0 - Balance family responsibilities together</p>
      </div>

      {/* Profile picture upload modal */}
      {showProfileUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full font-roboto">
            <h3 className="text-lg font-medium mb-4 font-roboto">Update Profile Picture</h3>
            <p className="text-sm text-gray-600 mb-4 font-roboto">
              Select a new photo for {uploadForMember?.name}
            </p>
              
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                <img 
                  src={uploadForMember?.profilePicture || getDefaultProfileImage(uploadForMember)} 
                  alt="Current profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
              
            <div className="flex items-center justify-center mb-4">
              {isUploading ? (
                <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded border border-gray-300 flex items-center font-roboto">
                  <div className="w-4 h-4 border-2 border-t-transparent border-black rounded-full animate-spin mr-2"></div>
                  <span className="text-sm font-roboto">Uploading...</span>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <label 
                    htmlFor="image-upload" 
                    className="flex flex-col items-center px-4 py-3 bg-gray-50 text-black rounded cursor-pointer border border-gray-300 hover:bg-gray-100 font-roboto"
                  >
                    <Upload size={20} className="mb-1" />
                    <span className="text-sm font-roboto">Upload Photo</span>
                    <input
                      id="image-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                  
                  <button
                    onClick={openCameraCapture}
                    className="flex flex-col items-center px-4 py-3 bg-blue-50 text-blue-700 rounded cursor-pointer border border-blue-300 hover:bg-blue-100 font-roboto"
                  >
                    <Camera size={20} className="mb-1" />
                    <span className="text-sm font-roboto">Take Photo</span>
                  </button>
                </div>
              )}
            </div>
              
            <div className="flex justify-end">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-roboto"
                onClick={() => setShowProfileUpload(false)}
                disabled={isUploading}
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