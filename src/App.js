import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FamilyProvider } from './contexts/FamilyContext';
import { SurveyProvider } from './contexts/SurveyContext';

// Components
import FamilySelectionScreen from './components/user/FamilySelectionScreen';
import SurveyScreen from './components/survey/SurveyScreen';
import DashboardScreen from './components/dashboard/DashboardScreen';
import WeeklyCheckInScreen from './components/survey/WeeklyCheckInScreen';
import LoadingScreen from './components/common/LoadingScreen';
import UserSignupScreen from './components/user/UserSignupScreen';
import FamilyMeetingScreen from './components/meeting/FamilyMeetingScreen';

function App() {
  const [showFamilyMeeting, setShowFamilyMeeting] = useState(false);
  
  return (
    <Router>
      <AuthProvider>
        <FamilyProvider>
          <SurveyProvider>
            <div className="App">
              <Routes>
                <Route path="/" element={<FamilySelectionScreen />} />
                <Route path="/signup" element={<UserSignupScreen />} />
                <Route path="/survey" element={<SurveyScreen />} />
                <Route path="/dashboard" element={<DashboardScreen onOpenFamilyMeeting={() => setShowFamilyMeeting(true)} />} />
                <Route path="/weekly-check-in" element={<WeeklyCheckInScreen />} />
                <Route path="/loading" element={<LoadingScreen />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
              
              {/* Family Meeting Modal */}
              {showFamilyMeeting && (
                <FamilyMeetingScreen onClose={() => setShowFamilyMeeting(false)} />
              )}
            </div>
          </SurveyProvider>
        </FamilyProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;