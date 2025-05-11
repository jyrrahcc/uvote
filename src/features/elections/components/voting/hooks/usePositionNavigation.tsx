
import { useState } from "react";

interface UsePositionNavigationProps {
  positions: string[];
  validateCurrentSelection: () => boolean;
}

/**
 * Custom hook to handle position navigation in voting form
 */
export const usePositionNavigation = ({ 
  positions,
  validateCurrentSelection
}: UsePositionNavigationProps) => {
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const currentPosition = positions[currentPositionIndex] || '';
  
  // Navigation functions
  const goToNextPosition = () => {
    setValidationError(null);
    
    // Check if a selection has been made for the current position
    if (!validateCurrentSelection()) {
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
  
  return {
    currentPositionIndex,
    currentPosition,
    validationError,
    setValidationError,
    goToNextPosition,
    goToPreviousPosition
  };
};
