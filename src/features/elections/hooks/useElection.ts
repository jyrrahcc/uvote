
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Election, Candidate } from "@/types";
import { fetchElectionDetails, updateElectionStatus } from "../services/electionService";
import { toast } from "sonner";

export const useElection = (electionId: string | undefined) => {
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [accessCodeVerified, setAccessCodeVerified] = useState(false);
  const [votedPositions, setVotedPositions] = useState<Record<string, string>>({});
  const [abstainedPositions, setAbstainedPositions] = useState<string[]>([]);

  useEffect(() => {
    if (!electionId) return;

    // Check for verified elections in localStorage
    try {
      const verifiedElections = JSON.parse(localStorage.getItem('verifiedElections') || '{}');
      if (verifiedElections[electionId]) {
        setAccessCodeVerified(true);
      }
    } catch (error) {
      console.error("Error checking verified elections:", error);
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch election details
        const electionData = await fetchElectionDetails(electionId);
        
        // Update election status if needed
        const updatedElection = await updateElectionStatus(electionData);
        setElection(updatedElection);
        
        // Fetch candidates
        const { data: candidatesData, error: candidatesError } = await supabase
          .from('candidates')
          .select('*')
          .eq('election_id', electionId)
          .order('position', { ascending: true });
        
        if (candidatesError) throw candidatesError;
        
        setCandidates(candidatesData || []);
        
      } catch (error) {
        console.error("Error in useElection hook:", error);
        setError("Failed to load election data");
        toast.error("Failed to load election data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [electionId]);
  
  // Check if the current user has voted in this election
  useEffect(() => {
    const checkVoteStatus = async () => {
      if (!electionId) return;
      
      try {
        const { data } = await supabase.auth.getUser();
        if (!data || !data.user) return;
        
        const { data: votes, error } = await supabase
          .from('votes')
          .select('candidate_id, election_id')
          .eq('election_id', electionId)
          .eq('user_id', data.user.id);
        
        if (error) throw error;
        
        // Process votes to track which positions have been voted for
        if (votes && votes.length > 0) {
          setHasVoted(true);
          
          // Get candidate details to map votes to positions
          const votedCandidateIds = votes
            .map(vote => vote?.candidate_id)
            .filter(Boolean) as string[];
          
          if (votedCandidateIds.length > 0) {
            const { data: votedCandidates, error: candidateError } = await supabase
              .from('candidates')
              .select('id, position')
              .in('id', votedCandidateIds);
            
            if (candidateError) throw candidateError;
            
            // Create a map of position -> candidateId
            const positionVotes: Record<string, string> = {};
            votedCandidates?.forEach(candidate => {
              if (candidate.position) {
                positionVotes[candidate.position] = candidate.id;
              }
            });
            
            setVotedPositions(positionVotes);
          }
          
          // Check if position column exists in votes table
          // Use a safer approach that doesn't rely on custom RPC functions
          try {
            const { data: abstainedData, error: abstainError } = await supabase
              .from('votes')
              .select('position')
              .eq('election_id', electionId)
              .eq('user_id', data.user.id)
              .is('candidate_id', null);
            
            if (abstainError) {
              console.error("Error fetching abstained positions:", abstainError);
              // If error is due to column not existing, just set empty array
              if (abstainError.message && abstainError.message.includes("column 'position' does not exist")) {
                setAbstainedPositions([]);
              } else {
                throw abstainError;
              }
            } else if (abstainedData) {
              // Extract position field from each abstained vote record if available
              const abstainedPositionsData = abstainedData
                // Fix: Use type guard to ensure position property exists and is not null
                .filter((vote): vote is { position: string } => {
                  return vote !== null && typeof vote === 'object' && 'position' in vote && vote.position !== null;
                })
                .map(vote => vote.position)
                .filter(position => position !== ''); // Filter out any empty strings
              
              setAbstainedPositions(abstainedPositionsData);
            }
          } catch (error) {
            console.error("Error handling abstained positions:", error);
            setAbstainedPositions([]);
          }
        }
        
      } catch (error) {
        console.error("Error checking vote status:", error);
      }
    };
    
    checkVoteStatus();
  }, [electionId]);
  
  return {
    election,
    candidates,
    loading,
    error,
    hasVoted,
    setHasVoted,
    selectedCandidate,
    setSelectedCandidate,
    accessCodeVerified,
    setAccessCodeVerified,
    votedPositions,
    setVotedPositions,
    abstainedPositions,
    setAbstainedPositions
  };
};
