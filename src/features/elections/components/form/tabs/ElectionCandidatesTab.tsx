
import { forwardRef, useImperativeHandle, useRef } from "react";
import CandidateManager from "../../CandidateManager";

interface ElectionCandidatesTabProps {
  electionId: string | null;
  candidacyStartDate: string;
  candidacyEndDate: string;
  positions: string[];
}

const ElectionCandidatesTab = forwardRef<any, ElectionCandidatesTabProps>(
  ({ electionId, candidacyStartDate, candidacyEndDate, positions }, ref) => {
    // Create a local ref to the CandidateManager
    const candidateManagerRef = useRef<any>(null);

    // Expose the CandidateManager methods to the parent component
    useImperativeHandle(ref, () => ({
      getCandidatesForNewElection: () => {
        if (candidateManagerRef.current && candidateManagerRef.current.getCandidatesForNewElection) {
          return candidateManagerRef.current.getCandidatesForNewElection();
        }
        return [];
      }
    }));

    return (
      <CandidateManager
        ref={candidateManagerRef}
        electionId={electionId}
        isNewElection={!electionId}
        candidacyStartDate={candidacyStartDate}
        candidacyEndDate={candidacyEndDate}
        isAdmin={true}
        positions={positions}
      />
    );
  }
);

ElectionCandidatesTab.displayName = "ElectionCandidatesTab";

export default ElectionCandidatesTab;
