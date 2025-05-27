
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { Candidate } from "@/types";
import CandidateItem from "./CandidateItem";

interface CandidatesListProps {
  candidates: Candidate[];
  positions: string[];
  departments: string[];
  yearLevels: string[];
  onAddCandidate: () => void;
  onRemoveCandidate: (index: number) => void;
  onUpdateCandidate: (index: number, field: keyof Candidate, value: string) => void;
  onPreviewImage: (url: string) => void;
}

const CandidatesList = ({
  candidates,
  positions,
  departments,
  yearLevels,
  onAddCandidate,
  onRemoveCandidate,
  onUpdateCandidate,
  onPreviewImage
}: CandidatesListProps) => {
  if (candidates.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">No candidates added yet</p>
        <Button onClick={onAddCandidate} variant="outline">
          Add First Candidate
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {candidates.map((candidate, index) => (
        <CandidateItem
          key={candidate.id || index}
          candidate={candidate}
          index={index}
          onUpdate={onUpdateCandidate}
          onRemove={onRemoveCandidate}
          positions={positions}
          departments={departments}
          yearLevels={yearLevels}
          onPreviewImage={onPreviewImage}
        />
      ))}
    </div>
  );
};

export default CandidatesList;
