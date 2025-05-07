
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
      if (!electionId || !supabase.auth.getUser()) return;
      
      try {
        const { user } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data, error } = await supabase
          .from('votes')
          .select('*')
          .eq('election_id', electionId)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        setHasVoted(!!data);
        if (data?.candidate_id) {
          setSelectedCandidate(data.candidate_id);
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
    setAccessCodeVerified
  };
};
