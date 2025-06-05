
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { AuthError } from "@supabase/supabase-js";

interface LoginFormState {
  email: string;
  password: string;
  isLoading: boolean;
  showPassword: boolean;
  formError: string | null;
}

export const useLoginForm = () => {
  const [formState, setFormState] = useState<LoginFormState>({
    email: "",
    password: "",
    isLoading: false,
    showPassword: false,
    formError: null,
  });
  
  const { signIn, signInWithGoogle, signInWithMicrosoft } = useAuth();
  const navigate = useNavigate();

  const updateFormField = (field: keyof LoginFormState, value: any) => {
    setFormState(prev => ({ 
      ...prev, 
      [field]: value,
      // Clear errors when user starts typing
      formError: field === 'email' || field === 'password' ? null : prev.formError 
    }));
  };

  const togglePasswordVisibility = () => {
    setFormState(prev => ({ ...prev, showPassword: !prev.showPassword }));
  };

  const validateForm = (): boolean => {
    if (!formState.email.trim()) {
      setFormState(prev => ({ ...prev, formError: "Email is required" }));
      return false;
    }
    
    if (!formState.password) {
      setFormState(prev => ({ ...prev, formError: "Password is required" }));
      return false;
    }
    
    return true;
  };

  const handleAuthError = (error: AuthError | Error) => {
    console.error("Authentication error:", error);
    
    let errorMessage = "An unexpected error occurred";
    
    // Handle Supabase specific errors
    if ('message' in error) {
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please verify your email before logging in";
      } else if (error.message.includes("rate limit")) {
        errorMessage = "Too many login attempts. Please try again later";
      } else {
        errorMessage = error.message;
      }
    }
    
    setFormState(prev => ({ ...prev, formError: errorMessage }));
    
    toast.error("Login failed", {
      description: errorMessage,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setFormState(prev => ({ ...prev, isLoading: true, formError: null }));
    
    try {
      console.log("Attempting login with:", { email: formState.email });
      const { error, data } = await signIn(formState.email, formState.password);
      
      if (error) {
        handleAuthError(error);
        return;
      }
      
      toast.success("Welcome back!", {
        description: "You've been logged in successfully.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      handleAuthError(error as Error);
    } finally {
      setFormState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleGoogleLogin = async () => {
    setFormState(prev => ({ ...prev, isLoading: true, formError: null }));
    try {
      await signInWithGoogle();
      // Redirect happens in AuthContext after successful OAuth
    } catch (error) {
      setFormState(prev => ({ 
        ...prev, 
        formError: "Failed to login with Google",
        isLoading: false
      }));
    }
  };

  const handleMicrosoftLogin = async () => {
    setFormState(prev => ({ ...prev, isLoading: true, formError: null }));
    try {
      await signInWithMicrosoft();
      // Redirect happens in AuthContext after successful OAuth
    } catch (error) {
      setFormState(prev => ({ 
        ...prev, 
        formError: "Failed to login with Microsoft",
        isLoading: false
      }));
    }
  };

  return {
    ...formState,
    updateFormField,
    togglePasswordVisibility,
    handleSubmit,
    handleGoogleLogin,
    handleMicrosoftLogin,
  };
};
