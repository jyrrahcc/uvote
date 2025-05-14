
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Election } from "@/types";
import { Users, CalendarDays, ClipboardList } from "lucide-react";

interface ElectionStatCardsProps {
  stats: {
    totalVoters: number;
    totalVotes: number;
    participationRate: number;
    positionsCount: number;
    candidatesCount: number;
  };
  election: Election;
}

const ElectionStatCards: React.FC<ElectionStatCardsProps> = ({ stats, election }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Voter Participation
          </CardTitle>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold">
              {stats.participationRate}%
            </div>
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardDescription>
            {stats.totalVotes} out of {stats.totalVoters} eligible voters
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
              ? `Starts ${new Date(election.startDate).toLocaleDateString()}`
              : election.status === 'active'
              ? `Ends ${new Date(election.endDate).toLocaleDateString()}`
              : `Ended ${new Date(election.endDate).toLocaleDateString()}`
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
              {stats.candidatesCount}
            </div>
            <ClipboardList className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardDescription>
            Across {stats.positionsCount} {stats.positionsCount === 1 ? 'position' : 'positions'}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

export default ElectionStatCards;
