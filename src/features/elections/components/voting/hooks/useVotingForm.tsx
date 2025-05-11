
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
  const [hasVotedPositions, setHasVotedPositions] = useState<string[]>([]);
  
  // Get candidate groups by position
  const { positionGroups, positions } = useCandidateGroups(candidates);
  
  // Filter out positions that have already been voted for
  const remainingPositions = positions.filter(pos => !hasVotedPositions.includes(pos));
  
  // Handle position navigation
  const { 
    currentPositionIndex,
    currentPosition,
    validationError,
    setValidationError,
    goToNextPosition,
    goToPreviousPosition
  } = usePositionNavigation({
    positions: remainingPositions.length > 0 ? remainingPositions : positions,
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
  
  // Check if user has already voted for any positions
  useEffect(() => {
    const checkExistingVotes = async () => {
      if (!userId || !electionId) return;
      
      try {
        setIsCheckingEligibility(true);
        const { supabase } = await import("@/integrations/supabase/client");
        const { data: existingVotes, error } = await supabase
          .from('votes')
          .select('position')
          .eq('election_id', electionId)
          .eq('user_id', userId);
        
        if (error) {
          console.error("Error checking existing votes:", error);
          return;
        }
        
        if (existingVotes && existingVotes.length > 0) {
          const votedPositions = existingVotes.map(vote => vote.position);
          setHasVotedPositions(votedPositions);
          console.log("Positions already voted for:", votedPositions);
          
          // Filter out positions that have already been voted for
          const remainingPositionsToVote = positions.filter(pos => !votedPositions.includes(pos));
          
          // If all positions have been voted for, show message
          if (remainingPositionsToVote.length === 0) {
            console.log("User has voted for all positions");
            onVoteSubmitted("already-voted"); // Trigger the completed state
          }
        } else {
          console.log("User has not voted for any positions yet");
          setHasVotedPositions([]);
        }
      } catch (error) {
        console.error("Error checking existing votes:", error);
      } finally {
        setIsCheckingEligibility(false);
      }
    };
    
    checkExistingVotes();
  }, [userId, electionId, positions, onVoteSubmitted]);
  
  // Handle form submission
  const handleVote = async (data: VotingSelections) => {
    if (!userId) {
      toast.error("You need to be logged in to vote");
      return;
    }
    
    // Get only positions that haven't been voted for yet
    const positionsToVoteFor = positions.filter(pos => !hasVotedPositions.includes(pos));
    
    // Validate selections for remaining positions
    const validation = validateAllSelections(positionsToVoteFor, data);
    if (!validation.valid) {
      setValidationError(validation.errorMessage);
      return;
    }
    
    console.log("Submitting votes with data:", data);
    
    // Submit votes to database
    await submitVotes(data, positionsToVoteFor.length > 0 ? positionsToVoteFor : positions);
  };
  
  return {
    form,
    positions: remainingPositions.length > 0 ? remainingPositions : positions,
    currentPosition,
    currentPositionIndex,
    currentCandidates,
    voteLoading,
    validationError,
    eligibilityError,
    isCheckingEligibility,
    hasVotedPositions,
    handleVote,
    goToNextPosition,
    goToPreviousPosition,
    handleAbstain,
    hasCurrentSelection,
    selections,
  };
};
