
import { supabase } from "@/integrations/supabase/client";
import { AuthError, Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<{
    error: AuthError | null;
    data: { session: Session | null; user: User | null } | null;
  }>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<{
    error: AuthError | null;
    data: { session: Session | null; user: User | null } | null;
  }>;
  signInWithGoogle: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialAuthCheckDone, setInitialAuthCheckDone] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check URL for authentication errors
    const oauthInProgress = sessionStorage.getItem('oauthInProgress');
    if (oauthInProgress) {
      sessionStorage.removeItem('oauthInProgress');
      setLoading(false);
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

  useEffect(() => {
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, !!newSession);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
        
        // Only redirect on fresh sign-in events, not on every auth state change
        if (event === 'SIGNED_IN' && newSession && !initialAuthCheckDone) {
          navigate('/dashboard');
        }
      }
    );

    // Check for existing session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setInitialAuthCheckDone(true);
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, initialAuthCheckDone]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await supabase.auth.signInWithPassword({ email, password });
      console.log("Sign in result:", result);
      return result;
    } catch (error) {
      console.error("Sign in error:", error);
      return { 
        error: error as AuthError, 
        data: null 
      };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    setLoading(true);
    try {
      console.log("Signing up user with data:", { email, firstName, lastName });
      
      // First, check if user already exists by attempting to sign in
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: "dummy-password-check"
      });
      
      // If sign in succeeds with any password, user exists
      if (existingUser?.user) {
        console.log("User already exists");
        return {
          error: {
            message: "User already registered",
            name: "UserAlreadyExistsError"
          } as AuthError,
          data: null
        };
      }
      
      // Proceed with signup
      const result = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          },
          // Ensure email verification is required
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      console.log("Sign up result:", result);
      
      // Enhanced error handling for signup
      if (result.error) {
        console.error("Signup error details:", result.error);
        
        // Map specific Supabase error codes to user-friendly messages
        if (result.error.message.includes('already') || result.error.message.includes('registered')) {
          result.error.message = 'User already registered';
        } else if (result.error.message.includes('invalid email') || result.error.message.includes('Invalid email')) {
          result.error.message = 'Please enter a valid email address';
        } else if (result.error.message.includes('weak password') || result.error.message.includes('Password')) {
          result.error.message = 'Password is too weak. Please choose a stronger password';
        } else if (result.error.message.includes('signup_disabled')) {
          result.error.message = 'Account registration is currently disabled. Please contact support.';
        }
      }
      
      // Check if this is a successful signup without immediate session (email confirmation required)
      if (result.data?.user && !result.data?.session && !result.error) {
        console.log("User created successfully, email verification required");
      }
      
      return result;
    } catch (error) {
      console.error("Unexpected signup error:", error);
      return { 
        error: { 
          message: "An unexpected error occurred during signup. Please try again.", 
          name: "SignUpError" 
        } as AuthError, 
        data: null 
      };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // Store that we're in an OAuth flow
      sessionStorage.setItem('oauthInProgress', 'true');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard',
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error("Google sign in error:", error);
      sessionStorage.removeItem('oauthInProgress');
      toast.error("Failed to sign in with Google", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithMicrosoft = async () => {
    setLoading(true);
    try {
      // Store that we're in an OAuth flow
      sessionStorage.setItem('oauthInProgress', 'true');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: window.location.origin + '/dashboard',
          queryParams: {
            // Request additional scopes to ensure we get the email
            scope: 'email openid profile User.Read',
          },
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error("Microsoft sign in error:", error);
      sessionStorage.removeItem('oauthInProgress');
      toast.error("Failed to sign in with Microsoft", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Error signing out", {
        description: "Please try again or refresh the page",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithMicrosoft,
        signOut,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
