import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FamilyProvider } from './contexts/FamilyContext';
import { SurveyProvider } from './contexts/SurveyContext';
import { useFamily } from './contexts/FamilyContext';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';


// Components
import FamilySelectionScreen from './components/user/FamilySelectionScreen';
import SurveyScreen from './components/survey/SurveyScreen';
import DashboardScreen from './components/dashboard/DashboardScreen';
import WeeklyCheckInScreen from './components/survey/WeeklyCheckInScreen';
import LoadingScreen from './components/common/LoadingScreen';
import UserSignupScreen from './components/user/UserSignupScreen';
import KidFriendlySurvey from './components/survey/KidFriendlySurvey';
import PaymentScreen from './components/payment/PaymentScreen';
// New code - Add missing imports
import LandingPage from './components/marketing/LandingPage';
import OnboardingFlow from './components/onboarding/OnboardingFlow';


// App Routes Component - Used after context providers are set up
function AppRoutes() {
  const { selectedUser } = useFamily();
  const stripePromise = loadStripe('pk_test_YOUR_TEST_KEY');


  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<FamilySelectionScreen />} />
      <Route path="/onboarding" element={<OnboardingFlow />} />
      <Route path="/signup" element={<UserSignupScreen />} />
      
      // New code - Add payment route
<Route path="/survey" element={
  selectedUser?.role === 'child' 
    ? <KidFriendlySurvey surveyType="initial" /> 
    : <SurveyScreen />
} />
<Route path="/payment" element={<PaymentScreen />} />
// rest of routes...
      // rest of routes...
      
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
            <Elements stripe={stripePromise}>

            <div className="App">
              <AppRoutes />
            </div>
            </Elements>

          </SurveyProvider>
        </FamilyProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;