
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface VoterEngagementCardProps {
  totalVotes: number;
  actualEligibleVoters: number;
  positionsCount: number;
  loading: boolean;
}

const VoterEngagementCard: React.FC<VoterEngagementCardProps> = ({
  totalVotes,
  actualEligibleVoters,
  positionsCount,
  loading
}) => {
  const engagementRate = loading ? 0 : (totalVotes > 0 ? 
    Math.min(100, Math.round((totalVotes / 
      (actualEligibleVoters * positionsCount)) * 100)) : 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Voter Engagement
        </CardTitle>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">
            {loading ? "..." : `${engagementRate}%`}
          </div>
          <BarChart className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>
          {totalVotes} position votes cast
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Progress 
          value={engagementRate}
          className="h-2" 
        />
      </CardContent>
    </Card>
  );
};

export default VoterEngagementCard;
