
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Vote } from "lucide-react";

interface PositionNavigationProps {
  currentPositionIndex: number;
  totalPositions: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  canProceed: boolean;
}

const PositionNavigation = ({
  currentPositionIndex,
  totalPositions,
  onPrevious,
  onNext,
  onSubmit,
  isLoading,
  canProceed
}: PositionNavigationProps) => {
  const isLastPosition = currentPositionIndex === totalPositions - 1;
  
  return (
    <div className="flex justify-between pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={currentPositionIndex === 0 || isLoading}
        className="transition-all duration-200"
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Previous
      </Button>
      
      {isLastPosition ? (
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isLoading || !canProceed}
          className="gap-2 transition-all duration-200 bg-[#008f50] hover:bg-[#007a45]"
        >
          {isLoading ? (
            <>
              <span className="animate-pulse">Submitting...</span>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            </>
          ) : (
            <>
              Submit All Votes
              <Vote className="h-4 w-4" />
            </>
          )}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onNext}
          disabled={!canProceed || isLoading}
          className="transition-all duration-200"
        >
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default PositionNavigation;
