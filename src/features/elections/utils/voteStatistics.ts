
import { Election } from "@/types";

export interface VotingStats {
  totalEligibleVoters: number;
  totalVotesCast: number;
  votingPercentage: number;
  positionVoteCounts: Record<string, number>;
}

/**
 * Calculate voting statistics based on election data and votes
 */
export const calculateVotingStats = (election: Election, votes: any[]): VotingStats => {
  // Default stats
  const stats: VotingStats = {
    totalEligibleVoters: election.totalEligibleVoters || 0,
    totalVotesCast: 0,
    votingPercentage: 0,
    positionVoteCounts: {},
  };

  if (!votes || votes.length === 0) {
    return stats;
  }

  // Count unique voters - look for vote marker records
  const uniqueVoters = new Set<string>();
  
  // Position vote counts
  const positionVoteCounts: Record<string, number> = {};

  // Process votes
  votes.forEach((vote) => {
    // Skip if vote data is malformed
    if (!vote || !vote.user_id) return;
    
    // If this is a vote marker (position is '_voted_marker'), count it for unique voters
    if (vote.position === '_voted_marker') {
      uniqueVoters.add(vote.user_id);
    }
    
    // Count votes per position if position exists in vote and isn't a marker
    if (vote && typeof vote.position === 'string' && vote.position !== '_voted_marker') {
      if (!positionVoteCounts[vote.position]) {
        positionVoteCounts[vote.position] = 0;
      }
      positionVoteCounts[vote.position]++;
    }
  });

  // Update stats
  stats.totalVotesCast = uniqueVoters.size;
  stats.votingPercentage = stats.totalEligibleVoters 
    ? (stats.totalVotesCast / stats.totalEligibleVoters) * 100 
    : 0;
  stats.positionVoteCounts = positionVoteCounts;

  return stats;
};
