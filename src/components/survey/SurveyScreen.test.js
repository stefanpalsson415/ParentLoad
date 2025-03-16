// src/__tests__/components/survey/SurveyScreen.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { FamilyProvider } from '../../../contexts/FamilyContext';
import { SurveyProvider } from '../../../contexts/SurveyContext';
import { AuthProvider } from '../../../contexts/AuthContext';
import SurveyScreen from '../../../components/survey/SurveyScreen';

// Mock the hooks
jest.mock('../../../hooks/useFamily', () => ({
  useFamily: () => ({
    familyData: { familyName: 'Test Family' },
    selectedUser: { id: 'test-user', name: 'Test User', role: 'parent' },
    completeInitialSurvey: jest.fn(),
    saveSurveyProgress: jest.fn(),
    loading: false,
    error: null,
    clearError: jest.fn()
  })
}));

jest.mock('../../../hooks/useSurvey', () => ({
  useSurvey: () => ({
    surveyQuestions: [
      {
        id: 'q1',
        text: 'Who is primarily responsible for meal planning?',
        category: 'Invisible Household Tasks',
        options: ['Mama', 'Papa', 'Shared', 'Not Applicable']
      }
    ],
    generateQuestions: jest.fn().mockReturnValue([
      {
        id: 'q1',
        text: 'Who is primarily responsible for meal planning?',
        category: 'Invisible Household Tasks',
        options: ['Mama', 'Papa', 'Shared', 'Not Applicable']
      }
    ]),
    updateSurveyResponse: jest.fn(),
    surveyResponses: {},
    completedQuestions: [],
    loading: false,
    error: null,
    clearError: jest.fn()
  })
}));

test('renders survey screen with questions', () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <FamilyProvider>
          <SurveyProvider>
            <SurveyScreen />
          </SurveyProvider>
        </FamilyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
  
  // Check if question text is rendered
  const questionElement = screen.getByText(/Who is primarily responsible for meal planning?/i);
  expect(questionElement).toBeInTheDocument();
});