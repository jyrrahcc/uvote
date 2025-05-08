
import { supabase } from "@/integrations/supabase/client";
import { ElectionResult } from "@/types";

/**
 * Fetches election results
 */
export const fetchElectionResults = async (electionId: string): Promise<ElectionResult> => {
  try {
    // Get candidates with their vote counts
    const { data: candidates, error: candidatesError } = await supabase
      .from('candidates')
      .select('id, name, position')
      .eq('election_id', electionId);
    
    if (candidatesError) throw candidatesError;
    
    // Get vote counts for each candidate
    const candidatesWithVotes = await Promise.all(candidates.map(async (candidate) => {
      const { count, error: countError } = await supabase
        .from('votes')
        .select('*', { count: 'exact' })
        .eq('candidate_id', candidate.id);
      
      if (countError) throw countError;
      
      return {
        id: candidate.id,
        name: candidate.name,
        votes: count || 0,
        percentage: 0 // Will calculate this after we have total votes
      };
    }));
    
    // Calculate total votes
    const totalVotes = candidatesWithVotes.reduce((sum, candidate) => sum + candidate.votes, 0);
    
    // Calculate percentages
    const candidatesWithPercentages = candidatesWithVotes.map(candidate => ({
      ...candidate,
      percentage: totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0
    }));
    
    // Find winner
    let winner = null;
    if (totalVotes > 0 && candidatesWithPercentages.length > 0) {
      winner = candidatesWithPercentages.reduce((prev, current) => {
        return prev.votes > current.votes ? prev : current;
      });
    }
    
    // Create result object
    const electionResult: ElectionResult = {
      electionId,
      candidates: candidatesWithPercentages,
      totalVotes,
      winner: winner
    };
    
    return electionResult;
  } catch (error) {
    console.error("Error fetching results:", error);
    throw error;
  }
};
