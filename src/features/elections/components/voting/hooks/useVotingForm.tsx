
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  // Initialize form with persistent storage
  const form = useForm<VotingSelections>({
    defaultValues: {},
  });
  
  const { isVoter, isAdmin } = useRole();
  const [eligibilityError, setEligibilityError] = useState<string | null>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(true);
  
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
  
  // Check eligibility - simplified approach focusing on user role
  useEffect(() => {
    setIsCheckingEligibility(true);
    
    try {
      // If user has admin or voter role, they are considered eligible
      if (isAdmin || isVoter) {
        console.log("User is eligible based on role:", { isAdmin, isVoter });
        setEligibilityError(null);
      } else {
        console.log("User is not eligible: missing voter role");
        setEligibilityError("You need voter privileges to participate in this election.");
      }
    } catch (error) {
      console.error("Error checking eligibility:", error);
      setEligibilityError("Failed to check eligibility. Please try again later.");
    } finally {
      setIsCheckingEligibility(false);
    }
  }, [isAdmin, isVoter]);
  
  // Check if user has already voted
  useEffect(() => {
    const checkExistingVote = async () => {
      if (!userId || !electionId) return;
      
      try {
        const { data: existingVote, error } = await supabase
          .from('votes')
          .select('*')
          .eq('election_id', electionId)
          .eq('user_id', userId)
          .is('position', null) // Check for the marker record
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          console.error("Error checking existing vote:", error);
        }
        
        console.log("Existing vote check:", existingVote);
      } catch (error) {
        console.error("Error checking existing vote:", error);
      }
    };
    
    checkExistingVote();
  }, [userId, electionId]);
  
  // Handle form submission
  const handleVote = async (data: VotingSelections) => {
    // Simplified eligibility check based on role
    if (!isVoter && !isAdmin) {
      toast.error("You need voter privileges to vote");
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
