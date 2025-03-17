import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, CheckCircle, ArrowLeft } from 'lucide-react';

const FamilyConfirmationStep = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { createFamily } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [familyData, setFamilyData] = useState({
    familyName: '',
    parentData: [],
    childrenData: []
  });

  // Load data from location state or localStorage
  useEffect(() => {
    console.log("FamilyConfirmationStep - location state:", location.state);
    
    if (location?.state?.familyData) {
      // Data passed directly from previous step
      console.log("Using data from location state:", location.state.familyData);
      setFamilyData(location.state.familyData);
    } else {
      // Try to get data from localStorage
      const storedData = localStorage.getItem('pendingFamilyData');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          console.log("Using data from localStorage:", parsedData);
          setFamilyData(parsedData);
        } catch (e) {
          console.error("Error parsing stored family data:", e);
          setError("Could not retrieve your family data. Please try again.");
        }
      } else {
        console.error("No family data found in state or localStorage");
        setError("No family data found. Please start the setup process again.");
      }
    }
  }, [location]);

  // Handle confirmation and family creation
  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Creating family with data:", {
        familyName: familyData.familyName,
        parentCount: familyData.parentData?.length || 0,
        childrenCount: familyData.childrenData?.length || 0
      });
      
      // Validate data before proceeding
      if (!familyData.familyName) {
        throw new Error("Family name is required");
      }
      
      if (!familyData.parentData || !Array.isArray(familyData.parentData) || familyData.parentData.length === 0) {
        throw new Error("At least one parent is required");
      }
      
      // Create family
      const result = await createFamily(familyData);
      console.log("Family created successfully:", result);
      
      // Clear stored data
      localStorage.removeItem('pendingFamilyData');
      localStorage.removeItem('paymentCompleted');
      
      // Navigate to family selection screen
      navigate('/login', { state: { directAccess: true, fromConfirmation: true } });
    } catch (error) {
      console.error("Error creating family:", error);
      setError(error.message || "Error creating family. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-lg mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Confirm Your Family</h1>
          <p className="text-gray-600 mt-2">
            Review your family details before finalizing setup
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-6">Family Details</h2>
          
          <div className="mb-6 pb-4 border-b">
            <h3 className="text-lg font-medium mb-2">Family Name</h3>
            <p className="px-3 py-2 bg-gray-50 rounded">{familyData.familyName || 'Not specified'}</p>
          </div>
          
          {/* Parents Section */}
          <div className="mb-6 pb-4 border-b">
            <h3 className="text-lg font-medium mb-4">Parents</h3>
            
            {familyData.parentData && Array.isArray(familyData.parentData) && familyData.parentData.length > 0 ? (
              <div className="space-y-4">
                {familyData.parentData.map((parent, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <User size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{parent.name}</p>
                      <p className="text-sm text-gray-500">{parent.role} • {parent.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No parent information available</p>
            )}
          </div>
          
          {/* Children Section */}
          {familyData.childrenData && Array.isArray(familyData.childrenData) && familyData.childrenData.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Children</h3>
              
              <div className="space-y-4">
                {familyData.childrenData.map((child, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <User size={20} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{child.name}</p>
                      {child.age && <p className="text-sm text-gray-500">Age: {child.age}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 flex items-center justify-center text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft size={18} className="mr-2" />
            Go Back
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center justify-center disabled:opacity-70"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating Family...
              </>
            ) : (
              <>
                <CheckCircle size={18} className="mr-2" />
                Confirm & Create Family
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FamilyConfirmationStep;