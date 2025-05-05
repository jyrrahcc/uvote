
import { useAuth } from "@/features/auth/context/AuthContext";

interface WelcomeHeaderProps {
  userRole: string | null;
}

const WelcomeHeader = ({ userRole }: WelcomeHeaderProps) => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold">
        Welcome, {user?.user_metadata?.first_name || 'User'}
      </h1>
      <p className="text-muted-foreground">
        You are logged in as a {userRole || 'user'}
      </p>
    </div>
  );
};

export default WelcomeHeader;
