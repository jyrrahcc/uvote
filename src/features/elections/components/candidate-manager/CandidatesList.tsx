
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Candidate } from "@/types";
import CandidateItem from "./CandidateItem";
import EmptyCandidatesList from "./EmptyCandidatesList";
import { DLSU_DEPARTMENTS, YEAR_LEVELS } from "@/types/constants";

interface CandidatesListProps {
  candidates: Candidate[];
  positions: string[];
  onAddCandidate: () => void;
  onRemoveCandidate: (index: number) => void;
  onUpdateCandidate: (index: number, field: keyof Candidate, value: string) => void;
  onPreviewImage: (url: string) => void;
}

const CandidatesList = ({
  candidates,
  positions,
  onAddCandidate,
  onRemoveCandidate,
  onUpdateCandidate,
  onPreviewImage
}: CandidatesListProps) => {
  if (candidates.length === 0) {
    return <EmptyCandidatesList onAddCandidate={onAddCandidate} />;
  }

  return (
    <div className="space-y-4">
      {candidates.map((candidate, index) => (
        <div key={candidate.id}>
          <CandidateItem
            candidate={candidate}
            index={index}
            onUpdate={onUpdateCandidate}
            onRemove={onRemoveCandidate}
            positions={positions}
            departments={DLSU_DEPARTMENTS}
            yearLevels={YEAR_LEVELS}
            onPreviewImage={onPreviewImage}
          />
          {index < candidates.length - 1 && <Separator className="mt-4" />}
        </div>
      ))}
      
      <Button type="button" variant="outline" size="sm" onClick={onAddCandidate} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add Another Candidate
      </Button>
    </div>
  );
};

export default CandidatesList;
