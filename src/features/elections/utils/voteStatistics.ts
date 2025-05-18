
import { Election } from "@/types";

export interface VotingStats {
  totalEligibleVoters: number;
  totalVotesCast: number;
  votingPercentage: number;
  positionVoteCounts: Record<string, number>;
  votesOverTime?: Array<{date: string, votes: number}>;
  departmentParticipation?: Array<{department: string, votes: number, percentage: number}>;
  collegeParticipation?: Array<{college: string, votes: number, percentage: number}>;
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
    votesOverTime: [],
    departmentParticipation: [],
    collegeParticipation: []
  };

  if (!votes || votes.length === 0) {
    return stats;
  }

  // Count unique voters - look for vote marker records
  const uniqueVoters = new Set<string>();
  
  // Position vote counts
  const positionVoteCounts: Record<string, number> = {};
  
  // College vote tracking (renamed from departmentVotes to collegeVotes)
  const collegeVotes: Record<string, {count: number, total: number}> = {};
  
  // Date tracking for votes over time
  const dateVotes: Record<string, number> = {};

  // Process votes
  votes.forEach((vote) => {
    // Skip if vote data is malformed
    if (!vote || !vote.user_id) return;
    
    // If this is a vote marker (position is '_voted_marker'), count it for unique voters
    if (vote.position === '_voted_marker') {
      uniqueVoters.add(vote.user_id);
      
      // Track vote by date
      const voteDate = new Date(vote.timestamp).toISOString().split('T')[0];
      dateVotes[voteDate] = (dateVotes[voteDate] || 0) + 1;
      
      // Track college if available (renamed from department to college)
      if (vote.college) {
        if (!collegeVotes[vote.college]) {
          collegeVotes[vote.college] = {count: 0, total: 0};
        }
        collegeVotes[vote.college].count += 1;
      }
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
  
  // Process votes over time
  stats.votesOverTime = Object.entries(dateVotes)
    .map(([date, votes]) => ({ date, votes }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  // Process college participation (renamed from department to college)
  if (Object.keys(collegeVotes).length > 0) {
    // Calculate total eligible voters per college if available
    if (election.colleges && election.colleges.length > 0) {
      election.colleges.forEach(college => {
        if (!collegeVotes[college]) {
          collegeVotes[college] = {count: 0, total: election.totalEligibleVoters / election.colleges.length};
        } else {
          collegeVotes[college].total = election.totalEligibleVoters / election.colleges.length;
        }
      });
    }
    
    stats.collegeParticipation = Object.entries(collegeVotes).map(([college, data]) => ({
      college,
      votes: data.count,
      percentage: data.total > 0 ? (data.count / data.total) * 100 : 0
    }));
  }

  return stats;
};

/**
 * Generate vote distribution data for charts
 */
export const generateVoteDistributionData = (
  positionVotes: Record<string, any>
): Array<{name: string, votes: number}> => {
  return Object.entries(positionVotes).map(([position, data]) => ({
    name: position,
    votes: data.totalVotes || 0
  })).sort((a, b) => b.votes - a.votes);
};

/**
 * Calculate candidate competition metrics
 */
export const calculateCandidateCompetition = (candidates: any[]): Record<string, any> => {
  // Group candidates by position
  const positionGroups: Record<string, any[]> = {};
  
  candidates.forEach(candidate => {
    if (!candidate.position) return;
    
    if (!positionGroups[candidate.position]) {
      positionGroups[candidate.position] = [];
    }
    
    positionGroups[candidate.position].push(candidate);
  });
  
  // Calculate competition metrics
  const result: Record<string, any> = {};
  
  Object.entries(positionGroups).forEach(([position, candidates]) => {
    result[position] = {
      totalCandidates: candidates.length,
      competitionLevel: candidates.length > 1 ? 'Contested' : 'Uncontested',
      competitionScore: candidates.length
    };
  });
  
  return result;
};
