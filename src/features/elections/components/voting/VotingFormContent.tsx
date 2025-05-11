
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { RadioGroup } from "@/components/ui/radio-group";
import { CheckCircle } from "lucide-react";

// Import custom components
import CandidateOption from "./CandidateOption";
import AbstainOption from "./AbstainOption";
import PositionNavigation from "./PositionNavigation";
import ValidationError from "./ValidationError";
import { Candidate } from "@/types";
import { VotingSelections } from "./hooks/useVotingSelections";

interface VotingFormContentProps {
  form: UseFormReturn<VotingSelections>;
  positions: string[];
  currentPosition: string;
  currentPositionIndex: number;
  currentCandidates: Candidate[];
  validationError: string | null;
  voteLoading: boolean;
  handleSubmit: () => void;
  goToNextPosition: () => void;
  goToPreviousPosition: () => void;
  handleAbstain: () => void;
  hasCurrentSelection: boolean;
  selections: VotingSelections;
}

const VotingFormContent = ({
  form,
  positions,
  currentPosition,
  currentPositionIndex,
  currentCandidates,
  validationError,
  voteLoading,
  handleSubmit,
  goToNextPosition,
  goToPreviousPosition,
  handleAbstain,
  hasCurrentSelection,
  selections
}: VotingFormContentProps) => {
  const isLastPosition = currentPositionIndex === positions.length - 1;
  const selectedCandidateName = React.useMemo(() => {
    if (!selections[currentPosition] || selections[currentPosition] === "abstain") return null;
    const selectedCandidate = currentCandidates.find(c => c.id === selections[currentPosition]);
    return selectedCandidate?.name || null;
  }, [selections, currentPosition, currentCandidates]);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          <span className="text-[#008f50]">Select for:</span> {currentPosition}
        </h3>
        {selections[currentPosition] && (
          <span className="text-green-600 flex items-center gap-1">
            <CheckCircle className="h-4 w-4" /> 
            {selections[currentPosition] === "abstain" ? "Abstained" : `Selected: ${selectedCandidateName}`}
          </span>
        )}
      </div>
      
      <ValidationError error={validationError} />
      
      <div className="border rounded-md p-4 bg-slate-50">
        <FormField
          control={form.control}
          name={currentPosition}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Short delay to give visual feedback before advancing
                    if (value && !isLastPosition) {
                      setTimeout(() => {
                        goToNextPosition();
                      }, 300);
                    }
                  }}
                  value={field.value}
                  className="flex flex-col space-y-3 mt-2"
                >
                  {currentCandidates.map((candidate) => (
                    <CandidateOption 
                      key={candidate.id} 
                      candidate={candidate} 
                    />
                  ))}
                  
                  {/* Abstain option */}
                  <AbstainOption onAbstain={handleAbstain} />
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      
      <div className="text-sm text-gray-500 text-center">
        Position {currentPositionIndex + 1} of {positions.length}
      </div>
      
      <PositionNavigation 
        currentPositionIndex={currentPositionIndex}
        totalPositions={positions.length}
        onPrevious={goToPreviousPosition}
        onNext={goToNextPosition}
        onSubmit={handleSubmit}
        isLoading={voteLoading}
        canProceed={hasCurrentSelection}
        isLastPosition={isLastPosition}
      />
    </div>
  );
};

export default VotingFormContent;
