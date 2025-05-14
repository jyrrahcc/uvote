
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useRole } from "@/features/auth/context/RoleContext";
import { toast } from "sonner";

interface VoterVerificationProps {
  isVoter?: boolean; // Make this prop optional
  showToast?: boolean;
}

const VoterVerification = ({ isVoterProp, showToast = false }: VoterVerificationProps) => {
  // Use the role context to get the current voter status
  const { isVoter, isAdmin } = useRole();
  
  // Use the prop if provided, otherwise use the value from the hook
  const userIsVoter = isVoterProp !== undefined ? isVoterProp : (isVoter || isAdmin);
  
  // If the user has the voter role or is an admin, don't show the verification message
  if (userIsVoter) return null;
  
  // Show toast notification if requested
  React.useEffect(() => {
    if (showToast) {
      toast.error("Verification required", {
        description: "You need voter privileges to participate in this election."
      });
    }
  }, [showToast]);
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Verification Required</CardTitle>
        <CardDescription>
          You need voter privileges to participate in elections.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <div className="rounded-full bg-amber-100 p-3 mb-4">
          <AlertTriangle className="h-8 w-8 text-amber-600" />
        </div>
        <p className="text-center text-muted-foreground mb-4">
          Only users with voter privileges can cast votes in elections.
          Please complete your profile and wait for an admin to assign you the voter role.
        </p>
        
        <Button asChild variant="default">
          <Link to="/profile">Go to Profile</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default VoterVerification;
