
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Election, mapDbElectionToElection } from "@/types";
import { toast } from "sonner";

interface ElectionState {
  election: Election | null;
  loading: boolean;
  error: string | null;
  votes: any[] | null;
  votingStats: VotingStats | null;
  candidates: any[] | null;
  hasVoted: boolean;
  selectedCandidate: string | null;
  setSelectedCandidate: (candidateId: string) => void;
  setHasVoted: (hasVoted: boolean) => void;
  accessCodeVerified: boolean;
  setAccessCodeVerified: (verified: boolean) => void;
}

interface VotingStats {
  totalEligibleVoters: number;
  totalVotesCast: number;
  votingPercentage: number;
  positionVoteCounts: Record<string, number>;
}

export const useElection = (electionId: string | undefined) => {
  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votes, setVotes] = useState<any[] | null>(null);
  const [votingStats, setVotingStats] = useState<VotingStats | null>(null);
  const [candidates, setCandidates] = useState<any[] | null>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [accessCodeVerified, setAccessCodeVerified] = useState(false);

  // Fetch election details
  useEffect(() => {
    if (!electionId) {
      setLoading(false);
      return;
    }

    const fetchElection = async () => {
      try {
        setLoading(true);
        
        // Fetch election details
        const { data: electionData, error: electionError } = await supabase
          .from("elections")
          .select("*")
          .eq("id", electionId)
          .single();

        if (electionError) {
          throw electionError;
        }

        if (!electionData) {
          throw new Error("Election not found");
        }

        // Transform to our Election type
        const transformedElection = mapDbElectionToElection(electionData);

        // Fetch candidates for this election
        const { data: candidatesData, error: candidatesError } = await supabase
          .from("candidates")
          .select("*")
          .eq("election_id", electionId);

        if (candidatesError) {
          console.error("Error fetching candidates:", candidatesError);
        }

        // Fetch votes for this election
        const { data: votesData, error: votesError } = await supabase
          .from("votes")
          .select("*")
          .eq("election_id", electionId);

        if (votesError) {
          console.error("Error fetching votes:", votesError);
        }

        // Check if user has voted
        if (votesData && votesData.length > 0) {
          setHasVoted(true);
        }

        // Calculate voting statistics
        const stats = calculateVotingStats(transformedElection, votesData || []);

        setElection(transformedElection);
        setCandidates(candidatesData || []);
        setVotes(votesData);
        setVotingStats(stats);
        setLoading(false);
        setError(null);
      } catch (error: any) {
        console.error("Error fetching election:", error);
        setLoading(false);
        setError(error.message || "Failed to load election details");
        toast.error("Failed to load election details");
      }
    };

    fetchElection();
  }, [electionId]);

  // Calculate voting statistics
  const calculateVotingStats = (election: Election, votes: any[]): VotingStats => {
    // Default stats
    const stats: VotingStats = {
      totalEligibleVoters: election.totalEligibleVoters || 0,
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

  return {
    election,
    loading,
    error,
    votes,
    votingStats,
    candidates,
    hasVoted,
    selectedCandidate,
    setSelectedCandidate,
    setHasVoted,
    accessCodeVerified,
    setAccessCodeVerified
  };
};

export default useElection;
