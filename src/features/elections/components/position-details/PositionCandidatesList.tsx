
import { Separator } from "@/components/ui/separator";
import { Candidate } from "@/types";
import CandidatesList from "@/features/candidates/components/CandidatesList";

interface PositionCandidatesListProps {
  position: string;
  candidates: Candidate[];
}

const PositionCandidatesList = ({ position, candidates }: PositionCandidatesListProps) => {
  const positionCandidates = candidates.filter(c => c.position === position);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{position}</h3>
      <Separator />
      
      {positionCandidates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {positionCandidates.map((candidate) => (
            <CandidatesList 
              key={candidate.id}
              candidates={[candidate]}
              readOnly={true}
            />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No candidates for this position</p>
      )}
    </div>
  );
};

export default PositionCandidatesList;
