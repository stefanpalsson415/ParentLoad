import React, { useEffect } from 'react';

const StateDebugger = () => {
  // Collect all state information
  useEffect(() => {
    const debugInfo = {
      localStorage: {},
      url: window.location.href,
      timestamp: new Date().toISOString()
    };
    
    // Collect all localStorage items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      debugInfo.localStorage[key] = localStorage.getItem(key);
    }
    
    // Log the debug info
    console.log('===== STATE DEBUGGER =====');
    console.log(JSON.stringify(debugInfo, null, 2));
    console.log('=========================');
    
    // Save to session storage for persistence
    try {
      const history = JSON.parse(sessionStorage.getItem('debugHistory') || '[]');
      history.push(debugInfo);
      // Keep only the last 10 entries
      while (history.length > 10) history.shift();
      sessionStorage.setItem('debugHistory', JSON.stringify(history));
    } catch (e) {
      console.error('Error saving debug history:', e);
    }
  }, []);
  
  return null; // This component doesn't render anything
};

export default StateDebugger;