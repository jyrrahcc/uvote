
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CandidateManagerHeaderProps {
  onAddCandidate: () => void;
  showAddButton: boolean;
}

const CandidateManagerHeader = ({ onAddCandidate, showAddButton }: CandidateManagerHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-medium">Candidates</h3>
      {showAddButton && (
        <Button type="button" variant="outline" size="sm" onClick={onAddCandidate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Candidate
        </Button>
      )}
    </div>
  );
};

export default CandidateManagerHeader;
