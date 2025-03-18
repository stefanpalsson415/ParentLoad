import React, { useEffect, useState } from 'react';
import { useFamily } from '../../hooks/useFamily';

const MemberSelector = () => {
  const { 
    familyData, 
    familyMembers, 
    selectedMember, 
    selectFamilyMember 
  } = useFamily();
  
  const [attempted, setAttempted] = useState(false);

  // Force selection after a delay if initial attempt fails
  useEffect(() => {
    if (!selectedMember && familyMembers?.length > 0 && !attempted) {
      console.log("CRITICAL: Forcing member selection with timeout");
      
      // Mark that we've attempted selection
      setAttempted(true);
      
      // Add a timeout to ensure DOM has updated
      setTimeout(() => {
        // Force select the first parent (or first member if no parents)
        const parentMember = familyMembers.find(m => 
          m.role === 'parent' || m.roleType === 'Mama' || m.roleType === 'Papa'
        );
        
        const memberToSelect = parentMember || familyMembers[0];
        
        if (memberToSelect) {
          console.log("FORCE SELECTING MEMBER:", memberToSelect.name);
          selectFamilyMember(memberToSelect);
          
          // Store in localStorage
          localStorage.setItem('selectedMemberId', memberToSelect.id);
        }
      }, 1000); // Wait 1 second before force selecting
    }
  }, [familyMembers, selectedMember, selectFamilyMember, attempted]);

  // Initial selection attempt
  useEffect(() => {
    if (!selectedMember && familyMembers?.length > 0 && !attempted) {
      console.log("MemberSelector: Found", familyMembers.length, "family members");
      
      // Try to get stored member ID
      const storedMemberId = localStorage.getItem('selectedMemberId');
      let memberToSelect = null;
      
      if (storedMemberId) {
        console.log("MemberSelector: Looking for stored ID:", storedMemberId);
        memberToSelect = familyMembers.find(m => m.id === storedMemberId);
      }
      
      // If no member found by ID, find a parent
      if (!memberToSelect) {
        console.log("MemberSelector: No stored member found, looking for a parent");
        memberToSelect = familyMembers.find(m => 
          m.role === 'parent' || m.roleType === 'Mama' || m.roleType === 'Papa'
        );
      }
      
      // If still no member, use first available
      if (!memberToSelect && familyMembers.length > 0) {
        console.log("MemberSelector: No parent found, using first member");
        memberToSelect = familyMembers[0];
      }
      
      // If we found a member, select it
      if (memberToSelect) {
        console.log("MemberSelector: Selecting", memberToSelect.name);
        selectFamilyMember(memberToSelect);
        
        // Save to localStorage
        localStorage.setItem('selectedMemberId', memberToSelect.id);
      }
    }
  }, [familyMembers, selectedMember, selectFamilyMember, attempted]);

  return null;
};

export default MemberSelector;