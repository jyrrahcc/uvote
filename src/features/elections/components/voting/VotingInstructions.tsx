
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Election } from "@/types";
import ElectionStatusAlert from "../ElectionStatusAlert";

interface VotingInstructionsProps {
  election: Election;
  isInCandidacyPeriod: boolean;
  userHasVoted: boolean;
}

const VotingInstructions = ({ election, isInCandidacyPeriod, userHasVoted }: VotingInstructionsProps) => {
  return (
    <>
      {/* Election Status Alerts */}
      {election.status === 'completed' && (
        <ElectionStatusAlert election={election} status="completed" />
      )}
      
      {election.status === 'upcoming' && (
        <ElectionStatusAlert election={election} status="upcoming" />
      )}

      {/* Candidacy Period Alert */}
      {isInCandidacyPeriod && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertTitle className="text-blue-800">Candidacy Period is Active</AlertTitle>
          <AlertDescription className="text-blue-700">
            <p>The candidacy period for this election is now open. Eligible DLSU-D community members may apply as candidates until {new Date(election.candidacyEndDate!).toLocaleString()}.</p>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Voter instructions */}
      {election.status === 'active' && !userHasVoted && (
        <Alert className="mb-6 bg-[#008f50]/5 border-[#008f50]/20">
          <AlertTitle className="text-[#008f50]">DLSU-D Election Voting Instructions</AlertTitle>
          <AlertDescription>
            <p>Please review all candidates carefully before casting your vote. Once submitted, your vote cannot be changed.</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Select one candidate for each position</li>
              <li>You may choose to abstain for any position</li>
              <li>Your vote is confidential and secure</li>
              <li>Results will be available after the election ends</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default VotingInstructions;
