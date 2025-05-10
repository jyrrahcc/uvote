
import { Plus } from "lucide-react";

interface EmptyCandidatesListProps {
  onAddCandidate: () => void;
}

const EmptyCandidatesList = ({ onAddCandidate }: EmptyCandidatesListProps) => {
  return (
    <div className="text-center p-4 border border-dashed rounded-md">
      <p className="text-muted-foreground">No candidates added yet. Click "Add Candidate" to get started.</p>
    </div>
  );
};

export default EmptyCandidatesList;
