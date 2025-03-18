import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

// This component bypasses the context system to directly load family data
const DashboardBootstrapper = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [familyData, setFamilyData] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function bootstrapDashboard() {
      try {
        console.log("BOOTSTRAP: Starting emergency dashboard bootstrap");
        setIsLoading(true);
        
        // 1. Get family ID from localStorage
        const familyId = localStorage.getItem('selectedFamilyId');
        if (!familyId) {
          console.error("BOOTSTRAP: No family ID in localStorage");
          navigate('/login');
          return;
        }
        
        console.log("BOOTSTRAP: Found family ID:", familyId);
        
        // 2. Directly load family from Firestore
        const docRef = doc(db, "families", familyId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          console.error("BOOTSTRAP: Family not found in database");
          navigate('/login');
          return;
        }
        
        // 3. Get the family data
        const loadedFamilyData = {
          familyId,
          ...docSnap.data()
        };
        
        console.log("BOOTSTRAP: Loaded family data successfully");
        setFamilyData(loadedFamilyData);
        
        // 4. Select a member directly (try localStorage first)
        const memberId = localStorage.getItem('selectedMemberId');
        const familyMembers = loadedFamilyData.familyMembers || [];
        
        let memberToSelect = null;
        
        if (memberId) {
          memberToSelect = familyMembers.find(m => m.id === memberId);
        }
        
        // If no member found, try to find a parent
        if (!memberToSelect && familyMembers.length > 0) {
          memberToSelect = familyMembers.find(m => 
            m.role === 'parent' || m.roleType === 'Mama' || m.roleType === 'Papa'
          ) || familyMembers[0];
        }
        
        if (memberToSelect) {
          console.log("BOOTSTRAP: Selected member:", memberToSelect.name);
          setSelectedMember(memberToSelect);
          localStorage.setItem('selectedMemberId', memberToSelect.id);
          
          // 5. Store everything in window object for emergency access
          window.__familyData = loadedFamilyData;
          window.__selectedMember = memberToSelect;
          
          // 6. Redirect to a special dashboard that doesn't use contexts
          navigate('/simple-dashboard');
        } else {
          console.error("BOOTSTRAP: No members found in family data");
          setError("No family members found");
        }
      } catch (error) {
        console.error("BOOTSTRAP ERROR:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    bootstrapDashboard();
  }, [navigate]);

  if (error) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50 p-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Dashboard</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/login')}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Loading Dashboard</h2>
        <p className="text-center mb-6">Preparing your family dashboard...</p>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="bg-blue-600 h-full animate-pulse" style={{width: '100%'}}></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardBootstrapper;