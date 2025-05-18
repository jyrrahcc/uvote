
import { forwardRef, useImperativeHandle, ForwardRefRenderFunction } from "react";
import EligibleVotersManager from "../../EligibleVotersManager";

interface ElectionVotersTabProps {
  electionId: string | null;
}

const ElectionVotersTab: ForwardRefRenderFunction<any, ElectionVotersTabProps> = (
  { electionId },
  ref
) => {
  // Use forwardRef to expose the EligibleVotersManager ref to parent
  useImperativeHandle(ref, () => ({
    getEligibleVotersForNewElection: () => {
      if (ref && 'current' in ref && ref.current) {
        return ref.current.getEligibleVotersForNewElection?.();
      }
      return [];
    }
  }));

  return (
    <div className="space-y-4">
      <EligibleVotersManager
        ref={ref}
        electionId={electionId}
        isNewElection={!electionId}
      />
    </div>
  );
};

export default forwardRef(ElectionVotersTab);
