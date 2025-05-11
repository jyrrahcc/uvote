
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
  const [selections, setSelections] = useState<VotingSelections>({});
  
  // Track form value changes
  useEffect(() => {
    const subscription = form.watch((formValues) => {
      if (formValues[currentPosition]) {
        setSelections(prev => ({
          ...prev,
          [currentPosition]: formValues[currentPosition] as string
        }));
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, currentPosition]);
  
  // Initialize form with any saved selections
  useEffect(() => {
    Object.entries(selections).forEach(([position, value]) => {
      form.setValue(position, value);
    });
  }, []);
  
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
