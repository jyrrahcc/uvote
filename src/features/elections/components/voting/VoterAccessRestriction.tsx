
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { University } from "lucide-react";
import { Election } from "@/types";
import ElectionHeader from "../ElectionHeader";

interface VoterAccessRestrictionProps {
  election: Election;
  reason?: string | null;
}

const VoterAccessRestriction = ({ election, reason }: VoterAccessRestrictionProps) => {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex items-center mb-6">
        <University className="h-7 w-7 mr-2 text-[#008f50]" />
        <h1 className="text-2xl font-bold">{election.department || "University-wide"} Election</h1>
      </div>
      
      <ElectionHeader election={election} hasVoted={false} isVoter={false} />
      
      <Alert className="mb-6 bg-red-50 border-red-200">
        <AlertTitle className="text-red-700">Access Restricted</AlertTitle>
        <AlertDescription className="text-red-600">
          <p>{reason || "You are not eligible to vote in this election. Please contact the election administrator if you believe this is an error."}</p>
          
          {!reason && election.restrictVoting && (
            <div className="mt-4">
              <h4 className="font-medium mb-1">Eligibility Requirements:</h4>
              
              {election.departments && election.departments.length > 0 && (
                <p className="mt-2">
                  <span className="font-medium">Department:</span> {election.departments.join(', ')}
                </p>
              )}
              
              {election.eligibleYearLevels && election.eligibleYearLevels.length > 0 && (
                <p>
                  <span className="font-medium">Year Level:</span> {election.eligibleYearLevels.join(', ')}
                </p>
              )}
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default VoterAccessRestriction;
