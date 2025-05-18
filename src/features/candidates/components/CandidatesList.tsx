import { Candidate } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CandidateCard from "./CandidateCard";
import EmptyCandidatesList from "./EmptyCandidatesList";

export interface CandidatesListProps {
  candidates: Candidate[];
  isAdmin?: boolean;
  onDeleteCandidate?: (id: string) => void;
  onOpenAddDialog?: () => void;
}

const CandidatesList = ({ 
  candidates, 
  isAdmin = false, 
  onDeleteCandidate,
  onOpenAddDialog 
}: CandidatesListProps) => {
  if (!candidates || candidates.length === 0) {
    return <EmptyCandidatesList isAdmin={isAdmin} onOpenAddDialog={onOpenAddDialog} />;
  }

  return (
    <div>
      {isAdmin && (
        <div className="mb-4 flex justify-end">
          <Button onClick={onOpenAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Candidate
          </Button>
        </div>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            isAdmin={isAdmin}
            onDeleteCandidate={onDeleteCandidate}
          />
        ))}
      </div>
    </div>
  );
};

export default CandidatesList;
