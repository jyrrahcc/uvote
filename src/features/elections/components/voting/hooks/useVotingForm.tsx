
import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Candidate } from "@/types";
import { useCandidateGroups } from "./useCandidateGroups";
import { useVotingSelections, VotingSelections } from "./useVotingSelections";
import { usePositionNavigation } from "./usePositionNavigation";
import { useVoteSubmission } from "./useVoteSubmission";
import { useRole } from "@/features/auth/context/RoleContext";
import { supabase } from "@/integrations/supabase/client";

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
  const eligibilityChecked = useRef(false);
  const votesChecked = useRef(false);
  
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
    setSelections,
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
  
  // Check if user has already voted for any positions - only run once
  useEffect(() => {
    const checkExistingVotes = async () => {
      if (!userId || !electionId || votesChecked.current) return;
      
      try {
        setIsCheckingEligibility(true);
        
        // First check if user has a vote record for this election
        const { data: voteData, error: voteError } = await supabase
          .from('votes')
          .select('id')
          .match({ user_id: userId, election_id: electionId })
          .maybeSingle();
        
        if (voteError && voteError.code !== 'PGRST116') {
          console.error("Error checking existing votes:", voteError);
          setIsCheckingEligibility(false);
          return;
        }
        
        // If user has voted, check which positions they've voted for
        if (voteData) {
          const { data: voteCandidates, error: candidatesError } = await supabase
            .from('vote_candidates')
            .select('position')
            .eq('vote_id', voteData.id);
          
          if (candidatesError) {
            console.error("Error checking voted positions:", candidatesError);
            setIsCheckingEligibility(false);
            return;
          }
          
          if (voteCandidates && voteCandidates.length > 0) {
            const votedPositions = voteCandidates.map(vote => vote.position);
            setHasVotedPositions(votedPositions);
            console.log("Positions already voted for:", votedPositions);
            
            // Pre-fill selections with the existing votes
            const prefilledSelections: VotingSelections = {};
            
            // If all positions have been voted for, show message
            if (positions.every(pos => votedPositions.includes(pos))) {
              console.log("User has voted for all positions");
              onVoteSubmitted("already-voted"); // Trigger the completed state
            }
            
            setSelections(prefilledSelections);
          }
        } else {
          console.log("User has not voted for any positions yet");
          setHasVotedPositions([]);
        }
      } catch (error) {
        console.error("Error checking existing votes:", error);
      } finally {
        votesChecked.current = true;
        setIsCheckingEligibility(false);
      }
    };
    
    checkExistingVotes();
  }, [userId, electionId, positions, onVoteSubmitted, setSelections]);
  
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
    const success = await submitVotes(data, positionsToVoteFor.length > 0 ? positionsToVoteFor : positions);
    if (success) {
      // Update voted positions locally to prevent re-voting
      const newVotedPositions = [...hasVotedPositions];
      positionsToVoteFor.forEach(pos => {
        if (!newVotedPositions.includes(pos)) {
          newVotedPositions.push(pos);
        }
      });
      setHasVotedPositions(newVotedPositions);
    }
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
