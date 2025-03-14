// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';
import { getUserFriendlyError } from '../utils/errorHandling';

/**
 * Hook for authentication functionality
 * @returns {Object} Auth methods and state
 */
export function useAuth() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = authService.observeAuthState((user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    
    // Cleanup function
    return () => unsubscribe();
  }, []);

  // Sign up a new user
  const signUp = useCallback(async (email, password) => {
    setError(null);
    try {
      setLoading(true);
      const user = await authService.createUser(email, password);
      return user;
    } catch (err) {
      const errorMessage = getUserFriendlyError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign in an existing user
  const signIn = useCallback(async (email, password) => {
    setError(null);
    try {
      setLoading(true);
      const user = await authService.signIn(email, password);
      return user;
    } catch (err) {
      const errorMessage = getUserFriendlyError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out the current user
  const signOut = useCallback(async () => {
    setError(null);
    try {
      setLoading(true);
      await authService.signOut();
    } catch (err) {
      const errorMessage = getUserFriendlyError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    currentUser,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    clearError
  };
}