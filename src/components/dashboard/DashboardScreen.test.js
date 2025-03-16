// src/__tests__/components/dashboard/DashboardScreen.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { FamilyProvider } from '../../../contexts/FamilyContext';
import { SurveyProvider } from '../../../contexts/SurveyContext';
import { AuthProvider } from '../../../contexts/AuthContext';
import DashboardScreen from '../../../components/dashboard/DashboardScreen';

// Mock the hooks
jest.mock('../../../hooks/useFamily', () => ({
  useFamily: () => ({
    familyData: { familyName: 'Test Family', currentWeek: 1 },
    familyMembers: [],
    selectedMember: null,
    loading: false,
    error: null
  })
}));

jest.mock('../../../hooks/useTasks', () => ({
  useTasks: () => ({
    tasks: [],
    weeklyTasks: [],
    loading: false,
    error: null,
    loadTasks: jest.fn()
  })
}));

test('renders dashboard with family name', () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <FamilyProvider>
          <SurveyProvider>
            <DashboardScreen />
          </SurveyProvider>
        </FamilyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
  
  // Check if family name is rendered
  const familyNameElement = screen.getByText(/Test Family/i);
  expect(familyNameElement).toBeInTheDocument();
});