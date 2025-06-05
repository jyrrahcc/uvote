
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthState } from "../types/authTypes";

export const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    initialAuthCheckDone: false,
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  // Process authentication errors from URL
  useEffect(() => {
    const oauthInProgress = sessionStorage.getItem('oauthInProgress');
    if (oauthInProgress) {
      sessionStorage.removeItem('oauthInProgress');
      setAuthState(prev => ({ ...prev, loading: false }));
    }

    if (location.hash || location.search) {
      const urlParams = new URLSearchParams(location.search || location.hash.substring(1));
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');
      
      if (error) {
        // Clean the URL by removing error parameters
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        
        // Show error toast
        toast.error(`Authentication Error: ${errorDescription || error}`, {
          description: "Please try a different sign-in method or contact support.",
          duration: 5000
        });
      }
    }
  }, [location]);

  // Set up the authentication state listener
  useEffect(() => {
    // First, set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, !!newSession);
        
        // Update session and user state synchronously
        setAuthState(prev => ({
          ...prev,
          session: newSession,
          user: newSession?.user ?? null,
          loading: false,
        }));
        
        // Only redirect on fresh sign-in events
        if (event === 'SIGNED_IN' && newSession && !authState.initialAuthCheckDone) {
          console.log("User signed in, redirecting to dashboard");
          navigate('/dashboard');
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out");
          navigate('/login');
        }
      }
    );

    // Then check for existing session
    const getInitialSession = async () => {
      try {
        setAuthState(prev => ({ ...prev, loading: true }));
        console.log("Checking for existing session...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        console.log("Session check result:", !!data.session);
        setAuthState(prev => ({
          ...prev,
          session: data.session,
          user: data.session?.user ?? null,
          initialAuthCheckDone: true,
        }));
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, authState.initialAuthCheckDone]);

  const updateAuthState = (updates: Partial<AuthState>) => {
    setAuthState(prev => ({ ...prev, ...updates }));
  };

  return {
    ...authState,
    updateAuthState,
  };
};
