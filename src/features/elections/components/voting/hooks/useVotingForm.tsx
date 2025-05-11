
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Candidate } from "@/types";
import { useCandidateGroups } from "./useCandidateGroups";
import { useVotingSelections, VotingSelections } from "./useVotingSelections";
import { usePositionNavigation } from "./usePositionNavigation";
import { useVoteSubmission } from "./useVoteSubmission";
import { useRole } from "@/features/auth/context/RoleContext";

interface UseVotingFormProps {
  electionId: string;
  candidates: Candidate[] | null;
  userId: string;
  onVoteSubmitted: (candidateId: string) => void;
}

/**
 * Main voting form hook that orchestrates the voting process
 */
export const useVotingForm = ({ 
  electionId, 
  candidates, 
  userId,
  onVoteSubmitted
}: UseVotingFormProps) => {
  // Initialize form with react-hook-form
  const form = useForm<VotingSelections>({
    defaultValues: {},
  });
  
  const { isVoter, isAdmin } = useRole();
  const [eligibilityError, setEligibilityError] = useState<string | null>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  
  // Get candidate groups by position
  const { positionGroups, positions } = useCandidateGroups(candidates);
  
  // Handle position navigation
  const { 
    currentPositionIndex,
    currentPosition,
    validationError,
    setValidationError,
    goToNextPosition,
    goToPreviousPosition
  } = usePositionNavigation({
    positions,
    validateCurrentSelection: () => !!form.getValues()[currentPosition]
  });
  
  // Handle voting selections
  const {
    selections,
    handleAbstain,
    hasCurrentSelection
  } = useVotingSelections({ 
    form, 
    currentPosition 
  });
  
  // Handle vote submission
  const {
    voteLoading,
    validateAllSelections,
    submitVotes
  } = useVoteSubmission({
    electionId,
    userId,
    onVoteSubmitted
  });
  
  // Get candidates for the current position
  const currentCandidates = currentPosition ? positionGroups[currentPosition] || [] : [];
  
  // Check if user has already voted
  useEffect(() => {
    const checkExistingVote = async () => {
      if (!userId || !electionId) return;
      
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data: existingVotes, error } = await supabase
          .from('votes')
          .select('*')
          .eq('election_id', electionId)
          .eq('user_id', userId);
        
        if (error) {
          console.error("Error checking existing vote:", error);
        }
        
        const hasVoted = existingVotes && existingVotes.length > 0;
        console.log("Existing vote check:", hasVoted ? "User has voted" : "User has not voted");
      } catch (error) {
        console.error("Error checking existing vote:", error);
      }
    };
    
    checkExistingVote();
  }, [userId, electionId]);
  
  // Handle form submission
  const handleVote = async (data: VotingSelections) => {
    if (!userId) {
      toast.error("You need to be logged in to vote");
      return;
    }
    
    // Validate all positions have a selection
    const validation = validateAllSelections(positions, data);
    if (!validation.valid) {
      setValidationError(validation.errorMessage);
      return;
    }
    
    console.log("Submitting votes with data:", data);
    
    // Submit votes to database
    await submitVotes(data, positions);
  };
  
  return {
    form,
    positions,
    currentPosition,
    currentPositionIndex,
    currentCandidates,
    voteLoading,
    validationError,
    eligibilityError,
    isCheckingEligibility,
    handleVote,
    goToNextPosition,
    goToPreviousPosition,
    handleAbstain,
    hasCurrentSelection,
    selections,
  };
};
