
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface VoterParticipationCardProps {
  participationRate: number;
  totalVotes: number;
  actualEligibleVoters: number;
  loading: boolean;
}

const VoterParticipationCard: React.FC<VoterParticipationCardProps> = ({
  participationRate,
  totalVotes,
  actualEligibleVoters,
  loading
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Voter Participation
        </CardTitle>
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold">
            {loading ? "..." : `${participationRate}%`}
          </div>
          <Users className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>
          {totalVotes} out of {loading ? "..." : actualEligibleVoters} eligible voters
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Progress value={loading ? 0 : participationRate} className="h-2" />
      </CardContent>
    </Card>
  );
};

export default VoterParticipationCard;
