
import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Candidate } from "@/types";
import { useRole } from "@/features/auth/context/RoleContext";

interface VotingSelections {
  [position: string]: string;
}

interface UseVotingFormProps {
  electionId: string;
  candidates: Candidate[] | null;
  userId: string;
  onVoteSubmitted: (candidateId: string) => void;
}

export const useVotingForm = ({ 
  electionId, 
  candidates, 
  userId,
  onVoteSubmitted
}: UseVotingFormProps) => {
  const [voteLoading, setVoteLoading] = useState(false);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selections, setSelections] = useState<VotingSelections>({});
  const { isVoter } = useRole();
  
  // Group candidates by position
  const positionGroups = useMemo(() => {
    const groups: { [key: string]: Candidate[] } = {};
    
    if (Array.isArray(candidates)) {
      candidates.forEach((candidate) => {
        if (!groups[candidate.position]) {
          groups[candidate.position] = [];
        }
        groups[candidate.position].push(candidate);
      });
    }
    
    return groups;
  }, [candidates]);
  
  // Get unique positions
  const positions = useMemo(() => 
    Object.keys(positionGroups),
  [positionGroups]);
  
  // Initialize form with any saved selections
  const form = useForm<VotingSelections>({
    defaultValues: selections,
  });
  
  // Update form whenever selections change
  useEffect(() => {
    const currentValues = form.getValues();
    
    // Only update if there are actual changes
    if (JSON.stringify(currentValues) !== JSON.stringify(selections)) {
      Object.entries(selections).forEach(([position, value]) => {
        form.setValue(position, value);
      });
    }
  }, [selections, form]);
  
  const currentPosition = positions[currentPositionIndex];
  const currentCandidates = currentPosition ? positionGroups[currentPosition] : [];
  
  // When form values change, update our selections state
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value[currentPosition]) {
        setSelections(prev => ({
          ...prev,
          [currentPosition]: value[currentPosition] as string
        }));
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, currentPosition]);
  
  // Navigation functions
  const goToNextPosition = () => {
    setValidationError(null);
    
    // Check if a selection has been made for the current position
    const currentSelection = form.getValues()[currentPosition];
    if (!currentSelection) {
      setValidationError(`Please select a candidate or choose to abstain for the ${currentPosition} position before proceeding.`);
      return;
    }
    
    if (currentPositionIndex < positions.length - 1) {
      setCurrentPositionIndex(prev => prev + 1);
    }
  };
  
  const goToPreviousPosition = () => {
    setValidationError(null);
    if (currentPositionIndex > 0) {
      setCurrentPositionIndex(prev => prev - 1);
    }
  };
  
  // Add an abstain option for the current position
  const handleAbstain = () => {
    form.setValue(currentPosition, "abstain");
    setSelections(prev => ({
      ...prev,
      [currentPosition]: "abstain"
    }));
    setValidationError(null);
    
    if (currentPositionIndex < positions.length - 1) {
      goToNextPosition();
    }
  };
  
  // Check if all positions have a selection before submitting
  const validateAllSelections = () => {
    const values = form.getValues();
    const missingSelections = positions.filter(position => !values[position]);
    
    if (missingSelections.length > 0) {
      setValidationError(`Please make a selection for all positions before submitting your vote. Missing: ${missingSelections.join(', ')}`);
      return false;
    }
    
    return true;
  };
  
  const handleVote = async (data: VotingSelections) => {
    // Validate all positions have a selection
    if (!validateAllSelections()) {
      return;
    }
    
    if (!userId) {
      toast.error("You need to be logged in to vote");
      return;
    }
    
    // Check if user has voter role first
    if (!isVoter) {
      toast.error("You need to verify your profile to vote", {
        description: "Only verified users with voter privileges can cast votes in elections."
      });
      return;
    }
    
    try {
      setVoteLoading(true);
      
      // Check if user has already voted
      const { data: existingVote, error: checkError } = await supabase
        .from('votes')
        .select('*')
        .eq('election_id', electionId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingVote) {
        toast.error("You have already voted in this election");
        return;
      }
      
      // Prepare votes data - filter out "abstain" values
      const votes = Object.entries(data)
        .filter(([position, candidateId]) => candidateId !== "abstain") // Skip abstained positions
        .map(([position, candidateId]) => ({
          election_id: electionId,
          candidate_id: candidateId,
          user_id: userId,
          position: position // Add position for better tracking
        }));
      
      // First create a "vote marker" record to track that the user has voted in this election
      // This should be done regardless of whether they vote for candidates or abstain for all positions
      const { error: markerError } = await supabase
        .from('votes')
        .insert([{
          election_id: electionId,
          user_id: userId,
          candidate_id: null, // null candidate_id indicates this is just a marker
          position: '_voted_marker' // Special position name to mark that user has participated
        }]);
      
      if (markerError) throw markerError;
      
      // Now insert actual candidate votes if there are any
      if (votes.length > 0) {
        const { error: voteError } = await supabase
          .from('votes')
          .insert(votes);
        
        if (voteError) throw voteError;
      }
      
      toast.success("Your votes have been recorded successfully", {
        description: "Thank you for participating in this election"
      });
      
      // Update parent component that user has voted
      onVoteSubmitted(votes.length > 0 ? votes[0].candidate_id : "abstained");
      
    } catch (error) {
      console.error("Error submitting votes:", error);
      toast.error("Failed to submit your votes");
    } finally {
      setVoteLoading(false);
    }
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
    hasCurrentSelection: !!form.getValues()[currentPosition],
  };
};
