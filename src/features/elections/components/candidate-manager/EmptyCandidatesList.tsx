
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyCandidatesListProps {
  onAddCandidate: () => void;
}

const EmptyCandidatesList = ({ onAddCandidate }: EmptyCandidatesListProps) => {
  return (
    <div className="text-center p-4 border border-dashed rounded-md">
      <p className="text-muted-foreground mb-4">No candidates added yet.</p>
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        onClick={onAddCandidate}
        className="mx-auto"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Candidate
      </Button>
    </div>
  );
};

export default EmptyCandidatesList;
