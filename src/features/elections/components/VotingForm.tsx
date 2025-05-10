
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Candidate } from "@/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { ChevronLeft, ChevronRight, Check, AlertTriangle } from "lucide-react";
import { useRole } from "@/features/auth/context/RoleContext";

interface VotingFormProps {
  electionId: string;
  candidates: Candidate[] | null;
  userId: string;
  hasVoted: boolean;
  selectedCandidateId: string | null;
  onSelect: (candidateId: string) => void;
}

interface VotingSelections {
  [position: string]: string;
}

const VotingForm = ({ 
  electionId, 
  candidates, 
  userId, 
  hasVoted, 
  selectedCandidateId, 
  onSelect 
}: VotingFormProps) => {
  const [voteLoading, setVoteLoading] = useState(false);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const { isVoter } = useRole();
  
  // Group candidates by position
  const positionGroups = useMemo(() => {
    const groups: { [key: string]: Candidate[] } = {};
    
    // Make sure candidates is an array before calling forEach
    if (Array.isArray(candidates)) {
      candidates.forEach((candidate) => {
        if (!groups[candidate.position]) {
          groups[candidate.position] = [];
        }
        groups[candidate.position].push(candidate);
      });
    }
    
    return groups;
  }, [candidates]);
  
  // Get unique positions
  const positions = useMemo(() => 
    Object.keys(positionGroups),
  [positionGroups]);
  
  // Initialize form
  const form = useForm<VotingSelections>({
    defaultValues: {},
  });
  
  const currentPosition = positions[currentPositionIndex];
  const currentCandidates = currentPosition ? positionGroups[currentPosition] : [];
  
  // Navigation functions
  const goToNextPosition = () => {
    if (currentPositionIndex < positions.length - 1) {
      setCurrentPositionIndex(prev => prev + 1);
    }
  };
  
  const goToPreviousPosition = () => {
    if (currentPositionIndex > 0) {
      setCurrentPositionIndex(prev => prev - 1);
    }
  };
  
  // Check if there are any selections
  const hasSelections = Object.keys(form.getValues()).length > 0;

  // Add an abstain option for the current position
  const handleAbstain = () => {
    form.setValue(currentPosition, "abstain");
    if (currentPositionIndex < positions.length - 1) {
      goToNextPosition();
    }
  };
  
  const handleVote = async (data: VotingSelections) => {
    if (!userId) {
      toast.error("You need to be logged in to vote");
      return;
    }
    
    // Check if user has voter role first
    if (!isVoter) {
      toast.error("You need to verify your profile to vote", {
        description: "Only verified users with voter privileges can cast votes in elections."
      });
      return;
    }
    
    try {
      setVoteLoading(true);
      
      // Check if user has already voted
      const { data: existingVote, error: checkError } = await supabase
        .from('votes')
        .select('*')
        .eq('election_id', electionId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (!checkError && existingVote) {
        toast.error("You have already voted in this election");
        return;
      }
      
      // Prepare votes data - filter out "abstain" values
      const votes = Object.entries(data)
        .filter(([position, candidateId]) => candidateId !== "abstain") // Skip abstained positions
        .map(([position, candidateId]) => ({
          election_id: electionId,
          candidate_id: candidateId,
          user_id: userId
        }));
      
      if (votes.length > 0) {
        // Insert all votes
        const { error: voteError } = await supabase
          .from('votes')
          .insert(votes);
        
        if (voteError) throw voteError;
      }
      
      // Even if no candidates were selected (all abstained), mark the user as having voted
      const { error: userVoteStatusError } = await supabase
        .from('votes')
        .insert([{
          election_id: electionId,
          user_id: userId,
          candidate_id: null // null candidate_id indicates an abstention for all positions or a marker that user has voted
        }]);
      
      if (userVoteStatusError) throw userVoteStatusError;
      
      toast.success("Your votes have been recorded");
      // Update parent component that user has voted
      if (votes.length > 0) {
        onSelect(votes[0].candidate_id);
      } else {
        onSelect("abstained");
      }
    } catch (error) {
      console.error("Error submitting votes:", error);
      toast.error("Failed to submit your votes");
    } finally {
      setVoteLoading(false);
    }
  };

  // If the user has already voted, show the results button
  if (hasVoted) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Thank You for Voting</CardTitle>
          <CardDescription>
            You have already cast your vote in this election.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="rounded-full bg-green-100 p-3">
            <Check className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            asChild 
            variant="outline"
            className="w-full"
          >
            <Link to={`/elections/${electionId}/results`}>View Results</Link>
          </Button>
        </CardFooter>
      </Card>
    );
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
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Cast Your Vote</CardTitle>
        <CardDescription>
          Select your preferred candidate for each position
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleVote)} className="space-y-6">
            {positions.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    Position {currentPositionIndex + 1} of {positions.length}: {currentPosition}
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    {currentPositionIndex + 1}/{positions.length}
                  </div>
                </div>
                
                <div className="border rounded-md p-4 bg-slate-50">
                  <FormField
                    control={form.control}
                    name={currentPosition}
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-base">Select a candidate:</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-3 mt-4"
                          >
                            {currentCandidates.map((candidate) => (
                              <FormItem key={candidate.id} className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={candidate.id} />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer flex items-center">
                                  {candidate.image_url && (
                                    <img 
                                      src={candidate.image_url} 
                                      alt={candidate.name} 
                                      className="w-10 h-10 rounded-full object-cover mr-3" 
                                    />
                                  )}
                                  <div>
                                    <div className="font-medium">{candidate.name}</div>
                                    {candidate.bio && (
                                      <div className="text-sm text-muted-foreground line-clamp-1">
                                        {candidate.bio}
                                      </div>
                                    )}
                                  </div>
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goToPreviousPosition}
                    disabled={currentPositionIndex === 0}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                  </Button>
                  
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAbstain}
                  >
                    Abstain for this position
                  </Button>
                  
                  {currentPositionIndex === positions.length - 1 ? (
                    <Button
                      type="submit"
                      disabled={voteLoading}
                    >
                      {voteLoading ? "Submitting..." : "Submit All Votes"}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={goToNextPosition}
                    >
                      Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p>No positions available for voting.</p>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
          <div 
            className="bg-[#008f50] h-2 rounded-full transition-all" 
            style={{ width: `${(currentPositionIndex + 1) / positions.length * 100}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground text-center w-full mt-1">
          {currentPositionIndex + 1} of {positions.length} positions
        </div>
      </CardFooter>
    </Card>
  );
};

export default VotingForm;
