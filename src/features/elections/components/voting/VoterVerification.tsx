
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface VoterVerificationProps {
  isVoter: boolean;
  showToast?: boolean; // Add this prop to control toast display
}

const VoterVerification = ({ isVoter, showToast = false }: VoterVerificationProps) => {
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
