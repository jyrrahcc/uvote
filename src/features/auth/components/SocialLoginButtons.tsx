
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

interface SocialLoginButtonsProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const SocialLoginButtons = ({ isLoading, setIsLoading }: SocialLoginButtonsProps) => {
  const { signInWithGoogle, signInWithMicrosoft } = useAuth();

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

  return (
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
  );
};
