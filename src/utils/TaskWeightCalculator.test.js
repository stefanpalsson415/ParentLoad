// src/__tests__/utils/TaskWeightCalculator.test.js
import { calculateTaskWeight, calculateBalanceScores } from '../../utils/TaskWeightCalculator';

describe('TaskWeightCalculator', () => {
  test('calculates task weight correctly', () => {
    const question = {
      frequency: 'daily',
      invisibility: 'mostly',
      emotionalLabor: 'high',
      childDevelopment: 'high',
      baseWeight: 3
    };
    
    const familyPriorities = {
      highestPriority: 'Invisible Parental Tasks',
      secondaryPriority: 'Visible Parental Tasks',
      tertiaryPriority: 'Invisible Household Tasks'
    };
    
    const weight = calculateTaskWeight(question, familyPriorities);
    
    // With these multipliers, we expect a value greater than the base weight
    expect(weight).toBeGreaterThan(3);
  });
  
  test('calculates balance scores correctly', () => {
    const questions = [
      { id: 'q1', category: 'Visible Household Tasks' },
      { id: 'q2', category: 'Invisible Household Tasks' }
    ];
    
    const responses = {
      'q1': 'Mama',
      'q2': 'Papa'
    };
    
    const scores = calculateBalanceScores(questions, responses);
    
    expect(scores.overallBalance.mama).toBeCloseTo(50);
    expect(scores.overallBalance.papa).toBeCloseTo(50);
  });
});