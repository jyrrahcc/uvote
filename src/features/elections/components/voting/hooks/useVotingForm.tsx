
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Candidate } from "@/types";
import { useCandidateGroups } from "./useCandidateGroups";
import { useVotingSelections, VotingSelections } from "./useVotingSelections";
import { usePositionNavigation } from "./usePositionNavigation";
import { useVoteSubmission } from "./useVoteSubmission";

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
    
    const checkUserEligibility = async () => {
      setIsCheckingEligibility(true);
      try {
        // Get election details
        const { data: election, error: electionError } = await supabase
          .from('elections')
          .select('departments, eligible_year_levels, restrict_voting')
          .eq('id', electionId)
          .single();
        
        if (electionError) throw electionError;
        
        // If voting is not restricted, everyone is eligible
        if (!election.restrict_voting) {
          setEligibilityError(null);
          setIsCheckingEligibility(false);
          return;
        }
        
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('department, year_level')
          .eq('id', userId)
          .single();
        
        if (profileError) throw profileError;
        
        // Check department eligibility
        if (election.departments && election.departments.length > 0) {
          const isDepartmentEligible = 
            election.departments.includes(profile.department) || 
            election.departments.includes("University-wide");
          
          if (!isDepartmentEligible) {
            setEligibilityError(`This election is for ${election.departments.join(", ")} departments. Your profile indicates you are in ${profile.department}.`);
            setIsCheckingEligibility(false);
            return;
          }
        }
        
        // Check year level eligibility
        if (election.eligible_year_levels && election.eligible_year_levels.length > 0) {
          const isYearEligible = 
            election.eligible_year_levels.includes(profile.year_level) || 
            election.eligible_year_levels.includes("All Year Levels");
          
          if (!isYearEligible) {
            setEligibilityError(`This election is for ${election.eligible_year_levels.join(", ")} year levels. Your profile indicates you are in ${profile.year_level}.`);
            setIsCheckingEligibility(false);
            return;
          }
        }
        
        // User is eligible
        setEligibilityError(null);
        
      } catch (error) {
        console.error("Error checking eligibility:", error);
        setEligibilityError("Failed to check eligibility. Please try again later.");
      } finally {
        setIsCheckingEligibility(false);
      }
    };
    
    checkUserEligibility();
  }, [electionId, userId]);
  
  // Handle form submission
  const handleVote = async (data: VotingSelections) => {
    // Check eligibility first
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
    hasCurrentSelection: hasCurrentSelection,
    selections,
  };
};
