// src/utils/errorHandling.js

/**
 * Standard error codes and messages for the application
 */
export const ErrorCodes = {
    // Authentication errors
    AUTH_EMAIL_ALREADY_IN_USE: 'auth/email-already-in-use',
    AUTH_INVALID_EMAIL: 'auth/invalid-email',
    AUTH_USER_DISABLED: 'auth/user-disabled',
    AUTH_USER_NOT_FOUND: 'auth/user-not-found',
    AUTH_WRONG_PASSWORD: 'auth/wrong-password',
    AUTH_WEAK_PASSWORD: 'auth/weak-password',
    
    // Family errors
    FAMILY_NOT_FOUND: 'family/not-found',
    FAMILY_ALREADY_EXISTS: 'family/already-exists',
    FAMILY_INVALID_DATA: 'family/invalid-data',
    
    // Data errors
    DATA_NOT_FOUND: 'data/not-found',
    DATA_INVALID: 'data/invalid',
    
    // Network errors
    NETWORK_OFFLINE: 'network/offline',
    NETWORK_TIMEOUT: 'network/timeout',
    
    // General errors
    UNKNOWN_ERROR: 'unknown/error'
  };
  
  /**
   * User-friendly error messages for different error codes
   */
  const errorMessages = {
    [ErrorCodes.AUTH_EMAIL_ALREADY_IN_USE]: 'This email is already in use. Please try a different email or log in.',
    [ErrorCodes.AUTH_INVALID_EMAIL]: 'The email address is not valid.',
    [ErrorCodes.AUTH_USER_DISABLED]: 'This account has been disabled. Please contact support.',
    [ErrorCodes.AUTH_USER_NOT_FOUND]: 'No account found with this email. Please check your email or sign up.',
    [ErrorCodes.AUTH_WRONG_PASSWORD]: 'Incorrect password. Please try again.',
    [ErrorCodes.AUTH_WEAK_PASSWORD]: 'Password is too weak. Please use at least 6 characters.',
    
    [ErrorCodes.FAMILY_NOT_FOUND]: 'Family not found. It may have been deleted.',
    [ErrorCodes.FAMILY_ALREADY_EXISTS]: 'A family with this name already exists.',
    [ErrorCodes.FAMILY_INVALID_DATA]: 'The family data provided is not valid.',
    
    [ErrorCodes.DATA_NOT_FOUND]: 'The requested data could not be found.',
    [ErrorCodes.DATA_INVALID]: 'The data provided is not valid.',
    
    [ErrorCodes.NETWORK_OFFLINE]: 'You appear to be offline. Please check your internet connection.',
    [ErrorCodes.NETWORK_TIMEOUT]: 'The request timed out. Please try again.',
    
    [ErrorCodes.UNKNOWN_ERROR]: 'An unknown error occurred. Please try again.'
  };
  
  /**
   * Parse Firebase error code from error object
   * @param {Error} error The error object
   * @returns {string} Error code
   */
  export function parseErrorCode(error) {
    if (error.code) {
      return error.code;
    }
    
    if (error.message && error.message.includes('auth/')) {
      return error.message.split('auth/')[1].split(')')[0];
    }
    
    return ErrorCodes.UNKNOWN_ERROR;
  }
  
  /**
   * Get user-friendly error message for an error
   * @param {Error|string} error Error object or error code
   * @returns {string} User-friendly error message
   */
  export function getUserFriendlyError(error) {
    const errorCode = typeof error === 'string' ? error : parseErrorCode(error);
    return errorMessages[errorCode] || 'An error occurred. Please try again.';
  }
  
  /**
   * Log error to console and potentially to a monitoring service
   * @param {string} context Where the error occurred
   * @param {Error} error The error object
   */


// Enhanced implementation
export function logError(context, error) {
  console.error(`Error in ${context}:`, error);
  
  // Add timestamp
  const timestamp = new Date().toISOString();
  const errorInfo = {
    context,
    message: error.message || error,
    stack: error.stack,
    timestamp
  };
  
  // Save to localStorage for debugging
  try {
    const errorLog = JSON.parse(localStorage.getItem('errorLog') || '[]');
    errorLog.push(errorInfo);
    
    // Keep only the last 20 errors
    if (errorLog.length > 20) {
      errorLog.shift();
    }
    
    localStorage.setItem('errorLog', JSON.stringify(errorLog));
  } catch (e) {
    // Silent fail if localStorage is not available
  }
  
  // Here you could also send the error to a monitoring service
  // if (window.Sentry) {
  //   window.Sentry.captureException(error, { 
  //     tags: { context },
  //     extra: errorInfo
  //   });
  // }
}
  
  /**
   * Create a standardized error object
   * @param {string} code Error code
   * @param {string} message Error message
   * @param {object} details Additional error details
   * @returns {Error} Standardized error object
   */
  export function createError(code, message, details = {}) {
    const error = new Error(message || errorMessages[code] || 'An error occurred');
    error.code = code;
    error.details = details;
    return error;
  }