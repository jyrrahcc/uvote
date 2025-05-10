
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Election, Candidate } from "@/types";

interface ElectionOverviewTabProps {
  election: Election;
  candidates: Candidate[] | null;
  positionVotes: Record<string, any>;
  formatDate: (dateString: string) => string;
}

import PositionVoteCard from "./PositionVoteCard";

const ElectionOverviewTab = ({ 
  election, 
  candidates, 
  positionVotes, 
  formatDate 
}: ElectionOverviewTabProps) => {
  if (election.status === "active" && election.positions && election.positions.length > 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Live Election Results</h2>
        
        {election.positions.map((position) => (
          <PositionVoteCard 
            key={position} 
            position={position} 
            candidates={candidates || []} 
            positionVotes={positionVotes} 
          />
        ))}
      </div>
    );
  }
  
  return (
    <div className="text-center py-6">
      <h2 className="text-xl font-semibold mb-2">
        {election.status === "upcoming" ? "Election has not started yet" : "Election has ended"}
      </h2>
      <p className="text-muted-foreground">
        {election.status === "upcoming" 
          ? `Voting will begin on ${formatDate(election.startDate)}`
          : `The election ended on ${formatDate(election.endDate)}`
        }
      </p>
      
      {election.status === "completed" && (
        <Button className="mt-4" asChild>
          <Link to={`/elections/${election.id}/results`}>View Full Results</Link>
        </Button>
      )}
    </div>
  );
};

export default ElectionOverviewTab;
