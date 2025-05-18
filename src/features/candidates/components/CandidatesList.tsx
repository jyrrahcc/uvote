
import { Candidate } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CandidateCard from "./CandidateCard";

interface CandidatesListProps {
  candidates: Candidate[];
  loading?: boolean;
  isAdmin?: boolean;
  onDeleteCandidate?: (id: string) => void;
  onOpenAddDialog?: () => void;
  selectedCandidateId?: string | null;
  onSelectCandidate?: (candidateId: string) => void;
  readOnly?: boolean;
}

const CandidatesList = ({ 
  candidates, 
  loading = false, 
  isAdmin = false,
  onDeleteCandidate,
  onOpenAddDialog,
  selectedCandidateId,
  onSelectCandidate,
  readOnly = false
}: CandidatesListProps) => {
  if (loading) {
    return <div className="text-center py-10">Loading candidates...</div>;
  }

  if (candidates.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-10">
          <p className="text-muted-foreground">
            No candidates have been added to this election yet.
          </p>
          {isAdmin && (
            <Button className="mt-4" onClick={onOpenAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Candidate
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // For voting page, when selection is enabled
  if (onSelectCandidate) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate) => (
          <div 
            key={candidate.id}
            onClick={() => !readOnly && onSelectCandidate(candidate.id)}
            className={`cursor-pointer transition-all ${selectedCandidateId === candidate.id ? 'ring-2 ring-primary ring-offset-2' : ''}`}
          >
            <CandidateCard 
              candidate={candidate} 
              onClick={() => {}} 
              onDelete={undefined}
            />
          </div>
        ))}
      </div>
    );
  }

  // For admin/management page when deletion is available
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {candidates.map((candidate) => (
        <CandidateCard 
          key={candidate.id} 
          candidate={candidate}
          onClick={() => {}} 
          onDelete={isAdmin ? () => onDeleteCandidate?.(candidate.id) : undefined} 
        />
      ))}
    </div>
  );
};

export default CandidatesList;
