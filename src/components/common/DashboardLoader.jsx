// src/components/common/DashboardLoader.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useFamily } from '../../contexts/FamilyContext';
import LoadingScreen from './LoadingScreen';

const DashboardLoader = () => {
  const navigate = useNavigate();
  const { currentUser, loadFamilyData } = useAuth();
  const { selectFamilyMember } = useFamily();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get family ID from localStorage
        const familyId = localStorage.getItem('selectedFamilyId');
        if (!familyId) {
          throw new Error("No family ID found");
        }
        
        console.log("DashboardLoader: Loading family with ID:", familyId);
        
        // Load family data explicitly
        const data = await loadFamilyData(familyId);
        if (!data) {
          throw new Error("Failed to load family data");
        }
        
        console.log("DashboardLoader: Family data loaded successfully");

        // Get member ID from localStorage
        const memberId = localStorage.getItem('selectedMemberId');
        let member = null;
        
        if (memberId) {
          member = data.familyMembers.find(m => m.id === memberId);
        }
        
        // If no member found, use first member
        if (!member && data.familyMembers && data.familyMembers.length > 0) {
          member = data.familyMembers[0];
          localStorage.setItem('selectedMemberId', member.id);
        }

        if (!member) {
          throw new Error("No family member found");
        }
        
        console.log("DashboardLoader: Selecting member:", member.name);

        // Explicitly select member
        selectFamilyMember(member);
        
        // Wait to ensure contexts update
        await new Promise(resolve => setTimeout(resolve, 1000));

        // All data is loaded and ready, navigate to dashboard
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error("Error in DashboardLoader:", error);
        setError(error.message);
        // Navigate to fallback screen after delay
        setTimeout(() => navigate('/login'), 3000);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate, loadFamilyData, selectFamilyMember]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-gray-600 mb-4">Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  return <LoadingScreen />;
};

export default DashboardLoader;