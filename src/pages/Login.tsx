
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import LoginForm from "@/features/auth/components/LoginForm";
import { ArrowRight, Vote } from "lucide-react";

/**
 * Login page component with enhanced design and improved error handling
 */
const Login = () => {
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
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Login;
