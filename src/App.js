import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FamilyProvider } from './contexts/FamilyContext';
import { SurveyProvider } from './contexts/SurveyContext';
import { useFamily } from './contexts/FamilyContext';
import AboutUsPage from './components/marketing/AboutUsPage';
import HowThisWorksScreen from './components/education/HowThisWorksScreen';
import ProductOverviewPage from './components/marketing/ProductOverviewPage'; 
import BlogHomePage from './components/blog/BlogHomePage';
import BlogArticlePage from './components/blog/BlogArticlePage';

// Components
import MiniSurvey from './components/survey/MiniSurvey';
import MiniResultsScreen from './components/survey/MiniResultsScreen';
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

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<FamilySelectionScreen />} />
      <Route path="/onboarding" element={<OnboardingFlow />} />
      <Route path="/signup" element={<UserSignupScreen />} />

      <Route path="/how-it-works" element={<HowThisWorksScreen />} />
      <Route path="/about-us" element={<AboutUsPage />} />
      <Route path="/product-overview" element={<ProductOverviewPage />} />
      <Route path="/blog" element={<BlogHomePage />} />
      <Route path="/blog/:slug" element={<BlogArticlePage />} />
      <Route path="/survey" element={
        selectedUser?.role === 'child' 
          ? <KidFriendlySurvey surveyType="initial" /> 
          : <SurveyScreen />
      } />
      <Route path="/mini-survey" element={<MiniSurvey />} />
      <Route path="/mini-results" element={<MiniResultsScreen />} />
      <Route path="/payment" element={<PaymentScreen />} />
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
  console.log("App rendering..."); // Add this debug line
  
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <FamilyProvider>
            <SurveyProvider>
              <div className="App">
                <AppRoutes />
              </div>
            </SurveyProvider>
          </FamilyProvider>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
}

// Add this error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error in application:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: 20}}>
          <h2>Something went wrong</h2>
          <p>Please refresh the page and try again.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default App;