
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ExternalLink } from "lucide-react";
import VoteReceipt from "@/features/elections/components/voting/VoteReceipt";

interface VoteCandidate {
  position: string;
  candidateName: string;
  candidateId: string | null;
}

interface MyVote {
  id: string;
  timestamp: string;
  election: {
    id: string;
    title: string;
    status: string;
  };
  candidates: VoteCandidate[];
}

const MyVotes = () => {
  const [votes, setVotes] = useState<MyVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMyVotes();
    }
  }, [user]);

  const fetchMyVotes = async () => {
    try {
      setLoading(true);
      
      // Get all votes by this user
      const { data: userVotes, error: votesError } = await supabase
        .from('votes')
        .select(`
          id,
          timestamp,
          elections!inner (id, title, status)
        `)
        .eq('user_id', user!.id)
        .order('timestamp', { ascending: false });
      
      if (votesError) throw votesError;
      
      // For each vote, get all candidates they voted for, grouped by position
      const votesWithCandidates = await Promise.all(userVotes.map(async (vote) => {
        // Get all candidates they voted for in this vote
        const { data: candidateVotes, error: candidateVotesError } = await supabase
          .from('vote_candidates')
          .select(`
            candidate_id,
            position,
            candidates (id, name)
          `)
          .eq('vote_id', vote.id)
          .order('position');
          
        if (candidateVotesError) throw candidateVotesError;
        
        let voteCandidates: VoteCandidate[] = [];
        
        if (candidateVotes && candidateVotes.length > 0) {
          voteCandidates = candidateVotes.map(cv => ({
            position: cv.position,
            candidateName: cv.candidates ? cv.candidates.name : 'Abstained',
            candidateId: cv.candidate_id
          }));
        }
        
        return {
          id: vote.id,
          timestamp: vote.timestamp,
          election: {
            id: vote.elections.id,
            title: vote.elections.title,
            status: vote.elections.status
          },
          candidates: voteCandidates
        };
      }));
      
      setVotes(votesWithCandidates);
    } catch (error) {
      console.error("Error fetching votes:", error);
      toast.error("Failed to fetch your votes");
    } finally {
      setLoading(false);
    }
  };

  // Group candidates by position
  const groupCandidatesByPosition = (candidates: VoteCandidate[]) => {
    const grouped: Record<string, VoteCandidate[]> = {};
    
    candidates.forEach(candidate => {
      if (!grouped[candidate.position]) {
        grouped[candidate.position] = [];
      }
      grouped[candidate.position].push(candidate);
    });
    
    return grouped;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Votes</h1>
      
      {loading ? (
        <div className="text-center py-10">Loading your votes...</div>
      ) : votes.length > 0 ? (
        <div className="space-y-4">
          {votes.map((vote) => (
            <div key={vote.id}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{vote.election.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground">
                      Voted on {new Date(vote.timestamp).toLocaleString()}
                    </p>
                  </div>
                  
                  {vote.candidates.length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(groupCandidatesByPosition(vote.candidates)).map(([position, candidates]) => (
                        <div key={position} className="bg-muted/30 p-3 rounded-md">
                          <h4 className="font-medium text-sm mb-2">{position}</h4>
                          {candidates.map((candidate, idx) => (
                            <div key={idx} className="flex items-center text-sm ml-2">
                              <Check className="h-4 w-4 mr-1 text-green-600" />
                              <span>{candidate.candidateId ? candidate.candidateName : 'Abstained'}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No candidate data available</div>
                  )}
                  
                  <div className="flex gap-2 mt-4 justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowReceipt(showReceipt === vote.id ? null : vote.id)}
                    >
                      {showReceipt === vote.id ? 'Hide Receipt' : 'Show Receipt'}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                    >
                      <Link to={`/elections/${vote.election.id}`}>
                        View Election
                      </Link>
                    </Button>
                    
                    {vote.election.status === 'completed' && (
                      <Button 
                        size="sm" 
                        asChild
                      >
                        <Link to={`/elections/${vote.election.id}/results`}>
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Results
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {showReceipt === vote.id && (
                <VoteReceipt voteData={vote} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-10">
            <p className="text-muted-foreground mb-4">
              You haven't voted in any elections yet.
            </p>
            <Button asChild>
              <Link to="/elections">View Available Elections</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyVotes;
