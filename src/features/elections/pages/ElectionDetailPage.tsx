
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { File, Vote, Users, AlertCircle, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import { Election, mapDbElectionToElection } from "@/types";
import ElectionHeader from "../components/ElectionHeader";
import ElectionStatusAlert from "../components/ElectionStatusAlert";
import { format } from "date-fns";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface VoteCount {
  position: string;
  candidates: {
    id: string;
    name: string;
    votes: number;
    votePercentage: number;
  }[];
  totalVotes: number;
  abstainCount: number;
}

const ElectionDetailPage = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useRole();
  
  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voteResults, setVoteResults] = useState<VoteCount[]>([]);
  const [userHasVoted, setUserHasVoted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [userIsEligible, setUserIsEligible] = useState(false);
  
  useEffect(() => {
    if (electionId) {
      fetchElection();
    }
  }, [electionId]);
  
  const fetchElection = async () => {
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
      
      // Check if user is eligible for this election
      if (user) {
        checkUserEligibility(user.id, transformedElection);
        checkIfUserHasVoted(user.id);
      }
      
      // If election is active, fetch vote counts
      if (transformedElection.status === 'active') {
        fetchVoteCounts(transformedElection);
      }
      
      setError(null);
    } catch (error) {
      console.error("Error fetching election:", error);
      setError(error instanceof Error ? error.message : "Failed to load election");
      toast.error("Failed to load election details");
    } finally {
      setLoading(false);
    }
  };
  
  const checkUserEligibility = async (userId: string, election: Election) => {
    try {
      // First check if user is verified
      const { data: profileData } = await supabase
        .from("profiles")
        .select("is_verified, department, year_level")
        .eq("id", userId)
        .single();
      
      if (!profileData?.is_verified) {
        setUserIsEligible(false);
        return;
      }
      
      // Check if election has department/year_level restrictions
      if (election.departments?.length) {
        if (!profileData.department || !election.departments.includes(profileData.department)) {
          if (!election.departments.includes("University-wide")) {
            setUserIsEligible(false);
            return;
          }
        }
      }
      
      if (election.eligibleYearLevels?.length) {
        if (!profileData.year_level || !election.eligibleYearLevels.includes(profileData.year_level)) {
          if (!election.eligibleYearLevels.includes("All Year Levels")) {
            setUserIsEligible(false);
            return;
          }
        }
      }
      
      setUserIsEligible(true);
    } catch (error) {
      console.error("Error checking eligibility:", error);
      setUserIsEligible(false);
    }
  };
  
  const checkIfUserHasVoted = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("votes")
        .select("id")
        .eq("election_id", electionId)
        .eq("user_id", userId);
        
      if (error) throw error;
      
      setUserHasVoted(data.length > 0);
    } catch (error) {
      console.error("Error checking if user has voted:", error);
    }
  };
  
  const fetchVoteCounts = async (election: Election) => {
    if (!election.positions || election.positions.length === 0) {
      return;
    }
    
    try {
      // Get candidates for this election
      const { data: candidates, error: candidatesError } = await supabase
        .from("candidates")
        .select("id, name, position")
        .eq("election_id", election.id);
        
      if (candidatesError) throw candidatesError;
      
      // Group candidates by position
      const candidatesByPosition: Record<string, any[]> = {};
      candidates?.forEach(candidate => {
        if (!candidatesByPosition[candidate.position]) {
          candidatesByPosition[candidate.position] = [];
        }
        candidatesByPosition[candidate.position].push(candidate);
      });
      
      // Get votes
      const { data: votes, error: votesError } = await supabase
        .from("votes")
        .select("candidate_id, position")
        .eq("election_id", election.id);
        
      if (votesError) throw votesError;
      
      // Calculate vote counts
      const results: VoteCount[] = [];
      
      election.positions.forEach(position => {
        const positionCandidates = candidatesByPosition[position] || [];
        const positionVotes = votes?.filter(v => v.position === position) || [];
        const abstainVotes = votes?.filter(v => v.position === position && !v.candidate_id) || [];
        const totalVotes = positionVotes.length;
        
        const candidateResults = positionCandidates.map(candidate => {
          const candidateVotes = positionVotes.filter(v => v.candidate_id === candidate.id).length;
          return {
            id: candidate.id,
            name: candidate.name,
            votes: candidateVotes,
            votePercentage: totalVotes > 0 ? (candidateVotes / totalVotes) * 100 : 0
          };
        });
        
        results.push({
          position,
          candidates: candidateResults,
          totalVotes,
          abstainCount: abstainVotes.length
        });
      });
      
      setVoteResults(results);
    } catch (error) {
      console.error("Error fetching vote counts:", error);
    }
  };
  
  const handleFileCandidacy = () => {
    if (!user) {
      toast.error("You need to be logged in to apply as a candidate");
      return;
    }
    
    if (!userIsEligible) {
      toast.error("You are not eligible to apply as a candidate for this election");
      return;
    }
    
    navigate(`/elections/${electionId}/candidates`);
  };
  
  const handleVote = () => {
    navigate(`/elections/${electionId}/vote`);
  };
  
  const handleViewResults = () => {
    navigate(`/elections/${electionId}/results`);
  };
  
  const handleViewCandidates = () => {
    navigate(`/elections/${electionId}/candidates`);
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
  
  const isCandidacyPeriodActive = () => {
    if (!election.candidacyStartDate || !election.candidacyEndDate) return false;
    
    const now = new Date();
    const candidacyStart = new Date(election.candidacyStartDate);
    const candidacyEnd = new Date(election.candidacyEndDate);
    
    return now >= candidacyStart && now <= candidacyEnd;
  };
  
  return (
    <div className="container mx-auto py-12 px-4">
      <ElectionHeader election={election} />
      <ElectionStatusAlert election={election} />
      
      <div className="flex flex-col md:flex-row justify-between items-center my-6 gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            {election.status === 'active' && <TabsTrigger value="results">Live Results</TabsTrigger>}
          </TabsList>
        </Tabs>
        
        <div className="flex gap-3">
          {election.status === 'active' && !userHasVoted && userIsEligible && (
            <Button className="bg-[#008f50] hover:bg-[#007a45]" onClick={handleVote}>
              <Vote className="mr-2 h-4 w-4" /> Cast Your Vote
            </Button>
          )}
          
          {isCandidacyPeriodActive() && userIsEligible && (
            <Button variant="outline" onClick={handleFileCandidacy}>
              <File className="mr-2 h-4 w-4" /> File Candidacy
            </Button>
          )}
          
          {election.status === 'completed' && (
            <Button variant="outline" onClick={handleViewResults}>
              View Results
            </Button>
          )}
        </div>
      </div>
      
      <div className="mt-6">
        <TabsContent value="overview" className="pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Election Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{election.departments?.includes("University-wide") ? "University-wide" : "Departmental"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">{format(new Date(election.createdAt), "MMM d, yyyy")}</span>
                    </div>
                    {election.department && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Department:</span>
                        <span className="font-medium">{election.department}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium capitalize">{election.status}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Election Period</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date:</span>
                      <span className="font-medium">{format(new Date(election.startDate), "MMM d, yyyy h:mm a")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">End Date:</span>
                      <span className="font-medium">{format(new Date(election.endDate), "MMM d, yyyy h:mm a")}</span>
                    </div>
                    {election.candidacyStartDate && election.candidacyEndDate && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Candidacy Start:</span>
                          <span className="font-medium">{format(new Date(election.candidacyStartDate), "MMM d, yyyy h:mm a")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Candidacy End:</span>
                          <span className="font-medium">{format(new Date(election.candidacyEndDate), "MMM d, yyyy h:mm a")}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <h3 className="font-semibold mb-4">Election Positions</h3>
                <ul className="list-disc list-inside space-y-1">
                  {election.positions?.map((position, index) => (
                    <li key={index}>{position}</li>
                  ))}
                </ul>
              </div>
              
              {election.status === "active" && userHasVoted && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-800 font-medium">
                    You have already voted in this election.
                  </p>
                </div>
              )}
              
              {election.status === "active" && !userIsEligible && !userHasVoted && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-amber-800 font-medium">
                    You are not eligible to vote in this election.
                  </p>
                  <p className="text-amber-700 text-sm mt-1">
                    This election may be restricted to certain departments or year levels.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="candidates" className="pt-4">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Candidates</h3>
            <Button variant="outline" onClick={handleViewCandidates}>
              View All Candidates <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div>
            {(election.positions || []).map((position, index) => (
              <div key={index} className="mb-6">
                <h4 className="font-medium text-lg">{position}</h4>
                <Separator className="my-2" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {/* This is a placeholder for candidates - will be filled in by the candidates page */}
                  <Card className="bg-muted/50">
                    <CardContent className="flex items-center justify-center p-6 h-32">
                      <p className="text-muted-foreground">
                        View all candidates for this position
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        {election.status === 'active' && (
          <TabsContent value="results" className="pt-4">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Live Results</h3>
              <Button variant="outline" onClick={handleViewResults}>
                View Full Results <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            {voteResults.length > 0 ? (
              voteResults.map((result, index) => (
                <div key={index} className="mb-6">
                  <h4 className="font-medium text-lg">{result.position}</h4>
                  <p className="text-sm text-muted-foreground mb-2">Total Votes: {result.totalVotes}</p>
                  <Separator className="my-2" />
                  <div className="space-y-4 mt-4">
                    {result.candidates.map((candidate, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{candidate.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {candidate.votes} votes ({candidate.votePercentage.toFixed(1)}%)
                          </p>
                        </div>
                        <div className="w-32 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-[#008f50] h-2.5 rounded-full" 
                            style={{ width: `${candidate.votePercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                    {result.abstainCount > 0 && (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Abstain</p>
                          <p className="text-sm text-muted-foreground">
                            {result.abstainCount} votes ({((result.abstainCount / result.totalVotes) * 100).toFixed(1)}%)
                          </p>
                        </div>
                        <div className="w-32 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-gray-400 h-2.5 rounded-full" 
                            style={{ width: `${(result.abstainCount / result.totalVotes) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center p-12">
                  <p className="text-muted-foreground">No voting data available yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </div>
    </div>
  );
};

export default ElectionDetailPage;
