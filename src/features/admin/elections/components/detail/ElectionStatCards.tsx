
import React from "react";
import { Election } from "@/types";
import { useEligibleVoters } from "./hooks/useEligibleVoters";
import { calculateTimeRemaining } from "./utils/timeCalculations";
import VoterParticipationCard from "./stats/VoterParticipationCard";
import ElectionStatusCard from "./stats/ElectionStatusCard";
import CandidatesPositionsCard from "./stats/CandidatesPositionsCard";
import VoterEngagementCard from "./stats/VoterEngagementCard";
import CandidacyPeriodCard from "./stats/CandidacyPeriodCard";
import CompetitionLevelCard from "./stats/CompetitionLevelCard";

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
  const { actualEligibleVoters, loading } = useEligibleVoters(election, stats?.totalVoters);

  // Calculate default stats if not provided, using actual eligible voters
  const defaultStats = {
    totalVoters: actualEligibleVoters,
    totalVotes: 0,
    participationRate: 0,
    positionsCount: election.positions?.length || 0,
    candidatesCount: 0
  };

  // Use actual eligible voters for calculations
  const displayStats = stats ? {
    ...stats,
    totalVoters: actualEligibleVoters,
    participationRate: actualEligibleVoters > 0 ? Math.round((stats.totalVotes / actualEligibleVoters) * 100) : 0
  } : defaultStats;
  
  const timeInfo = calculateTimeRemaining(election);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <VoterParticipationCard
        participationRate={displayStats.participationRate}
        totalVotes={displayStats.totalVotes}
        actualEligibleVoters={actualEligibleVoters}
        loading={loading}
      />
      
      <ElectionStatusCard
        election={election}
        timeInfo={timeInfo}
        formatDate={formatDate}
      />
      
      <CandidatesPositionsCard
        candidatesCount={displayStats.candidatesCount}
        positionsCount={displayStats.positionsCount}
      />
      
      <VoterEngagementCard
        totalVotes={displayStats.totalVotes}
        actualEligibleVoters={actualEligibleVoters}
        positionsCount={displayStats.positionsCount}
        loading={loading}
      />

      <CandidacyPeriodCard
        election={election}
        formatDate={formatDate}
      />
      
      <CompetitionLevelCard
        candidatesCount={displayStats.candidatesCount}
        positionsCount={displayStats.positionsCount}
      />
    </div>
  );
};

export default ElectionStatCards;
