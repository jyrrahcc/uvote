
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
  const { isVoter, isAdmin } = useRole();
  
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
      console.log("Submitting votes:", data);
      
      // Check for already voted positions in a single query
      const { data: existingVotes, error: checkError } = await supabase
        .from('votes')
        .select('position')
        .eq('election_id', electionId)
        .eq('user_id', userId);
      
      if (checkError) {
        console.error("Error checking existing votes:", checkError);
        throw new Error("Failed to verify voting eligibility");
      }
      
      // Get positions that the user has already voted for
      const votedPositions = existingVotes ? existingVotes.map(vote => vote.position) : [];
      
      // Filter out positions that have already been voted for
      const positionsToVoteFor = Object.keys(data).filter(pos => !votedPositions.includes(pos));
      
      if (positionsToVoteFor.length === 0) {
        toast.error("You have already voted for all positions in this election");
        return false;
      }
      
      // If there are positions already voted for, inform the user but continue with remaining positions
      if (votedPositions.length > 0) {
        const alreadyVotedPositions = positions.filter(pos => votedPositions.includes(pos));
        if (alreadyVotedPositions.length > 0) {
          console.log(`Already voted for: ${alreadyVotedPositions.join(', ')}`);
          toast.info(`Note: You've already voted for some positions. Only submitting votes for remaining positions.`);
        }
      }
      
      // Prepare all vote records at once for bulk insert
      const voteRecords = positionsToVoteFor.map(position => ({
        election_id: electionId,
        user_id: userId,
        candidate_id: data[position] === "abstain" ? null : data[position],
        position: position
      }));
      
      // Insert all votes in a single operation
      if (voteRecords.length > 0) {
        const { error: insertError } = await supabase
          .from('votes')
          .insert(voteRecords);
          
        if (insertError) {
          console.error("Error inserting votes:", insertError);
          
          // Check if it's a unique constraint violation
          if (insertError.code === '23505') {
            throw new Error("You have already voted for one or more of these positions");
          } else {
            throw new Error("Failed to record your votes");
          }
        }
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
