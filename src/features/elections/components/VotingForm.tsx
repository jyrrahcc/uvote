
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Candidate } from "@/types";
import CandidatesList from "@/features/candidates/components/CandidatesList";

interface VotingFormProps {
  electionId: string;
  candidates: Candidate[];
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
  selectedCandidateId, 
  onSelect 
}: VotingFormProps) => {
  const [voteLoading, setVoteLoading] = useState(false);
  
  const handleVote = async () => {
    if (!userId || !selectedCandidateId) return;
    
    try {
      setVoteLoading(true);
      
      // Check if user has already voted
      const { data: existingVote, error: checkError } = await supabase
        .from('votes')
        .select('*')
        .eq('election_id', electionId)
        .eq('user_id', userId)
        .single();
      
      if (!checkError && existingVote) {
        toast.error("You have already voted in this election");
        return;
      }
      
      // Insert new vote
      const { error: voteError } = await supabase
        .from('votes')
        .insert({
          election_id: electionId,
          candidate_id: selectedCandidateId,
          user_id: userId
        });
      
      if (voteError) throw voteError;
      
      toast.success("Your vote has been recorded");
      // We'll handle hasVoted in the parent component
    } catch (error) {
      console.error("Error submitting vote:", error);
      toast.error("Failed to submit your vote");
    } finally {
      setVoteLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Cast Your Vote</CardTitle>
        <CardDescription>
          Select a candidate below and submit your vote.
          {hasVoted && " You have already voted in this election."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CandidatesList 
          candidates={candidates} 
          selectedCandidateId={selectedCandidateId}
          onSelectCandidate={onSelect}
          readOnly={hasVoted}
        />
      </CardContent>
      <CardFooter>
        {!hasVoted ? (
          <Button 
            onClick={handleVote} 
            disabled={!selectedCandidateId || voteLoading}
            className="w-full"
          >
            {voteLoading ? "Submitting..." : "Submit Vote"}
          </Button>
        ) : (
          <Button 
            asChild 
            variant="outline"
            className="w-full"
          >
            <Link to={`/elections/${electionId}/results`}>View Results</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default VotingForm;
