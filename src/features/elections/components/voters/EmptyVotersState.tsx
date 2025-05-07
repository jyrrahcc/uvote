
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

interface EmptyVotersStateProps {
  setRestrictVoting: (value: boolean) => void;
}

const EmptyVotersState = ({ setRestrictVoting }: EmptyVotersStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <User className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">Open to All Voters</h3>
      <p className="text-muted-foreground max-w-md">
        Anyone with access to this election will be able to vote. To restrict voting to specific users, 
        enable the "Restrict Voting" option above.
      </p>
      
      <Button 
        onClick={() => setRestrictVoting(true)} 
        variant="outline" 
        className="mt-4"
      >
        Enable Voter Restriction
      </Button>
    </div>
  );
};

export default EmptyVotersState;
