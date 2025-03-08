import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FamilyProvider } from './contexts/FamilyContext';
import { SurveyProvider } from './contexts/SurveyContext';
import { useFamily } from './contexts/FamilyContext';

// Components
import FamilySelectionScreen from './components/user/FamilySelectionScreen';
import SurveyScreen from './components/survey/SurveyScreen';
import DashboardScreen from './components/dashboard/DashboardScreen';
import WeeklyCheckInScreen from './components/survey/WeeklyCheckInScreen';
import LoadingScreen from './components/common/LoadingScreen';
import UserSignupScreen from './components/user/UserSignupScreen';
import KidFriendlySurvey from './components/survey/KidFriendlySurvey';

// App Routes Component - Used after context providers are set up
function AppRoutes() {
  const { selectedUser } = useFamily();

  return (
    <Routes>
      <Route path="/" element={<FamilySelectionScreen />} />
      <Route path="/signup" element={<UserSignupScreen />} />
      
      {/* Route for initial survey - directs kids to kid-friendly version */}
      <Route path="/survey" element={
        selectedUser?.role === 'child' 
          ? <KidFriendlySurvey surveyType="initial" /> 
          : <SurveyScreen />
      } />
      
      <Route path="/dashboard" element={<DashboardScreen />} />
      
      {/* Route for weekly check-in - directs kids to kid-friendly version */}
      <Route path="/weekly-check-in" element={
        selectedUser?.role === 'child' 
          ? <KidFriendlySurvey surveyType="weekly" /> 
          : <WeeklyCheckInScreen />
      } />
      
      <Route path="/loading" element={<LoadingScreen />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <FamilyProvider>
          <SurveyProvider>
            <div className="App">
              <AppRoutes />
            </div>
          </SurveyProvider>
        </FamilyProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;