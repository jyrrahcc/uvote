
interface CandidacyMessageProps {
  candidacyStartDate: string | undefined;
  candidacyEndDate: string | undefined;
  isAdmin: boolean;
  isNewElection: boolean;
  isInCandidacyPeriod: boolean;
}

const CandidacyMessage = ({
  candidacyStartDate,
  candidacyEndDate,
  isAdmin,
  isNewElection,
  isInCandidacyPeriod
}: CandidacyMessageProps) => {
  // Only show message for non-admin users when not in candidacy period and not a new election
  if (isAdmin || isNewElection || isInCandidacyPeriod) {
    return null;
  }

  return (
    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md mb-4">
      Candidates can only be added during the candidacy period (
        {candidacyStartDate ? new Date(candidacyStartDate).toLocaleDateString() : "Not set"} - 
        {candidacyEndDate ? new Date(candidacyEndDate).toLocaleDateString() : "Not set"}).
    </div>
  );
};

export default CandidacyMessage;
