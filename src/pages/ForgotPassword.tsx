
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import PageLayout from "@/components/layout/PageLayout";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, KeyRound, MailCheck } from "lucide-react";
import { toast as sonnerToast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error, data } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setIsSubmitted(true);
      sonnerToast.success("Password reset email sent", {
        description: "Please check your email for the password reset link.",
        duration: 5000,
      });
      
      console.log("Password reset email sent successfully:", data);
    } catch (error) {
      console.error("Password reset error:", error);
      sonnerToast.error("Failed to send password reset email", {
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-md mx-auto">
          <Card className="border-none shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-primary/80 to-primary p-6 text-white">
              <div className="flex items-center justify-center mb-2">
                <KeyRound size={28} className="mr-2" />
                <h1 className="text-2xl font-bold">Reset Password</h1>
              </div>
            </div>
            
            <CardHeader>
              <CardDescription className="text-center">
                Enter your email address and we'll send you a link to reset your password.
              </CardDescription>
            </CardHeader>
            
            {!isSubmitted ? (
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                      className="h-11"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full h-11" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                  <div className="text-center text-sm">
                    <Link to="/login" className="text-primary hover:underline inline-flex items-center">
                      <ArrowLeft size={14} className="mr-1" /> Back to Login
                    </Link>
                  </div>
                </CardFooter>
              </form>
            ) : (
              <CardContent className="space-y-4 py-8 text-center">
                <div className="flex justify-center text-primary">
                  <MailCheck size={48} />
                </div>
                <h3 className="text-lg font-medium mt-4">Check Your Email</h3>
                <p className="text-muted-foreground">
                  If an account exists with that email, you'll receive a password reset link shortly.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  asChild
                >
                  <Link to="/login">Return to Login</Link>
                </Button>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default ForgotPassword;
