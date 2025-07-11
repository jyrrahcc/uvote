
import { supabase } from "@/integrations/supabase/client";
import { AuthError } from "@supabase/supabase-js";
import { toast } from "sonner";

export const authService = {
  async signIn(email: string, password: string) {
    console.log("Signing in with email:", email);
    
    try {
      const result = await supabase.auth.signInWithPassword({ 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      console.log("Sign in result:", !!result.data.session);
      
      // Handle specific errors better
      if (result.error) {
        console.error("Sign in error details:", result.error);
        
        // Map error codes to better messages if needed
        if (result.error.message.includes('Email not confirmed')) {
          result.error.message = 'Please verify your email address before logging in';
        }
      }
      
      return result;
    } catch (error) {
      console.error("Unexpected sign in error:", error);
      return { 
        error: {
          message: "An unexpected error occurred during sign in",
          name: "SignInError"
        } as AuthError, 
        data: null 
      };
    }
  },

  async signUp(email: string, password: string, firstName: string, lastName: string) {
    try {
      console.log("Signing up user with data:", { email, firstName, lastName });
      
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
        
        // Handle Supabase-specific error messages
        if (result.error.message.includes('User already registered') || 
            result.error.message.includes('already been registered') ||
            result.error.status === 422) {
          result.error.message = 'This email address is already registered. Please try logging in instead.';
        } else if (result.error.message.includes('invalid email') || result.error.message.includes('Invalid email')) {
          result.error.message = 'Please enter a valid email address';
        } else if (result.error.message.includes('weak password') || result.error.message.includes('Password')) {
          result.error.message = 'Password is too weak. Please choose a stronger password';
        } else if (result.error.message.includes('signup_disabled')) {
          result.error.message = 'Account registration is currently disabled. Please contact support.';
        }
        
        return result;
      }
      
      // Successful signup case - user created but needs email verification
      if (result.data?.user && !result.data?.session) {
        console.log("User created successfully, email verification required");
        return result;
      }
      
      // User created and automatically signed in (email verification disabled)
      if (result.data?.user && result.data?.session) {
        console.log("User created and signed in automatically");
        return result;
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
    }
  },

  async signInWithGoogle() {
    console.log("Initiating Google sign in");
    // Store that we're in an OAuth flow
    sessionStorage.setItem('oauthInProgress', 'true');
    
    try {
      const { error, data } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        }
      });
      
      if (error) {
        console.error("Google sign in error:", error);
        throw error;
      }
      
      console.log("Google auth redirect initiated:", !!data);
    } catch (error) {
      console.error("Google sign in unexpected error:", error);
      sessionStorage.removeItem('oauthInProgress');
      toast.error("Failed to sign in with Google", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      throw error;
    }
  },

  async signInWithMicrosoft() {
    console.log("Initiating Microsoft sign in");
    // Store that we're in an OAuth flow
    sessionStorage.setItem('oauthInProgress', 'true');

    try {
      const { error, data } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            // Request additional scopes to ensure we get the email
            scope: 'email openid profile User.Read',
          },
        }
      });
      
      if (error) {
        console.error("Microsoft sign in error:", error);
        throw error;
      }
      
      console.log("Microsoft auth redirect initiated:", !!data);
    } catch (error) {
      console.error("Microsoft sign in unexpected error:", error);
      sessionStorage.removeItem('oauthInProgress');
      toast.error("Failed to sign in with Microsoft", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      throw error;
    }
  },

  async signOut() {
    console.log("Signing out");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      console.log("Successfully signed out");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Error signing out", {
        description: "Please try again or refresh the page",
      });
      throw error;
    }
  },
};
