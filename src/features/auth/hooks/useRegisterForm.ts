
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  general?: string;
}

interface PasswordRequirements {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
}

export const useRegisterForm = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirements>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Update password requirements in real-time
    if (field === 'password') {
      updatePasswordRequirements(value);
    }
  };

  const updatePasswordRequirements = (password: string) => {
    setPasswordRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    });
  };

  const handleSubmit = async (validateForm: () => boolean) => {
    // Clear any previous general errors
    setErrors(prev => ({ ...prev, general: undefined }));
    
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setIsLoading(true);
    
    try {
      console.log("Attempting to register with:", { 
        email: formData.email, 
        firstName: formData.firstName, 
        lastName: formData.lastName 
      });
      
      const { error } = await signUp(
        formData.email, 
        formData.password, 
        formData.firstName, 
        formData.lastName
      );
      
      if (error) {
        console.error("Registration error:", error);
        
        // Handle specific Supabase errors
        let errorMessage = "Something went wrong. Please try again.";
        
        if (error.message.includes("User already registered")) {
          errorMessage = "This email is already registered. Please try logging in instead.";
          setErrors({ email: errorMessage });
        } else if (error.message.includes("invalid_credentials")) {
          errorMessage = "Invalid credentials. Please check your information and try again.";
        } else if (error.message.includes("email")) {
          errorMessage = "Please enter a valid email address.";
          setErrors({ email: errorMessage });
        } else if (error.message.includes("password")) {
          errorMessage = "Password doesn't meet the requirements.";
          setErrors({ password: errorMessage });
        } else if (error.message.includes("signup_disabled")) {
          errorMessage = "Account registration is currently disabled. Please contact support.";
        } else if (error.message.includes("rate_limit")) {
          errorMessage = "Too many attempts. Please wait a moment before trying again.";
        } else {
          errorMessage = error.message;
          setErrors({ general: errorMessage });
        }
        
        toast.error("Registration failed", {
          description: errorMessage,
        });
        return;
      }
      
      toast.success("Account created successfully!", {
        description: "Please check your email to verify your account before logging in.",
      });
      
      navigate("/login");
    } catch (error) {
      console.error("Unexpected registration error:", error);
      const errorMessage = "An unexpected error occurred. Please try again later.";
      setErrors({ general: errorMessage });
      toast.error("Registration failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    showPassword,
    setShowPassword,
    isLoading,
    setIsLoading,
    errors,
    setErrors,
    passwordRequirements,
    handleInputChange,
    handleSubmit,
  };
};
