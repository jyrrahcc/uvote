
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Election, mapDbElectionToElection } from "@/types";
import { toast } from "sonner";
import { VotingStats, calculateVotingStats } from "../utils/voteStatistics";

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

        // Calculate voting statistics using the extracted utility function
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
