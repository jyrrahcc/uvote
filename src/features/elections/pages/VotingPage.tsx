import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Lock, Timer } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/features/auth/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Election, 
  Candidate, 
  mapDbElectionToElection, 
  mapDbCandidateToCandidate 
} from "@/types";
import CandidatesList from "@/features/candidates/components/CandidatesList";

// Interface for CandidatesList props to ensure type safety
interface CandidatesListProps {
  candidates: Candidate[];
  selectedCandidateId: string | null;
  onSelectCandidate: (candidateId: string) => void;
  readOnly: boolean;
}

/**
 * Voting page component displays election details and allows voting
 */
const VotingPage = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voteLoading, setVoteLoading] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [showAccessCodeInput, setShowAccessCodeInput] = useState(false);
  const [accessCodeVerified, setAccessCodeVerified] = useState(false);

  // Fetch election and candidates data
  useEffect(() => {
    if (!electionId) return;
    
    const fetchElectionData = async () => {
      try {
        setLoading(true);
        
        // Fetch election details
        const { data: electionData, error: electionError } = await supabase
          .from('elections')
          .select('*')
          .eq('id', electionId)
          .single();
        
        if (electionError) throw electionError;
        if (!electionData) {
          toast.error("Election not found");
          navigate('/elections');
          return;
        }
        
        // Transform the election data to match our interface
        const transformedElection = mapDbElectionToElection(electionData);
        setElection(transformedElection);
        
        // If election is private, we need to verify access code before showing content
        if (transformedElection.isPrivate) {
          setShowAccessCodeInput(true);
          // If we don't have a verified access code, don't load candidates yet
          if (!accessCodeVerified) return;
        }
        
        // Fetch candidates for this election
        const { data: candidatesData, error: candidatesError } = await supabase
          .from('candidates')
          .select('*')
          .eq('election_id', electionId);
        
        if (candidatesError) throw candidatesError;
        
        // Transform the candidates data to match our interface
        const transformedCandidates = candidatesData.map(mapDbCandidateToCandidate);
        setCandidates(transformedCandidates);
        
        // Check if user has already voted
        if (user) {
          const { data: voteData, error: voteError } = await supabase
            .from('votes')
            .select('*')
            .eq('election_id', electionId)
            .eq('user_id', user.id)
            .single();
          
          if (!voteError && voteData) {
            setHasVoted(true);
            setSelectedCandidate(voteData.candidate_id);
          }
        }
      } catch (error) {
        console.error("Error fetching election data:", error);
        toast.error("Failed to load election data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchElectionData();
  }, [electionId, navigate, user, accessCodeVerified]);

  // Function to verify access code
  const verifyAccessCode = () => {
    if (!election) return;
    
    if (accessCode === election.accessCode) {
      setAccessCodeVerified(true);
      setShowAccessCodeInput(false);
    } else {
      toast.error("Invalid access code");
    }
  };

  // Handle candidate selection
  const handleSelectCandidate = (candidateId: string) => {
    if (!hasVoted) {
      setSelectedCandidate(candidateId);
    }
  };

  // Submit vote
  const handleVote = async () => {
    if (!user || !selectedCandidate || !election) return;
    
    try {
      setVoteLoading(true);
      
      // Check if user has already voted
      const { data: existingVote, error: checkError } = await supabase
        .from('votes')
        .select('*')
        .eq('election_id', election.id)
        .eq('user_id', user.id)
        .single();
      
      if (!checkError && existingVote) {
        toast.error("You have already voted in this election");
        setHasVoted(true);
        return;
      }
      
      // Insert new vote
      const { error: voteError } = await supabase
        .from('votes')
        .insert({
          election_id: election.id,
          candidate_id: selectedCandidate,
          user_id: user.id
        });
      
      if (voteError) throw voteError;
      
      toast.success("Your vote has been recorded");
      setHasVoted(true);
    } catch (error) {
      console.error("Error submitting vote:", error);
      toast.error("Failed to submit your vote");
    } finally {
      setVoteLoading(false);
    }
  };

  if (loading && !showAccessCodeInput) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <p>Loading election details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate('/elections')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Elections
      </Button>
      
      {/* Election Details */}
      {election && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{election.title}</h1>
          <p className="text-muted-foreground mb-4">{election.description}</p>
          
          {/* Status info */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Card className="bg-muted/50 w-full md:w-auto">
              <CardHeader className="py-4 px-4">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Timer className="h-4 w-4 mr-2" />
                  Status: <span className="ml-2 capitalize">{election.status}</span>
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      )}
      
      {/* Access Code Input for Private Elections */}
      {showAccessCodeInput && election?.isPrivate && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Private Election
            </CardTitle>
            <CardDescription>
              This is a private election. Please enter the access code to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              placeholder="Enter access code"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
            />
          </CardContent>
          <CardFooter>
            <Button onClick={verifyAccessCode} className="w-full">Verify</Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Election closed alert */}
      {election && election.status === 'completed' && (
        <Alert className="mb-6 bg-muted">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>This election has ended</AlertTitle>
          <AlertDescription>
            Voting is no longer available, but you can view the results.
          </AlertDescription>
          <div className="mt-4">
            <Button asChild>
              <Link to={`/elections/${election.id}/results`}>View Results</Link>
            </Button>
          </div>
        </Alert>
      )}
      
      {/* Voting section */}
      {election && 
       !showAccessCodeInput && 
       election.status === 'active' && (
        <>
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
                selectedCandidateId={selectedCandidate}
                onSelectCandidate={handleSelectCandidate}
                readOnly={hasVoted}
              />
            </CardContent>
            <CardFooter>
              {!hasVoted ? (
                <Button 
                  onClick={handleVote} 
                  disabled={!selectedCandidate || voteLoading}
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
                  <Link to={`/elections/${election.id}/results`}>View Results</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        </>
      )}
      
      {/* Upcoming election info */}
      {election && election.status === 'upcoming' && (
        <Alert className="mb-6 bg-secondary/50">
          <Timer className="h-4 w-4" />
          <AlertTitle>This election has not started yet</AlertTitle>
          <AlertDescription>
            Voting will be available once the election starts on {new Date(election.startDate).toLocaleDateString()}.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default VotingPage;
