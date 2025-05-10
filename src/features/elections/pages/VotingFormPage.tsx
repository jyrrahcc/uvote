
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, ChevronLeft, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Election, mapDbElectionToElection } from "@/types";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface Candidate {
  id: string;
  name: string;
  position: string;
}

const VotingFormPage = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, string | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  
  useEffect(() => {
    if (!user) {
      toast.error("You must be logged in to vote");
      navigate("/login");
      return;
    }
    
    if (electionId) {
      checkUserCanVote();
      fetchElectionData();
    }
  }, [electionId, user]);
  
  const checkUserCanVote = async () => {
    if (!user || !electionId) return;
    
    try {
      // Check if user has already voted
      const { data: existingVotes, error: votesError } = await supabase
        .from("votes")
        .select("id")
        .eq("election_id", electionId)
        .eq("user_id", user.id);
        
      if (votesError) throw votesError;
      
      if (existingVotes && existingVotes.length > 0) {
        toast.error("You have already voted in this election");
        navigate(`/elections/${electionId}`);
        return;
      }
      
      // Check if user is eligible to vote
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("is_verified, department, year_level")
        .eq("id", user.id)
        .single();
        
      if (profileError) throw profileError;
      
      if (!profileData.is_verified) {
        toast.error("Your account must be verified to vote");
        navigate(`/elections/${electionId}`);
        return;
      }
    } catch (error) {
      console.error("Error checking voting eligibility:", error);
      toast.error("Failed to check voting eligibility");
      navigate(`/elections/${electionId}`);
    }
  };
  
  const fetchElectionData = async () => {
    try {
      setLoading(true);
      
      // Fetch election data
      const { data: electionData, error: electionError } = await supabase
        .from("elections")
        .select("*")
        .eq("id", electionId)
        .single();
        
      if (electionError) throw electionError;
      
      if (!electionData) {
        throw new Error("Election not found");
      }
      
      const transformedElection = mapDbElectionToElection(electionData);
      setElection(transformedElection);
      
      // Check if election is active
      if (transformedElection.status !== "active") {
        toast.error("This election is not currently active");
        navigate(`/elections/${electionId}`);
        return;
      }
      
      // Fetch candidates
      const { data: candidatesData, error: candidatesError } = await supabase
        .from("candidates")
        .select("id, name, position")
        .eq("election_id", electionId);
        
      if (candidatesError) throw candidatesError;
      
      setCandidates(candidatesData || []);
      
      // Initialize votes object with position keys
      const votesInit: Record<string, string | null> = {};
      transformedElection.positions?.forEach(position => {
        votesInit[position] = null;
      });
      setVotes(votesInit);
      
      setError(null);
    } catch (error) {
      console.error("Error fetching election data:", error);
      setError(error instanceof Error ? error.message : "Failed to load election");
      toast.error("Failed to load election data");
    } finally {
      setLoading(false);
    }
  };
  
  const handleVoteChange = (position: string, candidateId: string | null) => {
    setVotes(prev => ({
      ...prev,
      [position]: candidateId
    }));
  };
  
  const handleSubmit = async () => {
    if (!user || !election) return;
    
    try {
      setSubmitting(true);
      
      // Check that all positions have been voted on
      const positions = election.positions || [];
      const hasAllVotes = positions.every(position => votes[position] !== undefined);
      
      if (!hasAllVotes) {
        toast.error("Please vote or abstain for all positions");
        setSubmitting(false);
        return;
      }
      
      // Prepare votes data
      const votesToInsert = positions.map(position => ({
        election_id: electionId,
        user_id: user.id,
        candidate_id: votes[position], // Null if abstained
        position: position,
        timestamp: new Date().toISOString()
      }));
      
      // Insert votes
      const { error: votesError } = await supabase
        .from("votes")
        .insert(votesToInsert);
        
      if (votesError) throw votesError;
      
      toast.success("Your votes have been submitted successfully");
      navigate(`/elections/${electionId}`);
    } catch (error) {
      console.error("Error submitting votes:", error);
      toast.error("Failed to submit your votes");
    } finally {
      setSubmitting(false);
    }
  };
  
  const goToNextPosition = () => {
    if (!election || !election.positions) return;
    
    if (currentPositionIndex < election.positions.length - 1) {
      setCurrentPositionIndex(currentPositionIndex + 1);
    }
  };
  
  const goToPreviousPosition = () => {
    if (currentPositionIndex > 0) {
      setCurrentPositionIndex(currentPositionIndex - 1);
    }
  };
  
  const goToElection = () => {
    navigate(`/elections/${electionId}`);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-12 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error || !election) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center py-12 border rounded-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Election</h2>
          <p className="text-muted-foreground mb-6">{error || "Election not found"}</p>
          <Button onClick={() => navigate("/elections")}>
            Back to Elections
          </Button>
        </div>
      </div>
    );
  }
  
  // Group candidates by position
  const candidatesByPosition: Record<string, Candidate[]> = {};
  candidates.forEach(candidate => {
    if (!candidatesByPosition[candidate.position]) {
      candidatesByPosition[candidate.position] = [];
    }
    candidatesByPosition[candidate.position].push(candidate);
  });
  
  const positions = election.positions || [];
  const currentPosition = positions[currentPositionIndex];
  const positionCandidates = candidatesByPosition[currentPosition] || [];
  
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="mb-8">
        <Button variant="outline" onClick={goToElection}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Election
        </Button>
      </div>
      
      <h1 className="text-3xl font-bold mb-2">{election.title}</h1>
      <p className="text-muted-foreground mb-8">Cast your vote for each position</p>
      
      {/* Position selection */}
      <div className="mb-6">
        <Label htmlFor="position-select">Jump to Position</Label>
        <Select
          value={currentPosition}
          onValueChange={(value) => {
            const index = positions.findIndex(p => p === value);
            if (index !== -1) {
              setCurrentPositionIndex(index);
            }
          }}
        >
          <SelectTrigger id="position-select" className="w-full md:max-w-xs">
            <SelectValue placeholder="Select position" />
          </SelectTrigger>
          <SelectContent>
            {positions.map((position, index) => (
              <SelectItem key={index} value={position}>
                {position}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            {currentPosition} {" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({currentPositionIndex + 1}/{positions.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {positionCandidates.length > 0 ? (
            <RadioGroup
              value={votes[currentPosition] || ""}
              onValueChange={(value) => {
                handleVoteChange(currentPosition, value === "abstain" ? null : value);
              }}
            >
              {positionCandidates.map((candidate) => (
                <div key={candidate.id} className="flex items-center space-x-2 mb-4 p-2 rounded hover:bg-muted">
                  <RadioGroupItem value={candidate.id} id={candidate.id} />
                  <Label htmlFor={candidate.id} className="font-medium cursor-pointer flex-grow">
                    {candidate.name}
                  </Label>
                </div>
              ))}
              
              <Separator className="my-4" />
              
              <div className="flex items-center space-x-2 p-2 rounded hover:bg-muted">
                <RadioGroupItem value="abstain" id="abstain" />
                <Label htmlFor="abstain" className="font-medium cursor-pointer flex-grow">
                  Abstain (I choose not to vote for this position)
                </Label>
              </div>
            </RadioGroup>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No candidates available for this position</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex flex-col-reverse sm:flex-row justify-between gap-4">
        <div>
          <Button 
            variant="outline" 
            onClick={goToPreviousPosition}
            disabled={currentPositionIndex === 0}
          >
            Previous Position
          </Button>
        </div>
        
        <div className="flex gap-2">
          {currentPositionIndex < positions.length - 1 ? (
            <Button 
              onClick={goToNextPosition} 
              disabled={!votes[currentPosition] && votes[currentPosition] !== null}
              className="bg-[#008f50] hover:bg-[#007a45]"
            >
              Next Position
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={submitting || !Object.values(votes).every(v => v !== undefined)}
              className="bg-[#008f50] hover:bg-[#007a45]"
            >
              <Send className="mr-2 h-4 w-4" />
              Submit Votes
            </Button>
          )}
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="font-semibold mb-2">Your Selections</h3>
        <div className="space-y-2">
          {positions.map((position, index) => {
            const selectedId = votes[position];
            let displayValue = "Not voted yet";
            
            if (selectedId === null) {
              displayValue = "Abstained";
            } else if (selectedId) {
              const candidate = candidates.find(c => c.id === selectedId);
              displayValue = candidate ? candidate.name : "Unknown candidate";
            }
            
            return (
              <div 
                key={index} 
                className={`flex justify-between p-2 rounded ${
                  index === currentPositionIndex ? 'bg-muted font-medium' : ''
                }`}
              >
                <span>{position}</span>
                <span className={`${selectedId === undefined ? 'text-muted-foreground' : ''}`}>
                  {displayValue}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VotingFormPage;
