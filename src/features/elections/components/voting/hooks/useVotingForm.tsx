
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Candidate, Election, mapDbElectionToElection } from "@/types";
import { useCandidateGroups } from "./useCandidateGroups";
import { useVotingSelections, VotingSelections } from "./useVotingSelections";
import { usePositionNavigation } from "./usePositionNavigation";
import { useVoteSubmission } from "./useVoteSubmission";
import { checkUserEligibility } from "@/utils/eligibilityUtils";
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
  // Initialize form
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
  
  // Check user eligibility
  useEffect(() => {
    if (!electionId || !userId) return;
    
    const checkEligibility = async () => {
      setIsCheckingEligibility(true);
      
      try {
        // Skip eligibility check if user is an admin
        if (isAdmin) {
          setEligibilityError(null);
          setIsCheckingEligibility(false);
          return;
        }
        
        // Get election details
        const { data: electionData, error: electionError } = await supabase
          .from('elections')
          .select('*')
          .eq('id', electionId)
          .single();
        
        if (electionError) throw electionError;
        
        if (electionData) {
          // Properly transform the DB election to application Election type
          const election = mapDbElectionToElection(electionData);
          
          // If the election doesn't restrict voting, we don't need to check eligibility further
          if (!election.restrictVoting) {
            setEligibilityError(null);
            setIsCheckingEligibility(false);
            return;
          }
          
          // Use centralized eligibility checker
          const { isEligible, reason } = await checkUserEligibility(userId, election);
          
          if (!isEligible) {
            setEligibilityError(reason || "You are not eligible to vote in this election.");
            console.log("Setting eligibility error:", reason);
          } else {
            setEligibilityError(null);
          }
        }
      } catch (error) {
        console.error("Error checking eligibility:", error);
        setEligibilityError("Failed to check eligibility. Please try again later.");
      } finally {
        setIsCheckingEligibility(false);
      }
    };
    
    checkEligibility();
  }, [electionId, userId, isAdmin]);
  
  // Handle form submission
  const handleVote = async (data: VotingSelections) => {
    // Check if user has voter role
    if (!isVoter) {
      toast.error("You need voter privileges to vote");
      return;
    }
    
    // Check eligibility only if it's a restricted election
    if (eligibilityError) {
      toast.error("You are not eligible to vote in this election");
      return;
    }
    
    // Validate all positions have a selection
    const validation = validateAllSelections(positions, data);
    if (!validation.valid) {
      setValidationError(validation.errorMessage);
      return;
    }
    
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
