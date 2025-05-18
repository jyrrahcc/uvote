
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Election } from "@/types";
import { Users, CalendarDays, ClipboardList, BarChart, LineChart, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
  
  // Calculate time remaining (or elapsed) for the election
  const calculateTimeRemaining = () => {
    const now = new Date();
    const endDate = new Date(election.endDate);
    
    if (election.status === 'completed') {
      return { text: "Election completed", statusText: "Ended" };
    }
    
    if (election.status === 'upcoming') {
      const startDate = new Date(election.startDate);
      const diffTime = startDate.getTime() - now.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      return { 
        text: `Starts in ${diffDays} days, ${diffHours} hours`,
        statusText: "Starting soon",
        daysRemaining: diffDays,
        hoursRemaining: diffHours
      };
    }
    
    // If active
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return { 
      text: `${diffDays} days, ${diffHours} hours remaining`,
      statusText: "In progress",
      daysRemaining: diffDays,
      hoursRemaining: diffHours
    };
  };
  
  const timeInfo = calculateTimeRemaining();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
        <CardContent className="pt-0">
          <Progress value={displayStats.participationRate} className="h-2" />
        </CardContent>
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
            {timeInfo.text}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatDate(election.startDate)}</span>
            <span>{formatDate(election.endDate)}</span>
          </div>
          <Progress 
            value={election.status === 'upcoming' ? 0 : 
                  election.status === 'completed' ? 100 : 
                  50} 
            className="h-2 mt-1" 
          />
        </CardContent>
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
        <CardContent className="pt-0">
          <div className="text-xs text-muted-foreground mb-1">Candidates per position:</div>
          <Progress 
            value={displayStats.positionsCount > 0 ? 
              (displayStats.candidatesCount / displayStats.positionsCount) * 20 : 0} 
            className="h-2" 
          />
        </CardContent>
      </Card>
      
      {/* Additional analytics cards */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Voter Engagement
          </CardTitle>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {displayStats.totalVotes > 0 ? 
                Math.min(100, Math.round((displayStats.totalVotes / 
                  (displayStats.totalVoters * displayStats.positionsCount)) * 100)) : 0}%
            </div>
            <BarChart className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardDescription>
            {displayStats.totalVotes} position votes cast
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Progress 
            value={displayStats.totalVotes > 0 ? 
              Math.min(100, Math.round((displayStats.totalVotes / 
                (displayStats.totalVoters * displayStats.positionsCount)) * 100)) : 0} 
            className="h-2" 
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Candidacy Period
          </CardTitle>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {election.candidacyEndDate && new Date() > new Date(election.candidacyEndDate) ? 
                "Closed" : "Open"}
            </div>
            <LineChart className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardDescription>
            {formatDate(election.candidacyStartDate || "")} - {formatDate(election.candidacyEndDate || "")}
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Competition Level
          </CardTitle>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {displayStats.candidatesCount > 0 && displayStats.positionsCount > 0 ? 
                (displayStats.candidatesCount / displayStats.positionsCount).toFixed(1) : 0}
            </div>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardDescription>
            Average candidates per position
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Progress 
            value={displayStats.candidatesCount > 0 && displayStats.positionsCount > 0 ? 
              Math.min(100, (displayStats.candidatesCount / displayStats.positionsCount) * 25) : 0} 
            className="h-2" 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ElectionStatCards;
