
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import RegisterForm from "@/features/auth/components/RegisterForm";
import { ArrowRight, UserPlus } from "lucide-react";

/**
 * Register page component with enhanced design
 */
const Register = () => {
  return (
    <PageLayout>
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary/80 to-primary p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <UserPlus size={32} className="mr-2" />
              <h1 className="text-3xl font-bold">Join uVote</h1>
            </div>
            <p className="text-center text-white/90">
              Create your account to participate in secure and transparent elections
            </p>
          </div>
          
          <div className="p-8">
            <RegisterForm />
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium inline-flex items-center">
                  Sign in <ArrowRight size={14} className="ml-1" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Register;
