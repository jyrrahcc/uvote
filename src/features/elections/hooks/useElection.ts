
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchElectionDetails, updateElectionStatus } from "../services/electionService";
import { Election } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Candidate, mapDbCandidateToCandidate } from "@/types";

/**
 * Custom hook for fetching and managing election data
 */
export const useElection = (electionId: string | undefined) => {
  const [isAccessVerified, setIsAccessVerified] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<{[position: string]: string}>({});
  const [accessCodeVerified, setAccessCodeVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Main query for election data
  const {
    data: election,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["election", electionId],
    queryFn: () => (electionId ? fetchElectionDetails(electionId) : Promise.reject("No election ID provided")),
    enabled: !!electionId,
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Check if the user has verified access to this election
  useEffect(() => {
    if (election?.isPrivate) {
      try {
        const verifiedElections = JSON.parse(localStorage.getItem('verifiedElections') || '{}');
        const isVerified = !!verifiedElections[election.accessCode || ''];
        setIsAccessVerified(isVerified);
        setAccessCodeVerified(isVerified);
      } catch {
        setIsAccessVerified(false);
        setAccessCodeVerified(false);
      }
    } else {
      setIsAccessVerified(true);
      setAccessCodeVerified(true);
    }
  }, [election]);
  
  // Update election status based on current date if needed
  useEffect(() => {
    if (election) {
      const checkAndUpdateStatus = async () => {
        await updateElectionStatus(election);
      };
      
      checkAndUpdateStatus();
    }
  }, [election]);
  
  // Fetch candidates for the election
  useEffect(() => {
    const fetchCandidates = async () => {
      if (!electionId) return;
      
      try {
        const { data, error } = await supabase
          .from('candidates')
          .select('*')
          .eq('election_id', electionId);
          
        if (error) throw error;
        
        setCandidates(data ? data.map(mapDbCandidateToCandidate) : []);
      } catch (error) {
        console.error("Error fetching candidates:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCandidates();
  }, [electionId]);
  
  // Check if user has already voted
  useEffect(() => {
    const checkIfVoted = async (userId: string) => {
      if (!electionId || !userId) return;
      
      try {
        const { data, error } = await supabase
          .from('votes')
          .select('*')
          .eq('election_id', electionId)
          .eq('user_id', userId);
          
        if (!error && data && data.length > 0) {
          setHasVoted(true);
          
          // Set the first candidate as selected (for backward compatibility)
          if (data.length > 0) {
            setSelectedCandidate(data[0].candidate_id);
          }
          
          // Create a map of position to candidate ID using the full candidate data
          const userVoteMap: {[position: string]: string} = {};
          data.forEach(vote => {
            const candidate = candidates.find(c => c.id === vote.candidate_id);
            if (candidate) {
              userVoteMap[candidate.position] = candidate.id;
            }
          });
          
          setUserVotes(userVoteMap);
        }
      } catch (error) {
        console.error("Error checking if user voted:", error);
      }
    };
    
    // If the user is logged in, check if they've already voted
    const userId = localStorage.getItem('userId');
    if (userId && candidates.length > 0) {
      checkIfVoted(userId);
    }
  }, [electionId, candidates]);
  
  /**
   * Verify access code for private elections
   */
  const verifyAccessCode = (code: string): boolean => {
    if (!election || !election.isPrivate) return true;
    
    const isValid = election.accessCode === code;
    
    if (isValid) {
      try {
        // Store the verification in local storage
        const verifiedElections = JSON.parse(localStorage.getItem('verifiedElections') || '{}');
        verifiedElections[code] = true;
        localStorage.setItem('verifiedElections', JSON.stringify(verifiedElections));
        setIsAccessVerified(true);
        setAccessCodeVerified(true);
      } catch (e) {
        console.error("Error storing verification:", e);
      }
    }
    
    return isValid;
  };
  
  return {
    election,
    candidates,
    isLoading,
    loading,
    error,
    refetch,
    isAccessVerified,
    accessCodeVerified,
    setAccessCodeVerified,
    verifyAccessCode,
    hasVoted,
    setHasVoted,
    selectedCandidate,
    setSelectedCandidate,
    userVotes
  };
};
