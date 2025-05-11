
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Election } from "@/types";

interface VoterEligibilityAlertProps {
  election: Election;
  reason: string | null;
}

const VoterEligibilityAlert = ({ election, reason }: VoterEligibilityAlertProps) => {
  return (
    <Alert className="mb-6 bg-red-50 border-red-200">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertTitle className="text-red-700">Not Eligible</AlertTitle>
      <AlertDescription className="text-red-600">
        <p>{reason || "You are not eligible to participate in this election based on your department or year level."}</p>
        <p className="mt-2">
          This election is restricted to 
          {election.departments?.length ? (
            <span> {election.departments.join(', ')} departments</span>
          ) : (
            <span> specific departments</span>
          )}
          {election.eligibleYearLevels?.length ? (
            <span> and {election.eligibleYearLevels.join(', ')} year levels</span>
          ) : ""}
          .
        </p>
      </AlertDescription>
    </Alert>
  );
};

export default VoterEligibilityAlert;
