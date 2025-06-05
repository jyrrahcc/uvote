
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authOperationsService } from "../services/authOperationsService";
import { AuthState } from "../types/authTypes";

interface UseAuthOperationsProps {
  updateAuthState: (updates: Partial<AuthState>) => void;
}

export const useAuthOperations = ({ updateAuthState }: UseAuthOperationsProps) => {
  const navigate = useNavigate();

  const signIn = async (email: string, password: string) => {
    updateAuthState({ loading: true });
    
    try {
      const result = await authOperationsService.handleSignIn(email, password);
      return result;
    } finally {
      updateAuthState({ loading: false });
    }
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    updateAuthState({ loading: true });
    
    try {
      const result = await authOperationsService.handleSignUp(email, password, firstName, lastName);
      return result;
    } finally {
      updateAuthState({ loading: false });
    }
  };

  const signInWithGoogle = async () => {
    updateAuthState({ loading: true });
    try {
      await authOperationsService.handleGoogleSignIn();
    } finally {
      updateAuthState({ loading: false });
    }
  };

  const signInWithMicrosoft = async () => {
    updateAuthState({ loading: true });
    try {
      await authOperationsService.handleMicrosoftSignIn();
    } finally {
      updateAuthState({ loading: false });
    }
  };

  const signOut = async () => {
    updateAuthState({ loading: true });
    try {
      await authOperationsService.handleSignOut();
      navigate("/login");
    } finally {
      updateAuthState({ loading: false });
    }
  };

  return {
    signIn,
    signUp,
    signInWithGoogle,
    signInWithMicrosoft,
    signOut
  };
};
