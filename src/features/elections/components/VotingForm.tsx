
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Vote } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { RadioGroup } from "@/components/ui/radio-group";
import { useRole } from "@/features/auth/context/RoleContext";
import { Candidate } from "@/types";

// Import custom components
import CandidateOption from "./voting/CandidateOption";
import AbstainOption from "./voting/AbstainOption";
import PositionNavigation from "./voting/PositionNavigation";
import ValidationError from "./voting/ValidationError";
import VotingProgress from "./voting/VotingProgress";
import VoteSummary from "./voting/VoteSummary";
import { useVotingForm } from "./voting/hooks/useVotingForm";

interface VotingFormProps {
  electionId: string;
  candidates: Candidate[] | null;
  userId: string;
  hasVoted: boolean;
  selectedCandidateId: string | null;
  onSelect: (candidateId: string) => void;
}

const VotingForm = ({ 
  electionId, 
  candidates, 
  userId, 
  hasVoted, 
  onSelect 
}: VotingFormProps) => {
  const { isVoter } = useRole();
  
  // Use the custom hook for form logic
  const {
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
    hasCurrentSelection
  } = useVotingForm({ 
    electionId, 
    candidates, 
    userId,
    onVoteSubmitted: onSelect
  });

  // If the user has already voted, show the results button
  if (hasVoted) {
    return <VoteSummary electionId={electionId} />;
  }

  // If user doesn't have voter role, show an alert
  if (!isVoter) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Verification Required</CardTitle>
          <CardDescription>
            You need to verify your profile to participate in elections.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="rounded-full bg-amber-100 p-3 mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
          <p className="text-center text-muted-foreground mb-4">
            Only verified users with voter privileges can cast votes in elections.
            Please complete your profile and verify it first.
          </p>
          
          <Button asChild variant="default">
            <Link to="/profile">Go to Profile</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 shadow-lg border-green-100 transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
        <CardTitle className="flex items-center gap-2">
          <Vote className="h-5 w-5" />
          Cast Your Vote
        </CardTitle>
        <CardDescription>
          Select your preferred candidate for each position
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleVote)} className="space-y-6">
            {positions.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    <span className="text-[#008f50]">Question {currentPositionIndex + 1}:</span> Who will you vote for {currentPosition}?
                  </h3>
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
                                }, 300);
                              }
                            }}
                            defaultValue={field.value}
                            className="flex flex-col space-y-3 mt-4"
                          >
                            {currentCandidates.map((candidate) => (
                              <CandidateOption 
                                key={candidate.id} 
                                candidate={candidate} 
                              />
                            ))}
                            
                            {/* Abstain option */}
                            <AbstainOption />
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
                  onSubmit={() => form.handleSubmit(handleVote)()}
                  isLoading={voteLoading}
                  canProceed={hasCurrentSelection}
                />
              </div>
            ) : (
              <div className="text-center py-4">
                <p>No positions available for voting.</p>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col bg-gray-50 border-t border-gray-100 pt-4">
        <VotingProgress 
          currentPosition={currentPositionIndex} 
          totalPositions={positions.length} 
        />
      </CardFooter>
    </Card>
  );
};

export default VotingForm;
