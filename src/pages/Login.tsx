
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import LoginForm from "@/features/auth/components/LoginForm";
import { ArrowRight, Vote, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  createAdminUser, 
  loginAsAdmin, 
  ADMIN_TEST_EMAIL, 
  ADMIN_TEST_PASSWORD 
} from "@/utils/admin/adminUserUtils";
import { useState, useEffect } from "react";

/**
 * Login page component with enhanced design
 */
const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  // Initialize admin user when component mounts, but don't block rendering
  useEffect(() => {
    const initAdminUser = async () => {
      try {
        await createAdminUser();
      } catch (error) {
        console.error("Error initializing admin user:", error);
      }
    };

    initAdminUser();
  }, []);

  const handleAdminLogin = async () => {
    setIsCreatingAdmin(true);
    
    try {
      const success = await loginAsAdmin();
      if (success) {
        // Give the auth state a moment to update before navigating
        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      }
    } catch (error) {
      console.error("Error during admin login:", error);
      toast({
        title: "Login Failed",
        description: "There was a problem logging in as admin. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const copyAdminCredentials = () => {
    navigator.clipboard.writeText(`Email: ${ADMIN_TEST_EMAIL}\nPassword: ${ADMIN_TEST_PASSWORD}`);
    toast({
      title: "Copied!",
      description: "Admin credentials copied to clipboard",
    });
  };

  return (
    <PageLayout>
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary/80 to-primary p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <Vote size={32} className="mr-2" />
              <h1 className="text-3xl font-bold">Welcome Back</h1>
            </div>
            <p className="text-center text-white/90">
              Sign in to access your account and continue voting
            </p>
          </div>
          
          <div className="p-8">
            <LoginForm />
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary hover:underline font-medium inline-flex items-center">
                  Create one now <ArrowRight size={14} className="ml-1" />
                </Link>
              </p>

              <div className="mt-8 border-t border-gray-200 pt-6">
                <div className="flex flex-col items-center space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">For demo purposes</p>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center" 
                    onClick={handleAdminLogin}
                    disabled={isCreatingAdmin}
                  >
                    <Shield size={16} className="mr-2 text-amber-500" />
                    {isCreatingAdmin ? "Logging in..." : "Login as Admin"}
                  </Button>
                  
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>Email: {ADMIN_TEST_EMAIL}</span>
                    <span>Password: {ADMIN_TEST_PASSWORD}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={copyAdminCredentials}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Login;
