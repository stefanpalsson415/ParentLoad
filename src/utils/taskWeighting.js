// src/utils/taskWeighting.js

// 1. Time-Based Weighting (Base Weight)
export const BASE_WEIGHTS = {
    MINIMAL: 1,  // <15 minutes with little mental load
    SHORT: 2,    // 15-30 minutes or ongoing low-level mental load
    MODERATE: 3, // 30-60 minutes or consistent background mental load
    SUBSTANTIAL: 4, // 1-2 hours or significant cognitive organization
    MAJOR: 5     // >2 hours or heavy cognitive load spanning days
  };
  
  // 2. Frequency Factor
  export const FREQUENCY_MULTIPLIERS = {
    DAILY: 1.5,
    SEVERAL_WEEKLY: 1.3,
    WEEKLY: 1.2,
    MONTHLY: 1.0,
    QUARTERLY: 0.8
  };
  
  // 3. Invisibility Multiplier
  export const INVISIBILITY_MULTIPLIERS = {
    HIGHLY_VISIBLE: 1.0,   // clearly observable when complete
    PARTIALLY_VISIBLE: 1.2, // noticeable only when not done
    MOSTLY_INVISIBLE: 1.35, // typically goes unnoticed
    COMPLETELY_INVISIBLE: 1.5 // never acknowledged without explicit mention
  };
  
  // 4. Emotional Labor Index
  export const EMOTIONAL_LABOR_MULTIPLIERS = {
    MINIMAL: 1.0,
    LOW: 1.1,
    MODERATE: 1.2,
    HIGH: 1.3,
    EXTREME: 1.4
  };
  
  // 5. Research-Backed Impact Weights
  export const RESEARCH_IMPACT_MULTIPLIERS = {
    HIGH_IMPACT: 1.3,   // e.g., childcare coordination, household management
    MEDIUM_IMPACT: 1.15, // e.g., cleaning, meal preparation
    STANDARD_IMPACT: 1.0 // e.g., occasional home maintenance
  };
  
  // 6. Child Development Impact
  export const CHILD_DEVELOPMENT_MULTIPLIERS = {
    HIGH_IMPACT: 1.25,   // e.g., visible care tasks
    MODERATE_IMPACT: 1.15,
    LIMITED_IMPACT: 1.0  // tasks children rarely observe
  };
  
  // 7. Priority-Based Personalization
  export const PRIORITY_MULTIPLIERS = {
    HIGHEST_PRIORITY: 1.5,
    SECONDARY_PRIORITY: 1.3,
    TERTIARY_PRIORITY: 1.1,
    NON_PRIORITY: 1.0
  };
  
  /**
   * Calculate the weighted value of a task using the 7-factor model
   * @param {Object} task Task with weighting attributes
   * @param {Object} familyPriorities Family's priority settings
   * @returns {number} Calculated task weight
   */
  export function calculateTaskWeight(task, familyPriorities) {
    if (!task) return 0;
    
    // 1. Get base weight
    const baseWeight = task.baseWeight || BASE_WEIGHTS.MODERATE;
    
    // 2-6. Calculate core multipliers
    const frequencyMultiplier = 
      FREQUENCY_MULTIPLIERS[task.frequency] || FREQUENCY_MULTIPLIERS.WEEKLY;
      
    const invisibilityMultiplier = 
      INVISIBILITY_MULTIPLIERS[task.invisibility] || INVISIBILITY_MULTIPLIERS.PARTIALLY_VISIBLE;
      
    const emotionalLaborMultiplier = 
      EMOTIONAL_LABOR_MULTIPLIERS[task.emotionalLabor] || EMOTIONAL_LABOR_MULTIPLIERS.MINIMAL;
      
    const researchImpactMultiplier = 
      RESEARCH_IMPACT_MULTIPLIERS[task.researchImpact] || RESEARCH_IMPACT_MULTIPLIERS.STANDARD_IMPACT;
      
    const childDevelopmentMultiplier = 
      CHILD_DEVELOPMENT_MULTIPLIERS[task.childDevelopment] || CHILD_DEVELOPMENT_MULTIPLIERS.LIMITED_IMPACT;
    
    // 7. Determine priority multiplier
    let priorityMultiplier = PRIORITY_MULTIPLIERS.NON_PRIORITY;
    if (familyPriorities) {
      if (familyPriorities.highestPriority === task.category) {
        priorityMultiplier = PRIORITY_MULTIPLIERS.HIGHEST_PRIORITY;
      } else if (familyPriorities.secondaryPriority === task.category) {
        priorityMultiplier = PRIORITY_MULTIPLIERS.SECONDARY_PRIORITY;
      } else if (familyPriorities.tertiaryPriority === task.category) {
        priorityMultiplier = PRIORITY_MULTIPLIERS.TERTIARY_PRIORITY;
      }
    }
    
    // Calculate final weight
    return baseWeight * 
      frequencyMultiplier * 
      invisibilityMultiplier * 
      emotionalLaborMultiplier * 
      researchImpactMultiplier * 
      childDevelopmentMultiplier * 
      priorityMultiplier;
  }
  
  /**
   * Calculate balance scores for a family based on survey responses
   * @param {Array} questions Survey questions with weight attributes
   * @param {Object} responses Survey responses
   * @param {Object} familyPriorities Family's priority settings
   * @returns {Object} Balance scores by category and overall
   */
  export function calculateBalanceScores(questions, responses, familyPriorities) {
    // Initialize score tracking
    let mamaTotal = 0;
    let papaTotal = 0;
    
    // Category-specific tracking
    const categoryScores = {
      "Visible Household Tasks": { mama: 0, papa: 0, total: 0 },
      "Invisible Household Tasks": { mama: 0, papa: 0, total: 0 },
      "Visible Parental Tasks": { mama: 0, papa: 0, total: 0 },
      "Invisible Parental Tasks": { mama: 0, papa: 0, total: 0 }
    };
    
    // Calculate weighted scores for each response
    Object.entries(responses || {}).forEach(([questionId, value]) => {
      // Find the question matching this response
      const question = questions.find(q => q.id === questionId);
      if (!question) return;
      
      // Calculate weight for this task
      const weight = calculateTaskWeight(question, familyPriorities);
      
      // Add to the appropriate totals
      if (value === 'Mama') {
        mamaTotal += weight;
        if (categoryScores[question.category]) {
          categoryScores[question.category].mama += weight;
        }
      } else if (value === 'Papa') {
        papaTotal += weight;
        if (categoryScores[question.category]) {
          categoryScores[question.category].papa += weight;
        }
      }
      
      // Add to category total regardless of who does it
      if (categoryScores[question.category]) {
        categoryScores[question.category].total += weight;
      }
    });
    
    // Calculate percentages
    const totalWeight = mamaTotal + papaTotal;
    const result = {
      overallBalance: {
        mama: totalWeight ? (mamaTotal / totalWeight) * 100 : 50,
        papa: totalWeight ? (papaTotal / totalWeight) * 100 : 50
      },
      categoryBalance: {}
    };
    
    // Calculate category percentages
    Object.entries(categoryScores).forEach(([category, scores]) => {
      result.categoryBalance[category] = {
        mama: scores.total ? (scores.mama / scores.total) * 100 : 50,
        papa: scores.total ? (scores.papa / scores.total) * 100 : 50,
        imbalance: scores.total ? Math.abs(scores.mama - scores.papa) / scores.total * 100 : 0
      };
    });
    
    return result;
  }