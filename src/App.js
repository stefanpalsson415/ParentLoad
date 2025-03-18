// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { FamilyProvider } from './contexts/FamilyContext';

// Marketing pages
import LandingPage from './components/marketing/LandingPage';
import AboutUsPage from './components/marketing/AboutUsPage';
import HowThisWorksScreen from './components/education/HowThisWorksScreen';
import ProductOverviewPage from './components/marketing/ProductOverviewPage';
import BlogHomePage from './components/blog/BlogHomePage';
import BlogArticlePage from './components/blog/BlogArticlePage';

// Auth pages
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';

// Onboarding
import OnboardingFlow from './components/onboarding/OnboardingFlow';

// Dashboard and app pages
import Dashboard from './components/dashboard/Dashboard';
import PrivateRoute from './components/common/PrivateRoute';
import NotFoundPage from './components/common/NotFoundPage';
import LoadingScreen from './components/common/LoadingScreen';

// Add these imports to the imports section at the top of App.js
import SurveyScreen from './components/survey/SurveyScreen';
import WeeklyCheckInScreen from './components/survey/WeeklyCheckInScreen';
import MiniSurvey from './components/survey/MiniSurvey';


function App() {
  return (
    <Router>
      <AuthProvider>
        <FamilyProvider>
        <Routes>
  {/* Marketing Routes */}
  <Route path="/" element={<LandingPage />} />
  <Route path="/about-us" element={<AboutUsPage />} />
  <Route path="/how-it-works" element={<HowThisWorksScreen />} />
  <Route path="/product-overview" element={<ProductOverviewPage />} />
  <Route path="/blog" element={<BlogHomePage />} />
  <Route path="/blog/:slug" element={<BlogArticlePage />} />
  
  {/* Authentication Routes */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/signup" element={<SignupPage />} />
  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
  
  {/* Onboarding */}
  <Route path="/onboarding" element={<OnboardingFlow />} />
  
  {/* Survey Routes */}
  <Route path="/survey" element={
    <PrivateRoute>
      <SurveyScreen />
    </PrivateRoute>
  } />
  <Route path="/weekly-check-in" element={
    <PrivateRoute>
      <WeeklyCheckInScreen />
    </PrivateRoute>
  } />
  
  <Route path="/mini-survey" element={<MiniSurvey />} />


  {/* Protected App Routes */}
  <Route path="/dashboard" element={
    <PrivateRoute>
      <Dashboard />
    </PrivateRoute>
  } />
  
  {/* Fallback routes */}
  <Route path="/loading" element={<LoadingScreen />} />
  <Route path="*" element={<NotFoundPage />} />
</Routes>
        </FamilyProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;