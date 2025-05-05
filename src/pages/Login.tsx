
import PageLayout from "@/components/layout/PageLayout";
import LoginForm from "@/features/auth/components/LoginForm";

/**
 * Login page component
 */
const Login = () => {
  return (
    <PageLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Log In to uVote</h1>
          <LoginForm />
        </div>
      </div>
    </PageLayout>
  );
};

export default Login;
