
import { Card, CardContent } from "@/components/ui/card";
import { Candidate } from "@/types";

interface PositionVoteCardProps {
  position: string;
  candidates: Candidate[];
  positionVotes: Record<string, any>;
}

const PositionVoteCard = ({ position, candidates, positionVotes }: PositionVoteCardProps) => {
  const positionData = positionVotes[position];
  const totalVotes = positionData?.totalVotes || 0;
  
  return (
    <Card key={position} className="overflow-hidden">
      <div className="bg-muted p-4">
        <h3 className="font-medium">{position}</h3>
        <p className="text-sm text-muted-foreground">
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} cast
        </p>
      </div>
      <CardContent className="p-0">
        {candidates
          ?.filter(candidate => candidate.position === position)
          .map((candidate) => {
            const candidateVotes = positionData?.candidates[candidate.id] || 0;
            const percentage = totalVotes > 0 ? (candidateVotes / totalVotes) * 100 : 0;
            
            return (
              <div 
                key={candidate.id}
                className="p-4 border-b last:border-b-0 flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  {candidate.image_url && (
                    <div className="h-10 w-10 rounded-full overflow-hidden">
                      <img 
                        src={candidate.image_url}
                        alt={candidate.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{candidate.name}</p>
                    {candidate.bio && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {candidate.bio}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{candidateVotes}</p>
                  <p className="text-xs text-muted-foreground">
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            );
          })}
          
        {candidates?.filter(candidate => candidate.position === position).length === 0 && (
          <div className="p-6 text-center text-muted-foreground">
            No candidates for this position
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PositionVoteCard;
