
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/features/auth/context/RoleContext";

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
  
  // Submit votes to the database
  const submitVotes = async (data: VotingSelections, positions: string[]) => {
    // Validate user authentication
    if (!userId) {
      toast.error("You need to be logged in to vote");
      return false;
    }
    
    try {
      setVoteLoading(true);
      console.log("Submitting votes for positions:", positions);
      
      // Prepare all vote records at once for bulk insert
      const voteRecords = positions.map(position => ({
        election_id: electionId,
        user_id: userId,
        candidate_id: data[position] === "abstain" ? null : data[position],
        position: position
      }));
      
      // Skip if no votes to submit
      if (voteRecords.length === 0) {
        toast.info("No positions available to vote for");
        return false;
      }
      
      // Insert all votes in a single operation
      const { error: insertError } = await supabase
        .from('votes')
        .insert(voteRecords);
        
      if (insertError) {
        console.error("Error inserting votes:", insertError);
        
        // Check if it's a unique constraint violation
        if (insertError.code === '23505') {
          toast.error("You have already voted for one or more of these positions");
        } else {
          toast.error("Failed to record your votes. Please try again.");
        }
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
