
import { supabase } from '@/integrations/supabase/client';
import { Election, ElectionResult, ElectionResultCandidate } from '@/types';
import { toast } from 'sonner';

/**
 * Fetch results for a specific election
 */
export const fetchElectionResults = async (electionId: string): Promise<ElectionResult[]> => {
  try {
    // Get all votes
    const { data: votes, error: votesError } = await supabase
      .from('vote_candidates')
      .select(`
        position,
        candidate_id,
        candidates (
          id,
          name,
          position,
          image_url
        )
      `)
      .eq('votes.election_id', electionId)
      .order('position');
      
    if (votesError) throw votesError;
    
    // Process votes by position
    const positionResults: Record<string, ElectionResult> = {};
    
    (votes || []).forEach(vote => {
      const position = vote.position;
      const candidateId = vote.candidate_id;
      const candidate = vote.candidates;
      
      if (!positionResults[position]) {
        positionResults[position] = {
          electionId,
          positionId: position, // Using position name as ID for now
          positionName: position,
          candidates: [],
          totalVotes: 0,
          abstainCount: 0
        };
      }
      
      if (candidateId) {
        // Check if candidate already exists in results
        let candidateResult = positionResults[position].candidates.find(
          c => c.candidateId === candidateId
        );
        
        if (!candidateResult && candidate) {
          candidateResult = {
            candidateId: candidateId,
            name: candidate.name,
            imageUrl: candidate.image_url,
            voteCount: 0,
            percentage: 0,
            position: candidate.position
          };
          positionResults[position].candidates.push(candidateResult);
        }
        
        if (candidateResult) {
          candidateResult.voteCount++;
          positionResults[position].totalVotes++;
        }
      } else {
        // Abstain vote
        positionResults[position].abstainCount++;
        positionResults[position].totalVotes++;
      }
    });
    
    // Calculate percentages and determine winners
    Object.values(positionResults).forEach(result => {
      let maxVotes = 0;
      
      result.candidates.forEach(candidate => {
        candidate.percentage = result.totalVotes > 0 
          ? Math.round((candidate.voteCount / result.totalVotes) * 100) 
          : 0;
        
        if (candidate.voteCount > maxVotes) {
          maxVotes = candidate.voteCount;
          result.winner = candidate;
        }
      });
      
      // Sort candidates by votes (descending)
      result.candidates.sort((a, b) => b.voteCount - a.voteCount);
    });
    
    return Object.values(positionResults);
  } catch (error) {
    console.error('Error fetching election results:', error);
    toast.error('Failed to load election results');
    throw error;
  }
};
