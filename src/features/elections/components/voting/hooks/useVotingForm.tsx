
import { useForm } from "react-hook-form";
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
  
  // Handle form submission
  const handleVote = async (data: VotingSelections) => {
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
    handleVote,
    goToNextPosition,
    goToPreviousPosition,
    handleAbstain,
    hasCurrentSelection: hasCurrentSelection,
    selections,
  };
};
