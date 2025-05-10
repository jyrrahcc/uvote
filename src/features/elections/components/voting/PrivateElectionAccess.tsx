
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Lock, University } from "lucide-react";
import AccessCodeInput from "../AccessCodeInput";
import { Election } from "@/types";

interface PrivateElectionAccessProps {
  election: Election;
  onVerify: (verified: boolean) => void;
}

const PrivateElectionAccess = ({ election, onVerify }: PrivateElectionAccessProps) => {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex items-center justify-center mb-8">
        <University className="h-8 w-8 mr-2 text-[#008f50]" />
        <h1 className="text-2xl font-semibold">DLSU-D Election Access</h1>
      </div>
      
      <Card className="max-w-md mx-auto">
        <CardHeader className="flex flex-row items-center gap-2">
          <Lock className="h-5 w-5 text-[#008f50]" />
          <div>
            <h2 className="text-xl font-medium">Private Election</h2>
            <p className="text-muted-foreground">This election requires an access code</p>
          </div>
        </CardHeader>
        <CardContent>
          <AccessCodeInput 
            accessCode={election.accessCode} 
            onVerify={(verified) => {
              if (verified) {
                onVerify(true);
                toast.success("Access code verified. You may now view this election.");
              } else {
                toast.error("Invalid access code. Please try again.");
              }
            }} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivateElectionAccess;
