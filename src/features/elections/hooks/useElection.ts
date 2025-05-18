
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Election, mapDbElectionToElection } from "@/types";
import { Candidate } from "@/types/candidates";
import { fetchElectionDetails } from "../services/electionService";

export const useElection = (electionId: string) => {
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [votingStats, setVotingStats] = useState<any>(null);
  const [accessCodeVerified, setAccessCodeVerified] = useState<boolean>(false);

  const fetchElection = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch election details
      const electionData = await fetchElectionDetails(electionId);
      setElection(electionData);

      // Fetch candidates for this election
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select('*')
        .eq('election_id', electionId);

      if (candidatesError) throw candidatesError;
      setCandidates(candidatesData || []);

      // Check if user has already voted for this election
      const { data: session } = await supabase.auth.getSession();
      if (session.session?.user) {
        const userId = session.session.user.id;
        
        const { data: voteData, error: voteError } = await supabase
          .from('votes')
          .select('*')
          .eq('election_id', electionId)
          .eq('user_id', userId);
          
        if (voteError) throw voteError;
        setHasVoted(voteData && voteData.length > 0);
      }

      // Get voting statistics
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('*')
        .eq('election_id', electionId);
        
      if (votesError) throw votesError;
      setVotingStats({
        totalVotes: votesData?.length || 0
      });

      // Check if access code has been verified (for private elections)
      try {
        const verifiedElections = JSON.parse(localStorage.getItem('verifiedElections') || '{}');
        setAccessCodeVerified(!!verifiedElections[electionData.accessCode || '']);
      } catch (e) {
        setAccessCodeVerified(false);
      }
      
    } catch (err) {
      console.error("Error fetching election data:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Fetch data initially
  useEffect(() => {
    if (electionId) {
      fetchElection();
    }
  }, [electionId]);

  // Set up real-time subscription for election updates
  useEffect(() => {
    if (!electionId) return;
    
    const channel = supabase
      .channel('election-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'elections',
          filter: `id=eq.${electionId}`
        },
        () => {
          // Refetch the election data when changes occur
          fetchElection();
        }
      )
      .subscribe();
      
    // Also listen for votes changes
    const votesChannel = supabase
      .channel('votes-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
          filter: `election_id=eq.${electionId}`
        },
        () => {
          // Refetch when votes change
          fetchElection();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(votesChannel);
    };
  }, [electionId]);

  return {
    election,
    candidates,
    loading,
    error,
    hasVoted,
    votingStats,
    accessCodeVerified,
    setAccessCodeVerified,
    refetch: fetchElection
  };
};
