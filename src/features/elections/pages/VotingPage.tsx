
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Election, Candidate } from "@/types";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle, Check } from "lucide-react";

const VotingPage = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [showAccessDialog, setShowAccessDialog] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (electionId && user) {
      fetchElectionDetails();
      checkUserVote();
    }
  }, [electionId, user]);

  const fetchElectionDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .eq('id', electionId)
        .single();
      
      if (error) throw error;
      
      setElection(data);
      
      if (data.is_private) {
        setIsPrivate(true);
        setShowAccessDialog(true);
      } else {
        fetchCandidates();
      }
    } catch (error) {
      console.error("Error fetching election details:", error);
      toast.error("Failed to fetch election details");
      navigate('/elections');
    }
  };

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('election_id', electionId);
      
      if (error) throw error;
      
      setCandidates(data || []);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Failed to fetch candidates");
    } finally {
      setLoading(false);
    }
  };

  const checkUserVote = async () => {
    if (!user || !electionId) return;
    
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('election_id', electionId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setHasVoted(data && data.length > 0);
      if (data && data.length > 0) {
        setSelectedCandidate(data[0].candidate_id);
      }
    } catch (error) {
      console.error("Error checking user vote:", error);
    }
  };

  const handleVerifyAccessCode = () => {
    if (election?.access_code === accessCode) {
      setShowAccessDialog(false);
      fetchCandidates();
    } else {
      toast.error("Invalid access code");
    }
  };

  const handleVote = async () => {
    if (!user || !electionId || !selectedCandidate) {
      toast.error("Please select a candidate to vote");
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('votes')
        .insert({
          election_id: electionId,
          candidate_id: selectedCandidate,
          user_id: user.id,
        });
      
      if (error) throw error;
      
      toast.success("Your vote has been recorded");
      setHasVoted(true);
      setConfirmDialogOpen(false);
    } catch (error) {
      console.error("Error recording vote:", error);
      toast.error("Failed to record your vote");
    }
  };

  if (!election) {
    return <div className="text-center py-10">Loading election details...</div>;
  }

  if (election.status === 'upcoming') {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>{election.title}</CardTitle>
          <CardDescription>{election.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-6 rounded-lg text-center">
            <h3 className="text-lg font-medium">Voting has not started yet</h3>
            <p className="text-muted-foreground mt-2">
              This election will open for voting on {new Date(election.startDate).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (election.status === 'completed') {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>{election.title}</CardTitle>
          <CardDescription>{election.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-6 rounded-lg text-center">
            <h3 className="text-lg font-medium">Voting has ended</h3>
            <p className="text-muted-foreground mt-2">
              This election closed on {new Date(election.endDate).toLocaleString()}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => navigate(`/elections/${electionId}/results`)}>
            View Results
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{election.title}</h1>
      <p className="text-muted-foreground">{election.description}</p>
      
      {hasVoted && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-md flex items-center">
          <Check className="h-5 w-5 text-green-500 mr-2" />
          <p className="text-green-700">
            You have already voted in this election. Thank you for participating!
          </p>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-10">Loading candidates...</div>
      ) : candidates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate) => (
            <Card 
              key={candidate.id} 
              className={`cursor-pointer transition-all ${
                selectedCandidate === candidate.id ? 'ring-2 ring-primary' : ''
              } ${hasVoted ? 'opacity-80 pointer-events-none' : 'hover:shadow-md'}`}
              onClick={() => !hasVoted && setSelectedCandidate(candidate.id)}
            >
              <CardHeader>
                {candidate.imageUrl && (
                  <div className="w-full aspect-square bg-muted rounded-md overflow-hidden mb-4">
                    <img 
                      src={candidate.imageUrl}
                      alt={candidate.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardTitle>{candidate.name}</CardTitle>
                <CardDescription>{candidate.position}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{candidate.bio}</p>
              </CardContent>
              <CardFooter className="pt-0">
                {selectedCandidate === candidate.id && !hasVoted && (
                  <Button 
                    className="w-full"
                    onClick={() => setConfirmDialogOpen(true)}
                  >
                    Vote for {candidate.name}
                  </Button>
                )}
                {selectedCandidate === candidate.id && hasVoted && (
                  <Button 
                    variant="outline" 
                    className="w-full cursor-default"
                    disabled
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Voted
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            No candidates have been added to this election yet.
          </p>
        </div>
      )}
      
      {/* Access Code Dialog */}
      <Dialog open={showAccessDialog} onOpenChange={setShowAccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Private Election</DialogTitle>
            <DialogDescription>
              This is a private election. Please enter the access code to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Enter access code"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              type="password"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleVerifyAccessCode}>
              Submit
            </Button>
            <Button variant="outline" onClick={() => navigate('/elections')}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Vote</DialogTitle>
            <DialogDescription>
              You are about to cast your vote in this election. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              <p className="text-yellow-700">
                You can only vote once per election. Your vote is final.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleVote} className="w-full sm:w-auto">
              Yes, Cast My Vote
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VotingPage;
