
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface VotingSelections {
  [position: string]: string;
}

interface UseVoteSubmissionProps {
  electionId: string;
  userId: string;
  onVoteSubmitted: (candidateId: string) => void;
}

/**
 * Custom hook to handle vote submission logic
 */
export const useVoteSubmission = ({ 
  electionId, 
  userId,
  onVoteSubmitted
}: UseVoteSubmissionProps) => {
  const [voteLoading, setVoteLoading] = useState(false);
  
  // Check if all positions have a selection before submitting
  const validateAllSelections = (positions: string[], data: VotingSelections) => {
    const missingSelections = positions.filter(position => !data[position]);
    
    if (missingSelections.length > 0) {
      return {
        valid: false,
        errorMessage: `Please make a selection for all positions before submitting your vote. Missing: ${missingSelections.join(', ')}`
      };
    }
    
    return { valid: true, errorMessage: null };
  };
  
  // Submit votes to the database using the new schema
  const submitVotes = async (data: VotingSelections, positions: string[]) => {
    // Validate user authentication
    if (!userId) {
      toast.error("You need to be logged in to vote");
      return false;
    }
    
    try {
      setVoteLoading(true);
      console.log("Submitting votes for positions:", positions);
      
      // Skip if no positions to vote for
      if (positions.length === 0) {
        toast.info("No positions available to vote for");
        return false;
      }
      
      // First, create a single vote record for this election
      const { data: voteData, error: voteError } = await supabase
        .from('votes')
        .upsert([{
          election_id: electionId,
          user_id: userId,
          timestamp: new Date().toISOString()
        }], { onConflict: 'user_id,election_id', returning: true });
      
      if (voteError) {
        console.error("Error creating vote record:", voteError);
        toast.error("Failed to record your vote. Please try again.");
        return false;
      }
      
      if (!voteData || voteData.length === 0) {
        toast.error("Failed to create vote record");
        return false;
      }
      
      const voteId = voteData[0].id;
      
      // Now create vote_candidate records for each position
      const voteCandidateRecords = positions.map(position => ({
        vote_id: voteId,
        candidate_id: data[position] === "abstain" ? null : data[position],
        position: position,
        timestamp: new Date().toISOString()
      }));
      
      // Insert all vote candidates in a single operation
      const { error: insertError } = await supabase
        .from('vote_candidates')
        .upsert(voteCandidateRecords, { onConflict: 'vote_id,position' });
        
      if (insertError) {
        console.error("Error inserting vote candidates:", insertError);
        toast.error("Failed to record your selections. Please try again.");
        return false;
      }
      
      toast.success("Your votes have been recorded successfully", {
        description: "Thank you for participating in this election"
      });
      
      // Use non-abstain vote if available, otherwise use the first vote
      const firstNonAbstainVote = Object.values(data).find(value => value !== "abstain") || Object.values(data)[0];
      onVoteSubmitted(firstNonAbstainVote);
      return true;
      
    } catch (error: any) {
      console.error("Error submitting votes:", error);
      toast.error(error.message || "Failed to submit your votes");
      return false;
    } finally {
      setVoteLoading(false);
    }
  };
  
  return {
    voteLoading,
    validateAllSelections,
    submitVotes
  };
};
