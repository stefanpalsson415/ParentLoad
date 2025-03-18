// src/components/common/MemberSelector.jsx
import React, { useEffect } from 'react';
import { useFamily } from '../../contexts/FamilyContext';

const MemberSelector = () => {
  const { 
    familyData, 
    familyMembers, 
    selectedMember, 
    selectFamilyMember 
  } = useFamily();

  useEffect(() => {
    const selectMember = () => {
      // Only run if we have family data and members but no selected member
      if (familyData && 
          familyMembers && 
          familyMembers.length > 0 && 
          !selectedMember) {
        
        console.log("MemberSelector: Attempting to select member");
        
        // Try to get stored member ID
        const storedMemberId = localStorage.getItem('selectedMemberId');
        let memberToSelect = null;
        
        if (storedMemberId) {
          console.log("MemberSelector: Found stored member ID:", storedMemberId);
          memberToSelect = familyMembers.find(m => m.id === storedMemberId);
        }
        
        // If no member found by ID, use first member
        if (!memberToSelect) {
          console.log("MemberSelector: Using first available member");
          memberToSelect = familyMembers[0];
          // Save this member ID for future use
          localStorage.setItem('selectedMemberId', memberToSelect.id);
        }
        
        console.log("MemberSelector: Selecting member:", memberToSelect.name);
        selectFamilyMember(memberToSelect);
      }
    };

    // Run the selection logic
    selectMember();
    
    // Also set up an interval to try selection repeatedly for 5 seconds
    // This helps with race conditions
    const interval = setInterval(() => {
      if (selectedMember) {
        clearInterval(interval);
      } else {
        selectMember();
      }
    }, 500);
    
    // Clean up interval
    return () => clearInterval(interval);
  }, [familyData, familyMembers, selectedMember, selectFamilyMember]);

  // This component doesn't render anything
  return null;
};

export default MemberSelector;