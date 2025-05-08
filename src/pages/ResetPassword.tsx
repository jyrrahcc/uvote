
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import PageLayout from "@/components/layout/PageLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { KeyRound, CheckCircle } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReset, setIsReset] = useState(false);
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's a hash fragment in the URL (from Supabase auth)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (!hashParams.get("access_token")) {
      toast.error("Invalid reset link", {
        description: "This password reset link is invalid or has expired.",
      });
      setTimeout(() => navigate("/login"), 3000);
    }
  }, [navigate]);

  const validatePassword = () => {
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      toast.success("Password updated successfully", {
        description: "Your password has been updated. You can now log in with your new password.",
        duration: 5000,
      });
      
      // Show success state
      setIsReset(true);
      
      // Sign out and redirect to login after a delay
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Failed to update password", {
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card className="border-none shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-primary/80 to-primary p-6 text-white">
              <div className="flex items-center justify-center mb-2">
                <KeyRound size={28} className="mr-2" />
                <h1 className="text-2xl font-bold">Create New Password</h1>
              </div>
            </div>
            
            {!isReset ? (
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardDescription className="text-center">
                    Please enter a new secure password for your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  {error && (
                    <p className="text-sm font-medium text-destructive">{error}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters long
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Updating..." : "Update Password"}
                  </Button>
                </CardFooter>
              </form>
            ) : (
              <CardContent className="space-y-4 py-8 text-center">
                <div className="flex justify-center text-green-500">
                  <CheckCircle size={48} />
                </div>
                <h3 className="text-lg font-medium mt-4">Password Reset Successful</h3>
                <p className="text-muted-foreground">
                  Your password has been updated successfully. You will be redirected to the login page shortly.
                </p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default ResetPassword;
