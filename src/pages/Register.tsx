
import PageLayout from "@/components/layout/PageLayout";
import RegisterForm from "@/features/auth/components/RegisterForm";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Register page component
 */
const Register = () => {
  const isMobile = useIsMobile();
  
  return (
    <PageLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Create Your uVote Account</h1>
          <RegisterForm />
        </div>
      </div>
    </PageLayout>
  );
};

export default Register;
