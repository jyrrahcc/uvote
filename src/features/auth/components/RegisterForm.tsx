
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

/**
 * Enhanced registration form with comprehensive validation and error handling
 */
const RegisterForm = () => {
  const [formData, setFormData] = useState({
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

  const { signUp, signInWithGoogle, signInWithMicrosoft } = useAuth();
  const navigate = useNavigate();

  // University email domains that are allowed
  const allowedDomains = [
    '@dlsud.edu.ph',
    '@gmail.com', // For testing purposes
    '@example.com' // For testing purposes
  ];

  const validateEmail = (email: string): string | undefined => {
    if (!email) return "Email is required";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    
    // Check if email ends with allowed domain
    const isValidDomain = allowedDomains.some(domain => email.toLowerCase().endsWith(domain.toLowerCase()));
    if (!isValidDomain) {
      return `Please use a university email address (${allowedDomains.join(', ')})`;
    }
    
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters long";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/\d/.test(password)) return "Password must contain at least one number";
    return undefined;
  };

  const validateName = (name: string, fieldName: string): string | undefined => {
    if (!name) return `${fieldName} is required`;
    if (name.length < 2) return `${fieldName} must be at least 2 characters long`;
    if (!/^[a-zA-Z\s'-]+$/.test(name)) return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
    return undefined;
  };

  const updatePasswordRequirements = (password: string) => {
    setPasswordRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    });
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    newErrors.firstName = validateName(formData.firstName, "First name");
    newErrors.lastName = validateName(formData.lastName, "Last name");
    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Google Sign-In Failed", {
        description: "Failed to login with Google. Please try again or use email registration.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithMicrosoft();
    } catch (error) {
      console.error("Microsoft login error:", error);
      toast.error("Microsoft Sign-In Failed", {
        description: "Failed to login with Microsoft. Please try again or use email registration.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
    <div className={cn("flex items-center gap-2 text-sm", met ? "text-green-600" : "text-gray-500")}>
      {met ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
      <span>{text}</span>
    </div>
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>
          Register to participate in secure and transparent elections
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Social Login Options */}
          <div className="flex flex-col gap-2">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Sign up with Google
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleMicrosoftLogin}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Sign up with Microsoft
            </Button>
          </div>
          
          <div className="flex items-center gap-2 my-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>

          {/* General Error Message */}
          {errors.general && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-destructive text-sm">{errors.general}</p>
            </div>
          )}
          
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="John"
                required
                disabled={isLoading}
                className={cn(errors.firstName && "border-destructive")}
              />
              {errors.firstName && (
                <p className="text-destructive text-sm">{errors.firstName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Doe"
                required
                disabled={isLoading}
                className={cn(errors.lastName && "border-destructive")}
              />
              {errors.lastName && (
                <p className="text-destructive text-sm">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">University Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="your.email@dlsud.edu.ph"
              required
              disabled={isLoading}
              autoComplete="email"
              className={cn(errors.email && "border-destructive")}
            />
            {errors.email && (
              <p className="text-destructive text-sm">{errors.email}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Use your university email address for verification
            </p>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                disabled={isLoading}
                autoComplete="new-password"
                className={cn(errors.password && "border-destructive", "pr-10")}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-destructive text-sm">{errors.password}</p>
            )}
            
            {/* Password Requirements */}
            {formData.password && (
              <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Password Requirements:</p>
                <RequirementItem met={passwordRequirements.length} text="At least 8 characters" />
                <RequirementItem met={passwordRequirements.uppercase} text="One uppercase letter" />
                <RequirementItem met={passwordRequirements.lowercase} text="One lowercase letter" />
                <RequirementItem met={passwordRequirements.number} text="One number" />
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Log In
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RegisterForm;
