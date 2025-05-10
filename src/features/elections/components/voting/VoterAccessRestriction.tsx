
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { University } from "lucide-react";
import { Election } from "@/types";
import ElectionHeader from "../ElectionHeader";

interface VoterAccessRestrictionProps {
  election: Election;
}

const VoterAccessRestriction = ({ election }: VoterAccessRestrictionProps) => {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex items-center mb-6">
        <University className="h-7 w-7 mr-2 text-[#008f50]" />
        <h1 className="text-2xl font-bold">{election.department || "University-wide"} Election</h1>
      </div>
      
      <ElectionHeader election={election} />
      
      <Alert className="mb-6 bg-red-50 border-red-200">
        <AlertTitle className="text-red-700">Access Restricted</AlertTitle>
        <AlertDescription className="text-red-600">
          <p>You are not eligible to vote in this election. Please contact the election administrator if you believe this is an error.</p>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default VoterAccessRestriction;
