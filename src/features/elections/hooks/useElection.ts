
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Election } from "@/types";
import { toast } from "sonner";

interface ElectionState {
  election: Election | null;
  loading: boolean;
  error: string | null;
  votes: any[] | null;
  votingStats: VotingStats | null;
}

interface VotingStats {
  totalEligibleVoters: number;
  totalVotesCast: number;
  votingPercentage: number;
  positionVoteCounts: Record<string, number>;
}

export const useElection = (electionId: string | undefined) => {
  const [state, setState] = useState<ElectionState>({
    election: null,
    loading: true,
    error: null,
    votes: null,
    votingStats: null,
  });

  // Fetch election details
  useEffect(() => {
    if (!electionId) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    const fetchElection = async () => {
      try {
        // Fetch election details
        const { data: election, error } = await supabase
          .from("elections")
          .select("*")
          .eq("id", electionId)
          .single();

        if (error) {
          throw error;
        }

        if (!election) {
          throw new Error("Election not found");
        }

        // Transform dates for easier display
        const transformedElection = {
          ...election,
          start_date: new Date(election.start_date),
          end_date: new Date(election.end_date),
          candidacy_start_date: election.candidacy_start_date
            ? new Date(election.candidacy_start_date)
            : null,
          candidacy_end_date: election.candidacy_end_date
            ? new Date(election.candidacy_end_date)
            : null,
        };

        // Fetch votes for this election
        const { data: votes, error: votesError } = await supabase
          .from("votes")
          .select("*")
          .eq("election_id", electionId);

        if (votesError) {
          console.error("Error fetching votes:", votesError);
        }

        // Calculate voting statistics
        const votingStats = calculateVotingStats(transformedElection, votes || []);

        setState({
          election: transformedElection,
          loading: false,
          error: null,
          votes: votes,
          votingStats,
        });
      } catch (error: any) {
        console.error("Error fetching election:", error);
        setState({
          election: null,
          loading: false,
          error: error.message || "Failed to load election details",
          votes: null,
          votingStats: null,
        });
        toast.error("Failed to load election details");
      }
    };

    fetchElection();
  }, [electionId]);

  // Calculate voting statistics
  const calculateVotingStats = (election: Election, votes: any[]): VotingStats => {
    // Default stats
    const stats: VotingStats = {
      totalEligibleVoters: election.total_eligible_voters || 0,
      totalVotesCast: 0,
      votingPercentage: 0,
      positionVoteCounts: {},
    };

    if (!votes || votes.length === 0) {
      return stats;
    }

    // Count unique voters
    const uniqueVoters = new Set<string>();
    
    // Position vote counts
    const positionVoteCounts: Record<string, number> = {};

    // Process votes
    votes.forEach((vote) => {
      // Skip if vote data is malformed
      if (!vote || !vote.user_id) return;
      
      // Count unique voters
      uniqueVoters.add(vote.user_id);
      
      // Count votes per position if position exists in vote
      if (vote && typeof vote.position === 'string') {
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

  return state;
};

export default useElection;
