
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useRole } from "@/features/auth/context/RoleContext";

interface VoterVerificationProps {
  isVoter?: boolean; // Make this prop optional
  showToast?: boolean;
}

const VoterVerification = ({ isVoter: propsIsVoter, showToast = false }: VoterVerificationProps) => {
  // Use the role context to get the current voter status
  const { isVoter: contextIsVoter } = useRole();
  
  // Use the prop value if provided, otherwise use the context value
  const isVoter = propsIsVoter !== undefined ? propsIsVoter : contextIsVoter;
  
  if (isVoter) return null;
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Verification Required</CardTitle>
        <CardDescription>
          You need to verify your profile to participate in elections.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <div className="rounded-full bg-amber-100 p-3 mb-4">
          <AlertTriangle className="h-8 w-8 text-amber-600" />
        </div>
        <p className="text-center text-muted-foreground mb-4">
          Only verified users with voter privileges can cast votes in elections.
          Please complete your profile and wait for an admin to verify your account.
        </p>
        
        <Button asChild variant="default">
          <Link to="/profile">Go to Profile</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default VoterVerification;
