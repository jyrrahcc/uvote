
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Election, Candidate } from "@/types";

export const usePositionVotes = (election: Election | null, candidates: Candidate[] | null, electionId?: string) => {
  const [positionVotes, setPositionVotes] = useState<Record<string, any>>({});

  useEffect(() => {
    if (election?.status === "active" && election?.positions?.length > 0) {
      fetchVoteCounts();
    }
  }, [election, candidates, electionId]);

  const fetchVoteCounts = async () => {
    if (!election || !electionId) return;
    
    try {
      // Get votes grouped by candidate for this election
      const { data: votesData, error: votesError } = await supabase
        .from("votes")
        .select("candidate_id")
        .eq("election_id", electionId)
        .not("candidate_id", "is", null);

      if (votesError) throw votesError;

      // Process votes by position using candidates data
      const votesByPosition: Record<string, any> = {};
      
      if (votesData && election.positions && candidates) {
        // Initialize positions
        election.positions.forEach(position => {
          votesByPosition[position] = {
            position,
            totalVotes: 0,
            candidates: {}
          };
        });
        
        // Count votes for each candidate
        votesData.forEach(vote => {
          if (vote.candidate_id) {
            // Find candidate and their position
            const candidate = candidates.find(c => c.id === vote.candidate_id);
            if (candidate && candidate.position) {
              if (!votesByPosition[candidate.position]) {
                votesByPosition[candidate.position] = {
                  position: candidate.position,
                  totalVotes: 0,
                  candidates: {}
                };
              }
              
              if (!votesByPosition[candidate.position].candidates[vote.candidate_id]) {
                votesByPosition[candidate.position].candidates[vote.candidate_id] = 0;
              }
              
              votesByPosition[candidate.position].candidates[vote.candidate_id]++;
              votesByPosition[candidate.position].totalVotes++;
            }
          }
        });
      }
      
      setPositionVotes(votesByPosition);
    } catch (error) {
      console.error("Error fetching vote counts:", error);
      toast.error("Failed to load vote counts");
    }
  };

  return { positionVotes };
};
