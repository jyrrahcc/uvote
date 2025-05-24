
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Election, mapDbElectionToElection } from "@/types";
import { Link } from "react-router-dom";
import { ExternalLink, Trophy } from "lucide-react";

interface ElectionResult {
  electionId: string;
  electionTitle: string;
  totalVotes: number;
  winner?: {
    name: string;
    position: string;
    votes: number;
  };
}

const ElectionAnnouncements = () => {
  const [completedElections, setCompletedElections] = useState<Election[]>([]);
  const [electionResults, setElectionResults] = useState<ElectionResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedElections();
  }, []);

  const fetchCompletedElections = async () => {
    try {
      // Get completed elections
      const { data: electionsData, error: electionsError } = await supabase
        .from('elections')
        .select('*')
        .eq('status', 'completed')
        .order('end_date', { ascending: false })
        .limit(5);

      if (electionsError) throw electionsError;

      const elections = electionsData?.map(mapDbElectionToElection) || [];
      setCompletedElections(elections);

      // Get results for each completed election
      const results = await Promise.all(
        elections.map(async (election) => {
          try {
            // Get total votes for this election
            const { data: votes, error: votesError } = await supabase
              .from('votes')
              .select('id')
              .eq('election_id', election.id);

            if (votesError) throw votesError;

            // Get winning candidate (most votes)
            const { data: candidates, error: candidatesError } = await supabase
              .from('candidates')
              .select('id, name, position')
              .eq('election_id', election.id);

            if (candidatesError) throw candidatesError;

            let winner = null;
            if (candidates && candidates.length > 0) {
              // Get vote counts for each candidate
              const candidatesWithVotes = await Promise.all(
                candidates.map(async (candidate) => {
                  const { count, error: countError } = await supabase
                    .from('vote_candidates')
                    .select('*', { count: 'exact' })
                    .eq('candidate_id', candidate.id);

                  if (countError) throw countError;

                  return {
                    ...candidate,
                    votes: count || 0
                  };
                })
              );

              // Find winner (candidate with most votes)
              if (candidatesWithVotes.length > 0) {
                winner = candidatesWithVotes.reduce((prev, current) => 
                  prev.votes > current.votes ? prev : current
                );
              }
            }

            return {
              electionId: election.id,
              electionTitle: election.title,
              totalVotes: votes?.length || 0,
              winner: winner ? {
                name: winner.name,
                position: winner.position,
                votes: winner.votes
              } : undefined
            };
          } catch (error) {
            console.error(`Error fetching results for election ${election.id}:`, error);
            return {
              electionId: election.id,
              electionTitle: election.title,
              totalVotes: 0
            };
          }
        })
      );

      setElectionResults(results);
    } catch (error) {
      console.error("Error fetching completed elections:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Election Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading recent results...</div>
        </CardContent>
      </Card>
    );
  }

  if (electionResults.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Election Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            No completed elections to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Recent Election Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {electionResults.map((result) => (
            <div key={result.electionId} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{result.electionTitle}</h4>
                  <p className="text-sm text-muted-foreground">
                    Total Votes: {result.totalVotes}
                  </p>
                </div>
                <Badge variant="outline">Completed</Badge>
              </div>
              
              {result.winner && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Winner</span>
                  </div>
                  <p className="text-sm">
                    <strong>{result.winner.name}</strong> - {result.winner.position}
                  </p>
                  <p className="text-xs text-green-700">
                    {result.winner.votes} votes
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/elections/${result.electionId}/results`}>
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Full Results
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ElectionAnnouncements;
