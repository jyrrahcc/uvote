
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchElectionDetails } from "../services/electionService";
import { Election, Candidate, mapDbCandidateToCandidate } from "@/types";
import { toast } from "sonner";

interface UseElectionProps {
  electionId?: string;
  userId?: string;
}

interface UseElectionReturn {
  election: Election | null;
  candidates: Candidate[];
  loading: boolean;
  hasVoted: boolean;
  selectedCandidate: string | null;
  setSelectedCandidate: (candidateId: string) => void;
  setHasVoted: (value: boolean) => void;
  accessCodeVerified: boolean;
  setAccessCodeVerified: (value: boolean) => void;
}

export const useElection = ({ electionId, userId }: UseElectionProps): UseElectionReturn => {
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [accessCodeVerified, setAccessCodeVerified] = useState(false);
  
  useEffect(() => {
    if (!electionId) return;
    
    const fetchElectionData = async () => {
      try {
        setLoading(true);
        
        // Fetch election details
        const electionData = await fetchElectionDetails(electionId);
        setElection(electionData);
        
        // If election is private, we need to verify access code before showing content
        if (electionData.isPrivate && !accessCodeVerified) {
          setLoading(false);
          return;
        }
        
        // Fetch candidates for this election
        const { data: candidatesData, error: candidatesError } = await supabase
          .from('candidates')
          .select('*')
          .eq('election_id', electionId);
        
        if (candidatesError) throw candidatesError;
        
        // Transform the candidates data to match our interface
        const transformedCandidates = candidatesData.map(mapDbCandidateToCandidate);
        setCandidates(transformedCandidates);
        
        // Check if user has already voted
        if (userId) {
          const { data: voteData, error: voteError } = await supabase
            .from('votes')
            .select('*')
            .eq('election_id', electionId)
            .eq('user_id', userId)
            .single();
          
          if (!voteError && voteData) {
            setHasVoted(true);
            setSelectedCandidate(voteData.candidate_id);
          }
        }
      } catch (error) {
        console.error("Error fetching election data:", error);
        toast.error("Failed to load election data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchElectionData();
  }, [electionId, userId, accessCodeVerified]);

  return {
    election,
    candidates,
    loading,
    hasVoted,
    selectedCandidate,
    setSelectedCandidate,
    setHasVoted,
    accessCodeVerified,
    setAccessCodeVerified
  };
};
