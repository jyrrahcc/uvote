
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
      // Get votes with their candidates for this election
      const { data: votesData, error: votesError } = await supabase
        .from("vote_candidates")
        .select(`
          vote_id,
          candidate_id,
          position,
          votes!inner (election_id)
        `)
        .eq("votes.election_id", electionId)
        .not("position", "is", null);

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
          const position = vote.position;
          
          if (!votesByPosition[position]) {
            votesByPosition[position] = {
              position,
              totalVotes: 0,
              candidates: {}
            };
          }
          
          if (vote.candidate_id) {
            if (!votesByPosition[position].candidates[vote.candidate_id]) {
              votesByPosition[position].candidates[vote.candidate_id] = 0;
            }
            
            votesByPosition[position].candidates[vote.candidate_id]++;
            votesByPosition[position].totalVotes++;
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
