
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
        disabled={currentPositionIndex === 0}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Previous
      </Button>
      
      {isLastPosition ? (
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isLoading || !canProceed}
          className="gap-2"
        >
          {isLoading ? "Submitting..." : "Submit All Votes"}
          {!isLoading && <Vote className="h-4 w-4" />}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
        >
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default PositionNavigation;
