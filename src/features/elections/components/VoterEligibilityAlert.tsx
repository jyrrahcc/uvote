
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Election } from "@/types";

interface VoterEligibilityAlertProps {
  election: Election;
  reason: string | null;
}

const VoterEligibilityAlert = ({ election, reason }: VoterEligibilityAlertProps) => {
  // Use either colleges or department for backward compatibility
  const collegesList = election.colleges || (election.department ? [election.department] : []);
  
  return (
    <Alert className="mb-6 bg-red-50 border-red-200">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertTitle className="text-red-700">Not Eligible</AlertTitle>
      <AlertDescription className="text-red-600">
        <p>{reason || "You are not eligible to participate in this election based on your college or year level."}</p>
        <p className="mt-2">
          This election is restricted to 
          {collegesList?.length ? (
            <span> {collegesList.join(', ')} colleges</span>
          ) : (
            <span> specific colleges</span>
          )}
          {election.eligibleYearLevels?.length ? (
            <span> and {election.eligibleYearLevels.join(', ')} year levels</span>
          ) : ""}
          {election.allowFaculty === false && (
            <span> (Faculty members are not eligible)</span>
          )}
          .
        </p>
      </AlertDescription>
    </Alert>
  );
};

export default VoterEligibilityAlert;
