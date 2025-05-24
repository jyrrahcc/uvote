
import { supabase } from "@/integrations/supabase/client";

export interface VoteStatistics {
  totalUniqueVoters: number;
  totalVotesCount: number; // This includes abstentions
  totalCandidateVotes: number; // This excludes abstentions
  totalAbstentions: number;
  participationRate: number;
  positionStats: Record<string, {
    totalVotes: number;
    candidateVotes: number;
    abstentions: number;
  }>;
}

/**
 * Calculate comprehensive vote statistics for an election
 */
export const calculateElectionVoteStats = async (electionId: string): Promise<VoteStatistics> => {
  try {
    // Get all votes for this election (unique voters)
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('id, user_id')
      .eq('election_id', electionId);
    
    if (votesError) throw votesError;
    
    // Get all vote candidates for this election
    const { data: voteCandidates, error: candidatesError } = await supabase
      .from('vote_candidates')
      .select('vote_id, candidate_id, position')
      .in('vote_id', votes?.map(v => v.id) || []);
    
    if (candidatesError) throw candidatesError;
    
    // Get election details for eligible voters count
    const { data: election, error: electionError } = await supabase
      .from('elections')
      .select('*')
      .eq('id', electionId)
      .single();
    
    if (electionError) throw electionError;
    
    const totalUniqueVoters = votes?.length || 0;
    const totalVotesCount = voteCandidates?.length || 0; // Includes abstentions
    const totalCandidateVotes = voteCandidates?.filter(vc => vc.candidate_id !== null).length || 0;
    const totalAbstentions = voteCandidates?.filter(vc => vc.candidate_id === null).length || 0;
    
    // Calculate position-wise statistics
    const positionStats: Record<string, any> = {};
    
    if (voteCandidates) {
      voteCandidates.forEach(vc => {
        if (!positionStats[vc.position]) {
          positionStats[vc.position] = {
            totalVotes: 0,
            candidateVotes: 0,
            abstentions: 0
          };
        }
        
        positionStats[vc.position].totalVotes++;
        
        if (vc.candidate_id === null) {
          positionStats[vc.position].abstentions++;
        } else {
          positionStats[vc.position].candidateVotes++;
        }
      });
    }
    
    // Calculate participation rate
    const eligibleVoters = election?.total_eligible_voters || 1;
    const participationRate = (totalUniqueVoters / eligibleVoters) * 100;
    
    return {
      totalUniqueVoters,
      totalVotesCount,
      totalCandidateVotes,
      totalAbstentions,
      participationRate,
      positionStats
    };
    
  } catch (error) {
    console.error("Error calculating vote statistics:", error);
    throw error;
  }
};

/**
 * Get vote counts by candidate for an election
 */
export const getCandidateVoteCounts = async (electionId: string) => {
  try {
    const { data: candidates, error: candidatesError } = await supabase
      .from('candidates')
      .select('id, name, position')
      .eq('election_id', electionId);
    
    if (candidatesError) throw candidatesError;
    
    // Get vote counts for each candidate
    const candidatesWithVotes = await Promise.all(
      (candidates || []).map(async (candidate) => {
        const { count, error: countError } = await supabase
          .from('vote_candidates')
          .select('*', { count: 'exact' })
          .eq('candidate_id', candidate.id);
        
        if (countError) throw countError;
        
        return {
          ...candidate,
          votes: count || 0
        };
      })
    );
    
    return candidatesWithVotes;
  } catch (error) {
    console.error("Error getting candidate vote counts:", error);
    throw error;
  }
};
