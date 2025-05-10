
import { forwardRef, useImperativeHandle, ForwardRefRenderFunction } from "react";
import { FormField, FormItem, FormControl, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import EligibleVotersManager from "../../EligibleVotersManager";

interface ElectionVotersTabProps {
  electionId: string | null;
  restrictVoting: boolean;
  setRestrictVoting: (value: boolean) => void;
}

const ElectionVotersTab: ForwardRefRenderFunction<any, ElectionVotersTabProps> = (
  { electionId, restrictVoting, setRestrictVoting },
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
      <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
        <Checkbox
          checked={restrictVoting}
          onCheckedChange={(checked) => setRestrictVoting(!!checked)}
        />
        <div className="space-y-1 leading-none">
          <FormLabel>
            Restrict Voting
          </FormLabel>
          <p className="text-sm text-muted-foreground">
            Only selected users will be allowed to vote in this election
          </p>
        </div>
      </div>
      
      <EligibleVotersManager
        ref={ref}
        electionId={electionId}
        isNewElection={!electionId}
        restrictVoting={restrictVoting}
        setRestrictVoting={setRestrictVoting}
      />
    </div>
  );
};

export default forwardRef(ElectionVotersTab);
