
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ExternalLink } from "lucide-react";

interface MyVote {
  id: string;
  timestamp: string;
  election: {
    id: string;
    title: string;
    status: string;
  };
  candidate: {
    id: string;
    name: string;
  };
}

const MyVotes = () => {
  const [votes, setVotes] = useState<MyVote[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMyVotes();
    }
  }, [user]);

  const fetchMyVotes = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('votes')
        .select(`
          id,
          timestamp,
          elections!inner (id, title, status),
          candidates!inner (id, name)
        `)
        .eq('user_id', user!.id)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      
      const formattedVotes: MyVote[] = data.map(vote => ({
        id: vote.id,
        timestamp: vote.timestamp,
        election: {
          id: vote.elections.id,
          title: vote.elections.title,
          status: vote.elections.status
        },
        candidate: {
          id: vote.candidates.id,
          name: vote.candidates.name
        }
      }));
      
      setVotes(formattedVotes);
    } catch (error) {
      console.error("Error fetching votes:", error);
      toast.error("Failed to fetch your votes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Votes</h1>
      
      {loading ? (
        <div className="text-center py-10">Loading your votes...</div>
      ) : votes.length > 0 ? (
        <div className="space-y-4">
          {votes.map((vote) => (
            <Card key={vote.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{vote.election.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Check className="h-4 w-4 mr-1 text-green-600" />
                      <span>Voted for: <strong>{vote.candidate.name}</strong></span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Voted on {new Date(vote.timestamp).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
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
                </div>
              </CardContent>
            </Card>
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
