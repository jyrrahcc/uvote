
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
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
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          <span className="text-[#008f50]">Question {currentPositionIndex + 1}:</span> Who will you vote for {currentPosition}?
        </h3>
        {selections[currentPosition] && (
          <span className="text-green-600 flex items-center gap-1">
            <CheckCircle className="h-4 w-4" /> Selection made
          </span>
        )}
      </div>
      
      <ValidationError error={validationError} />
      
      <div className="border rounded-md p-6 bg-slate-50 shadow-inner">
        <FormField
          control={form.control}
          name={currentPosition}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-base">Select a candidate:</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Automatically advance after short delay when option selected
                    if (currentPositionIndex < positions.length - 1) {
                      setTimeout(() => {
                        if (form.getValues()[currentPosition]) {
                          goToNextPosition();
                        }
                      }, 600);
                    }
                  }}
                  value={field.value}
                  className="flex flex-col space-y-3 mt-4"
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
      />
    </div>
  );
};

export default VotingFormContent;
