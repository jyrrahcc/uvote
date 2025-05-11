
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/features/auth/context/RoleContext";
import { checkUserEligibility } from "@/utils/eligibilityUtils";

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
      
      // Verify eligibility one more time before submitting
      const { data: electionData, error: electionError } = await supabase
        .from('elections')
        .select('*')
        .eq('id', electionId)
        .single();
      
      if (electionError) {
        throw new Error("Failed to verify eligibility: could not fetch election details");
      }
      
      // Only check comprehensive eligibility if not an admin
      if (!isAdmin) {
        const { isEligible, reason } = await checkUserEligibility(userId, electionData);
        
        if (!isEligible) {
          toast.error("Not eligible to vote", {
            description: reason || "You are not eligible to vote in this election"
          });
          return false;
        }
      }
      
      // Check if user has already voted
      const { data: existingVote, error: checkError } = await supabase
        .from('votes')
        .select('id')
        .eq('election_id', electionId)
        .eq('user_id', userId)
        .is('position', null) // Look for the marker record
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking existing votes:", checkError);
        throw new Error("Failed to verify voting eligibility");
      }
      
      if (existingVote) {
        toast.error("You have already voted in this election");
        return false;
      }
      
      // Create a marker record to indicate that the user has voted
      const { error: markerError } = await supabase
        .from('votes')
        .insert({
          election_id: electionId,
          user_id: userId,
          candidate_id: Object.values(data)[0] !== "abstain" ? Object.values(data)[0] : null,
          position: null
        });
      
      if (markerError) {
        console.error("Error creating vote marker:", markerError);
        throw new Error("Failed to record your participation");
      }
      
      // Process each position vote separately
      const votePromises = Object.entries(data).map(async ([position, candidateId]) => {
        // For abstain votes, we still record the position but with null candidate_id
        const voteRecord = {
          election_id: electionId,
          user_id: userId,
          position: position,
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
        // If any vote fails, try to clean up the marker to allow user to try again
        await supabase
          .from('votes')
          .delete()
          .eq('election_id', electionId)
          .eq('user_id', userId)
          .is('position', null);
          
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
