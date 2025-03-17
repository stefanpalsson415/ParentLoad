// src/components/onboarding/FamilyConfirmationStep.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Edit2, ArrowRight, User, Star, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const FamilyConfirmationStep = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { createFamily } = useAuth();
  const [familyData, setFamilyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Load family data on mount
  // In src/components/onboarding/FamilyConfirmationStep.jsx
// Around line 20-30 in the useEffect for loading family data

useEffect(() => {
    // Add debug logging
    console.log("FamilyConfirmationStep checking for family data...");
    console.log("Location state:", location.state);
    
    // Try to get data from location state first (from payment screen)
    if (location.state?.familyData) {
      console.log("Using family data from location state:", {
        familyName: location.state.familyData.familyName,
        hasParentData: !!location.state.familyData.parentData,
        parentCount: location.state.familyData.parentData?.length || 0
      });
      setFamilyData(location.state.familyData);
      return;
    }
    
    // Fall back to localStorage
    const storedData = localStorage.getItem('pendingFamilyData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log("Loaded family data from localStorage:", {
          familyName: parsedData.familyName,
          hasParentData: !!parsedData.parentData,
          parentCount: parsedData.parentData?.length || 0
        });
        setFamilyData(parsedData);
      } catch (e) {
        console.error("Error parsing family data:", e);
        setError("We couldn't load your family information. Please try again.");
      }
    } else {
      console.error("No family data found in location state or localStorage");
      setError("No family information found. Please return to the previous steps.");
    }
  }, [location]);

  const handleConfirm = async () => {
    if (!familyData) {
      setError("No family data available");
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Create the family using the Auth context
      const result = await createFamily(familyData);
      
      if (result) {
        console.log("Family created successfully:", result.familyId);
        // Clear localStorage since we've created the family
        localStorage.removeItem('pendingFamilyData');
        
        // Navigate to dashboard
        navigate('/dashboard', { 
          state: { 
            familyId: result.familyId,
            newFamily: true
          }
        });
      } else {
        throw new Error("Failed to create family");
      }
    } catch (err) {
      console.error("Error creating family:", err);
      setError(err.message || "An error occurred creating your family. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!familyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-roboto">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Loading Family Information</h2>
          {error ? (
            <>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => navigate('/onboarding')}
                className="w-full py-3 bg-black text-white rounded-lg"
              >
                Return to Onboarding
              </button>
            </>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 font-roboto">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Confirm Your Family Details</h1>
          <p className="text-lg text-gray-600">
            Review your family information before finalizing your setup
          </p>
        </div>
        
        {/* Family Preview Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-10">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{familyData.familyName} Family</h2>
              <p className="text-gray-500">Ready to start your balance journey</p>
            </div>
            {location.state?.fromPayment && (
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                Payment Complete
              </div>
            )}
          </div>
          
          <div className="p-6 space-y-8">
            {/* Parents Section */}
<div>
  <h3 className="text-lg font-medium mb-4 flex items-center">
    <User className="mr-2 text-blue-500" size={20} />
    Parents
  </h3>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {familyData.parentData && Array.isArray(familyData.parentData) && familyData.parentData.map((parent, index) => (
      <div key={index} className="flex items-center p-4 bg-blue-50 rounded-lg">
        {/* existing code */}
      </div>
    ))}
    
    {/* Emergency fallback display if parentData isn't formatted correctly */}
    {(!familyData.parentData || !Array.isArray(familyData.parentData)) && (
      <div className="p-4 bg-yellow-50 rounded-lg">
        <p>Parent information may need to be re-entered.</p>
        <p className="text-sm text-gray-600">Parent data format issue detected.</p>
      </div>
    )}
  </div>
</div>
            
            {/* Children Section */}
            {familyData.childrenData && familyData.childrenData.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <User className="mr-2 text-green-500" size={20} />
                  Children
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {familyData.childrenData.map((child, index) => (
                    <div key={index} className="flex items-center p-4 bg-green-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <User className="text-green-600" size={16} />
                      </div>
                      <div>
                        <p className="font-medium">{child.name}</p>
                        <p className="text-sm text-gray-600">
                          {child.age ? `Age: ${child.age}` : 'Child'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Priorities Section */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Star className="mr-2 text-amber-500" size={20} />
                Family Priorities
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
            
            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => navigate('/onboarding')}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center"
              >
                <Edit2 size={18} className="mr-2" />
                Edit Information
              </button>
              
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 py-3 px-4 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Family...
                  </>
                ) : (
                  <>
                    Confirm & Start Journey
                    <ArrowRight size={18} className="ml-2" />
                  </>
                )}
              </button>
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg mt-4">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyConfirmationStep;