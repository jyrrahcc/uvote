import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Election, mapDbElectionToElection } from "@/types";
import { fetchElectionDetails, updateElectionStatus } from "../services/electionService";

export const useElection = (electionId: string) => {
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [votingStats, setVotingStats] = useState<any>({});
  const [accessCodeVerified, setAccessCodeVerified] = useState<boolean>(false);
  
  const fetchElectionData = useCallback(async () => {
    if (!electionId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch election details
      const electionDetails = await fetchElectionDetails(electionId);
      
      // Check if the election status needs to be updated
      const updatedElection = await updateElectionStatus(electionDetails);
      
      // Now fetch candidates for this election
      const { data: candidatesData, error: candidatesError } = await supabase
        .from("candidates")
        .select("*")
        .eq("election_id", electionId);
        
      if (candidatesError) {
        throw new Error(`Error fetching candidates: ${candidatesError.message}`);
      }
      
      // Check if user has voted in this election
      const { data: user } = await supabase.auth.getUser();
      if (user?.user) {
        const { data: votesData, error: votesError } = await supabase
          .from("votes")
          .select("*")
          .eq("election_id", electionId)
          .eq("user_id", user.user.id);
          
        if (!votesError) {
          setHasVoted(votesData && votesData.length > 0);
        }
      }
      
      // Get eligible voter count
      const { count, error: votersError } = await supabase
        .from("eligible_voters")
        .select("*", { count: 'exact', head: true })
        .eq("election_id", electionId);
        
      if (!votersError) {
        updatedElection.totalEligibleVoters = count || 0;
      }
      
      // Update state with data
      setElection(updatedElection);
      setCandidates(candidatesData || []);
      
    } catch (err) {
      console.error("Error in useElection:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [electionId]);

  // Initial data fetch
  useEffect(() => {
    if (electionId) {
      fetchElectionData();
    }
  }, [fetchElectionData, electionId]);
  
  // Check access code verification from localStorage
  useEffect(() => {
    if (election?.isPrivate && election.accessCode) {
      try {
        const verifiedElections = JSON.parse(localStorage.getItem('verifiedElections') || '{}');
        setAccessCodeVerified(!!verifiedElections[election.accessCode]);
      } catch (err) {
        console.error("Error checking access code verification:", err);
      }
    } else {
      setAccessCodeVerified(true); // Not private, so considered verified
    }
  }, [election]);
  
  return {
    election,
    candidates,
    loading,
    error,
    hasVoted,
    votingStats,
    accessCodeVerified,
    setAccessCodeVerified,
    refetch: fetchElectionData // Add refetch method to allow manual refresh
  };
};
