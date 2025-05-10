
import { forwardRef, useImperativeHandle, ForwardRefRenderFunction } from "react";
import CandidateManager from "../../CandidateManager";

interface ElectionCandidatesTabProps {
  electionId: string | null;
  candidacyStartDate: string;
  candidacyEndDate: string;
  positions: string[];
}

const ElectionCandidatesTab: ForwardRefRenderFunction<any, ElectionCandidatesTabProps> = (
  { electionId, candidacyStartDate, candidacyEndDate, positions },
  ref
) => {
  // Use forwardRef to expose the CandidateManager ref to parent
  useImperativeHandle(ref, () => ({
    getCandidatesForNewElection: () => {
      if (ref && 'current' in ref && ref.current) {
        return ref.current.getCandidatesForNewElection?.();
      }
      return [];
    }
  }));

  return (
    <CandidateManager
      ref={ref}
      electionId={electionId}
      isNewElection={!electionId}
      candidacyStartDate={candidacyStartDate}
      candidacyEndDate={candidacyEndDate}
      isAdmin={true}
      positions={positions}
    />
  );
};

export default forwardRef(ElectionCandidatesTab);
