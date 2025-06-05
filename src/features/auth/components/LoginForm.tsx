
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

/**
 * Login form for authenticating existing users
 */
const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { signIn, signInWithGoogle, signInWithMicrosoft } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    setFormError(null);
    
    if (!email.trim()) {
      setFormError("Email is required");
      return false;
    }
    
    if (!password) {
      setFormError("Password is required");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Attempting login with:", { email });
      const { error, data } = await signIn(email, password);
      
      if (error) {
        console.error("Login error details:", error);
        
        // Map specific Supabase error messages to user-friendly messages
        let errorMessage = "Login failed";
        
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please verify your email before logging in";
        } else if (error.message.includes("rate limit")) {
          errorMessage = "Too many login attempts. Please try again later";
        } else {
          errorMessage = error.message || "An unexpected error occurred";
        }
        
        setFormError(errorMessage);
        toast.error("Login failed", {
          description: errorMessage,
        });
        return;
      }
      
      toast.success("Welcome back!", {
        description: "You've been logged in successfully.",
      });
      
      // Navigate to dashboard after successful login
      navigate("/dashboard");
    } catch (error) {
      console.error("Unexpected login error:", error);
      
      setFormError("An unexpected error occurred. Please try again.");
      toast.error("Login failed", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setFormError(null);
    try {
      await signInWithGoogle();
      // Redirect happens in AuthContext after successful OAuth
    } catch (error) {
      console.error("Google login error:", error);
      setFormError("Failed to login with Google");
      toast.error("Login failed", {
        description: "Failed to login with Google. Please try again.",
      });
    }
  };

  const handleMicrosoftLogin = async () => {
    setFormError(null);
    try {
      await signInWithMicrosoft();
      // Redirect happens in AuthContext after successful OAuth
    } catch (error) {
      console.error("Microsoft login error:", error);
      setFormError("Failed to login with Microsoft");
      toast.error("Login failed", {
        description: "Failed to login with Microsoft. Please try again.",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Log In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {formError && (
            <div className="p-3 text-sm border border-red-200 rounded-md bg-red-50 text-red-600">
              {formError}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (formError) setFormError(null);
              }}
              placeholder="your.email@example.com"
              required
              autoComplete="email"
              className={formError && !email ? "border-red-500" : ""}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formError) setFormError(null);
                }}
                required
                autoComplete="current-password"
                className={formError && !password ? "border-red-500 pr-10" : "pr-10"}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log in"}
          </Button>
          
          <div className="flex items-center gap-2 my-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>
          
          <div className="flex flex-col gap-2">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              Continue with Google
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleMicrosoftLogin}
              disabled={isLoading}
            >
              Continue with Microsoft
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
};

export default LoginForm;
