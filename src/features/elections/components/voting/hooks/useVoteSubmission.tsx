
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
      
      // Check if user has already voted
      const { data: existingVote, error: checkError } = await supabase
        .from('votes')
        .select('id')
        .eq('election_id', electionId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error checking existing votes:", checkError);
        throw new Error("Failed to verify voting eligibility");
      }
      
      // If user has already voted (any record exists with their user_id and election_id), don't allow another vote
      if (existingVote) {
        toast.error("You have already voted in this election");
        return false;
      }
      
      // Process each position vote separately
      const votePromises = Object.entries(data).map(async ([position, candidateId]) => {
        // For abstain votes, we still record the position but with null candidate_id
        const voteRecord = {
          election_id: electionId,
          user_id: userId,
          candidate_id: candidateId === "abstain" ? null : candidateId
        };
        
        const { error } = await supabase
          .from('votes')
          .insert(voteRecord);
            
        if (error) {
          console.error(`Error recording vote for ${position}:`, error);
          throw new Error(`Failed to record your vote for ${position}`);
        }
      });
      
      try {
        // Wait for all votes to be processed
        await Promise.all(votePromises);
        
        toast.success("Your votes have been recorded successfully", {
          description: "Thank you for participating in this election"
        });
        
        // Update parent component that user has voted
        // Use non-abstain vote if available, otherwise use the first vote
        const firstNonAbstainVote = Object.values(data).find(value => value !== "abstain") || Object.values(data)[0];
        onVoteSubmitted(firstNonAbstainVote);
        return true;
      } catch (error) {
        // If any vote fails, log the error
        console.error("Error processing votes:", error);
        throw error; // Re-throw to be caught by outer catch
      }
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
