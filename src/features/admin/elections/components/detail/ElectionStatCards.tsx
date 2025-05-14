
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Election } from "@/types";
import { Users, CalendarDays, ClipboardList } from "lucide-react";

interface ElectionStatCardsProps {
  election: Election;
  positionVotes?: Record<string, any>;
  formatDate?: (dateString: string) => string;
  stats?: {
    totalVoters: number;
    totalVotes: number;
    participationRate: number;
    positionsCount: number;
    candidatesCount: number;
  };
}

const ElectionStatCards: React.FC<ElectionStatCardsProps> = ({ 
  stats, 
  election, 
  positionVotes,
  formatDate = (date) => new Date(date).toLocaleDateString() 
}) => {
  // Calculate default stats if not provided
  const defaultStats = {
    totalVoters: election.totalEligibleVoters || 0,
    totalVotes: 0,
    participationRate: 0,
    positionsCount: election.positions?.length || 0,
    candidatesCount: 0
  };

  const displayStats = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Voter Participation
          </CardTitle>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold">
              {displayStats.participationRate}%
            </div>
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardDescription>
            {displayStats.totalVotes} out of {displayStats.totalVoters} eligible voters
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Election Status
          </CardTitle>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold capitalize">
              {election.status}
            </div>
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardDescription>
            {election.status === 'upcoming' 
              ? `Starts ${formatDate(election.startDate)}`
              : election.status === 'active'
              ? `Ends ${formatDate(election.endDate)}`
              : `Ended ${formatDate(election.endDate)}`
            }
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Candidates & Positions
          </CardTitle>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold">
              {displayStats.candidatesCount}
            </div>
            <ClipboardList className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardDescription>
            Across {displayStats.positionsCount} {displayStats.positionsCount === 1 ? 'position' : 'positions'}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

export default ElectionStatCards;
