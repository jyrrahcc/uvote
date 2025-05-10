
import { Candidate } from "@/types";
import CandidatesList from "@/features/candidates/components/CandidatesList";
import PositionCandidatesList from "./PositionCandidatesList";

interface CandidatesTabProps {
  positions: string[] | undefined;
  candidates: Candidate[] | null;
}

const CandidatesTab = ({ positions, candidates }: CandidatesTabProps) => {
  if (!candidates) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No candidates found</p>
      </div>
    );
  }

  if (positions && positions.length > 0) {
    return (
      <div className="space-y-8">
        <h2 className="text-xl font-semibold">Election Candidates</h2>
        {positions.map((position) => (
          <PositionCandidatesList 
            key={position} 
            position={position} 
            candidates={candidates} 
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Election Candidates</h2>
      {candidates.length > 0 ? (
        <CandidatesList candidates={candidates} readOnly={true} />
      ) : (
        <div className="text-center py-6">
          <p className="text-muted-foreground">No candidates have been added to this election yet.</p>
        </div>
      )}
    </div>
  );
};

export default CandidatesTab;
