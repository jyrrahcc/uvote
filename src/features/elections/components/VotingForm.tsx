
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Vote } from "lucide-react";
import { Form } from "@/components/ui/form";
import { useRole } from "@/features/auth/context/RoleContext";
import { Candidate } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

// Import custom components
import VotingProgress from "./voting/VotingProgress";
import VoteSummary from "./voting/VoteSummary";
import VoterVerification from "./voting/VoterVerification";
import VotingFormContent from "./voting/VotingFormContent";
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
  const [showSummary, setShowSummary] = useState(false);
  
  // Use the custom hook for form logic
  const {
    form,
    positions,
    currentPosition,
    currentPositionIndex,
    currentCandidates,
    voteLoading,
    validationError,
    eligibilityError,
    isCheckingEligibility,
    handleVote,
    goToNextPosition,
    goToPreviousPosition,
    handleAbstain,
    hasCurrentSelection,
    selections
  } = useVotingForm({ 
    electionId, 
    candidates, 
    userId,
    onVoteSubmitted: (candidateId) => {
      console.log("Vote submitted successfully, updating UI");
      onSelect(candidateId);
      setShowSummary(true);
    }
  });

  // If the user has already voted or just voted, show the results button
  if (hasVoted || showSummary) {
    return <VoteSummary electionId={electionId} />;
  }

  // Display voter verification UI if user doesn't have voter role
  // Set showToast to false to prevent duplicate notifications
  if (!isVoter) {
    return <VoterVerification isVoter={isVoter} showToast={false} />;
  }
  
  // Show loading state while checking eligibility
  if (isCheckingEligibility) {
    return (
      <Card className="mb-6 shadow-lg border-green-100 transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
          <CardTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5" />
            Checking Eligibility
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-6">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="ml-3 text-muted-foreground">Verifying your eligibility to vote...</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // If user is not eligible to vote, show error message
  if (eligibilityError) {
    return (
      <Card className="mb-6 shadow-lg border-red-100 transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b border-red-100">
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Not Eligible to Vote
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertTitle>Access Restricted</AlertTitle>
            <AlertDescription>
              {eligibilityError}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = form.handleSubmit((data) => {
    console.log("Submitting vote with data:", data);
    handleVote(data);
  });

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
          <form onSubmit={handleSubmit} className="space-y-6">
            {positions.length > 0 ? (
              <VotingFormContent 
                form={form}
                positions={positions}
                currentPosition={currentPosition}
                currentPositionIndex={currentPositionIndex}
                currentCandidates={currentCandidates}
                validationError={validationError}
                voteLoading={voteLoading}
                handleSubmit={handleSubmit}
                goToNextPosition={goToNextPosition}
                goToPreviousPosition={goToPreviousPosition}
                handleAbstain={handleAbstain}
                hasCurrentSelection={hasCurrentSelection}
                selections={selections}
              />
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
          selections={selections}
          positions={positions}
        />
      </CardFooter>
    </Card>
  );
};

export default VotingForm;
