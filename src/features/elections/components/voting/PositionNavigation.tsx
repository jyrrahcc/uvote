
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
  isLastPosition: boolean;
}

const PositionNavigation = ({
  currentPositionIndex,
  totalPositions,
  onPrevious,
  onNext,
  onSubmit,
  isLoading,
  canProceed,
  isLastPosition
}: PositionNavigationProps) => {
  return (
    <div className="flex justify-between pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={currentPositionIndex === 0 || isLoading}
        className="transition-all duration-200"
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
      </Button>
      
      {isLastPosition ? (
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isLoading || !canProceed}
          className="gap-2 transition-all duration-200 bg-[#008f50] hover:bg-[#007a45]"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span>Submitting</span>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              Submit Vote
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
          Next <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default PositionNavigation;
