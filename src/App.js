import React from 'react';
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

function App() {
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
                <Route path="/dashboard" element={<DashboardScreen />} />
                <Route path="/weekly-check-in" element={<WeeklyCheckInScreen />} />
                <Route path="/loading" element={<LoadingScreen />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </SurveyProvider>
        </FamilyProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;