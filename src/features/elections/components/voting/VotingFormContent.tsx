
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
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
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          <span className="text-[#008f50]">Select for:</span> {currentPosition}
        </h3>
        {selections[currentPosition] && (
          <span className="text-green-600 flex items-center gap-1">
            <CheckCircle className="h-4 w-4" /> Selected
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
                    // Don't auto-advance to give users time to confirm their selection
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
