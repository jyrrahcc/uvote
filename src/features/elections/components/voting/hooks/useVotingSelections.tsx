
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";

export interface VotingSelections {
  [position: string]: string;
}

interface UseVotingSelectionsProps {
  form: UseFormReturn<VotingSelections>;
  currentPosition: string;
}

/**
 * Custom hook to manage voting selections state
 */
export const useVotingSelections = ({ form, currentPosition }: UseVotingSelectionsProps) => {
  // Use React state to track all selections across positions
  const [selections, setSelections] = useState<VotingSelections>({});
  
  // Track form value changes for the current position
  useEffect(() => {
    const subscription = form.watch((formValues) => {
      if (formValues[currentPosition]) {
        // Only update state if the value changes
        setSelections(prev => ({
          ...prev,
          [currentPosition]: formValues[currentPosition] as string
        }));
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, currentPosition]);
  
  // Initialize form with any saved selections when changing positions
  useEffect(() => {
    // Check if we have a saved selection for the current position
    if (selections[currentPosition]) {
      // Set the form value to the saved selection
      form.setValue(currentPosition, selections[currentPosition]);
    }
  }, [currentPosition, form, selections]);
  
  // Add abstain option for the current position
  const handleAbstain = () => {
    form.setValue(currentPosition, "abstain");
    setSelections(prev => ({
      ...prev,
      [currentPosition]: "abstain"
    }));
  };
  
  return {
    selections,
    setSelections,
    handleAbstain,
    hasCurrentSelection: !!selections[currentPosition]
  };
};
