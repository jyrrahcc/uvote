
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Election, ElectionResult } from "@/types";
import ResultsChart from "@/features/results/components/ResultsChart";

const ResultsPage = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const [election, setElection] = useState<Election | null>(null);
  const [result, setResult] = useState<ElectionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (electionId) {
      fetchElectionDetails();
      fetchResults();
    }
  }, [electionId]);

  const fetchElectionDetails = async () => {
    try {
      // Using generic syntax for Supabase to avoid type errors
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .eq('id', electionId)
        .single();
      
      if (error) throw error;
      
      setElection(data as Election);
    } catch (error) {
      console.error("Error fetching election details:", error);
      toast.error("Failed to fetch election details");
      navigate('/elections');
    }
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      
      // Get candidates with their vote counts
      // Using generic syntax for Supabase to avoid type errors
      const { data: candidates, error: candidatesError } = await supabase
        .from('candidates')
        .select('id, name, position')
        .eq('election_id', electionId);
      
      if (candidatesError) throw candidatesError;
      
      // Get vote counts for each candidate
      const candidatesWithVotes = await Promise.all(candidates.map(async (candidate) => {
        const { count, error: countError } = await supabase
          .from('votes')
          .select('*', { count: 'exact' })
          .eq('candidate_id', candidate.id);
        
        if (countError) throw countError;
        
        return {
          id: candidate.id,
          name: candidate.name,
          votes: count || 0,
          percentage: 0 // Will calculate this after we have total votes
        };
      }));
      
      // Calculate total votes
      const totalVotes = candidatesWithVotes.reduce((sum, candidate) => sum + candidate.votes, 0);
      
      // Calculate percentages
      const candidatesWithPercentages = candidatesWithVotes.map(candidate => ({
        ...candidate,
        percentage: totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0
      }));
      
      // Find winner
      let winner = null;
      if (totalVotes > 0) {
        winner = candidatesWithPercentages.reduce((prev, current) => {
          return prev.votes > current.votes ? prev : current;
        });
      }
      
      // Create result object
      const electionResult: ElectionResult = {
        electionId,
        candidates: candidatesWithPercentages,
        totalVotes,
        winner: winner
      };
      
      setResult(electionResult);
    } catch (error) {
      console.error("Error fetching results:", error);
      toast.error("Failed to fetch election results");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !election) {
    return <div className="text-center py-10">Loading election results...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{election.title} Results</h1>
      <p className="text-muted-foreground">{election.description}</p>
      
      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Election Summary</CardTitle>
              <CardDescription>
                {election.status === 'completed' 
                  ? 'Final results of the election.'
                  : 'Current standings. Results will be finalized when the election ends.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Votes</p>
                    <p className="text-3xl font-bold">{result.totalVotes}</p>
                  </div>
                  
                  {result.winner && (
                    <div className="bg-primary/10 p-4 rounded-lg">
                      <p className="text-sm font-medium text-primary">
                        Leading Candidate
                      </p>
                      <p className="text-xl font-bold">
                        {result.winner.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {result.winner.votes} votes ({result.winner.percentage}%)
                      </p>
                    </div>
                  )}
                </div>
                
                <ResultsChart result={result} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Detailed Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.candidates.length > 0 ? (
                  result.candidates
                    .sort((a, b) => b.votes - a.votes)
                    .map((candidate, index) => (
                      <div key={candidate.id} className="flex items-center gap-4">
                        <div className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-full">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <p className="font-medium">
                              {candidate.name}
                            </p>
                            <p className="text-sm">
                              {candidate.votes} vote{candidate.votes !== 1 && 's'} ({candidate.percentage}%)
                            </p>
                          </div>
                          <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${candidate.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No votes have been cast yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ResultsPage;
