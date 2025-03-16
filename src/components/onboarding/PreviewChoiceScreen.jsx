// src/components/onboarding/PreviewChoiceScreen.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, CheckCircle, Heart, User, ArrowRight, Shield, Star } from 'lucide-react';

const PreviewChoiceScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [familyData, setFamilyData] = useState(null);
  
  // Extract family data from location state
  useEffect(() => {
    if (location.state?.familyData) {
      setFamilyData(location.state.familyData);
    } else {
      // Try to get from localStorage as fallback
      const storedData = localStorage.getItem('pendingFamilyData');
      if (storedData) {
        try {
          setFamilyData(JSON.parse(storedData));
        } catch (e) {
          console.error("Error parsing stored family data:", e);
        }
      }
    }
  }, [location]);

  // Store family data in localStorage for other screens to access
  useEffect(() => {
    if (familyData) {
      localStorage.setItem('pendingFamilyData', JSON.stringify(familyData));
    }
  }, [familyData]);

  // Navigate to payment screen
  const handleSignUp = () => {
    navigate('/payment', { 
      state: { 
        fromPreview: true,
        familyData: familyData
      } 
    });
  };

  // Navigate to mini survey
  const handleTryMiniSurvey = () => {
    navigate('/mini-survey', { 
      state: { 
        fromPreview: true,
        familyData: familyData
      } 
    });
  };

  // If no family data is available
  if (!familyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">No Family Data Available</h2>
          <p className="text-gray-600 mb-6">We couldn't find your family information. Let's start over.</p>
          <button
            onClick={() => navigate('/onboarding')}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Restart Onboarding
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Family Profile</h1>
          <p className="text-lg text-gray-600">
            Based on your inputs, here's a preview of how Allie can help balance your family responsibilities
          </p>
        </div>
        
        {/* Family Preview Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-10">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-1">{familyData.familyName} Family</h2>
            <p className="text-gray-500">Family balance assessment</p>
          </div>
          
          <div className="p-6">
            {/* Parents Section */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <User className="mr-2 text-blue-500" size={20} />
                Family Members
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Display Parents */}
                {familyData.parentData && familyData.parentData.map((parent, index) => (
                  <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <User className="text-blue-600" size={16} />
                    </div>
                    <div>
                      <p className="font-medium">{parent.name}</p>
                      <p className="text-sm text-gray-600">{parent.role}</p>
                    </div>
                  </div>
                ))}
                
                {/* Display Children */}
                {familyData.childrenData && familyData.childrenData.map((child, index) => (
                  <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <User className="text-green-600" size={16} />
                    </div>
                    <div>
                      <p className="font-medium">{child.name}</p>
                      <p className="text-sm text-gray-600">
                        {child.age ? `Child, ${child.age} years old` : 'Child'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Priorities Section */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <Star className="mr-2 text-amber-500" size={20} />
                Your Family Priorities
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {familyData.priorities && (
                  <>
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <p className="font-medium">Highest Priority</p>
                      <p className="text-sm text-gray-600">{familyData.priorities.highestPriority}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium">Secondary Priority</p>
                      <p className="text-sm text-gray-600">{familyData.priorities.secondaryPriority}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="font-medium">Tertiary Priority</p>
                      <p className="text-sm text-gray-600">{familyData.priorities.tertiaryPriority}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Key Features Preview */}
            <div>
              <h3 className="text-lg font-medium mb-3">What Allie Provides For Your Family</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <BarChart3 className="text-blue-500 mt-1 mr-3 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-medium">Balance Analytics</p>
                    <p className="text-sm text-gray-600">Scientific workload measurement</p>
                  </div>
                </div>
                
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-medium">AI-Powered Tasks</p>
                    <p className="text-sm text-gray-600">Personalized recommendations</p>
                  </div>
                </div>
                
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <Heart className="text-red-500 mt-1 mr-3 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-medium">Relationship Insights</p>
                    <p className="text-sm text-gray-600">Strengthen your partnership</p>
                  </div>
                </div>
                
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <Shield className="text-purple-500 mt-1 mr-3 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-medium">Private & Secure</p>
                    <p className="text-sm text-gray-600">Your family data stays private</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
          <button
            onClick={handleSignUp}
            className="flex-1 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center font-semibold"
          >
            Get Started with Allie
            <ArrowRight className="ml-2" size={18} />
          </button>
          
          <button
            onClick={handleTryMiniSurvey}
            className="flex-1 py-4 bg-white border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center font-semibold"
          >
            Try Mini Assessment First
          </button>
        </div>
        
        <p className="text-center text-gray-500 mt-6 text-sm">
          Not sure yet? Try our quick mini assessment to see if Allie is right for your family.
        </p>
      </div>
    </div>
  );
};

export default PreviewChoiceScreen;