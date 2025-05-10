
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, ArrowLeft, CheckCircle, FileText, Vote } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import { Election, mapDbElectionToElection } from "@/types";
import { useElection } from "@/features/elections/hooks/useElection";
import ElectionStatusAlert from "@/features/elections/components/ElectionStatusAlert";
import CandidatesList from "@/features/candidates/components/CandidatesList";
import { useCandidacyPeriod } from "@/features/candidates/components/election-header/useCandidacyPeriod";

/**
 * Election Detail Page - Displays full information about a specific election
 */
const ElectionDetailPage = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const { user } = useAuth();
  const { isVoter } = useRole();
  const {
    election,
    loading,
    error,
    candidates,
    hasVoted,
    votingStats,
    accessCodeVerified,
    setAccessCodeVerified
  } = useElection(electionId);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [positionVotes, setPositionVotes] = useState<Record<string, any>>({});
  const { isCandidacyPeriodActive } = useCandidacyPeriod(election);

  // Fetch live vote counts for each position when the election is active
  useEffect(() => {
    if (election?.status === "active" && election?.positions?.length > 0) {
      fetchVoteCounts();
    }
  }, [election]);

  const fetchVoteCounts = async () => {
    if (!election || !electionId) return;
    
    try {
      // Get votes grouped by candidate for this election
      const { data: votesData, error: votesError } = await supabase
        .from("votes")
        .select("candidate_id")
        .eq("election_id", electionId)
        .not("candidate_id", "is", null);

      if (votesError) throw votesError;

      // Process votes by position using candidates data
      const votesByPosition: Record<string, any> = {};
      
      if (votesData && election.positions && candidates) {
        // Initialize positions
        election.positions.forEach(position => {
          votesByPosition[position] = {
            position,
            totalVotes: 0,
            candidates: {}
          };
        });
        
        // Count votes for each candidate
        votesData.forEach(vote => {
          if (vote.candidate_id) {
            // Find candidate and their position
            const candidate = candidates.find(c => c.id === vote.candidate_id);
            if (candidate && candidate.position) {
              if (!votesByPosition[candidate.position]) {
                votesByPosition[candidate.position] = {
                  position: candidate.position,
                  totalVotes: 0,
                  candidates: {}
                };
              }
              
              if (!votesByPosition[candidate.position].candidates[vote.candidate_id]) {
                votesByPosition[candidate.position].candidates[vote.candidate_id] = 0;
              }
              
              votesByPosition[candidate.position].candidates[vote.candidate_id]++;
              votesByPosition[candidate.position].totalVotes++;
            }
          }
        });
      }
      
      setPositionVotes(votesByPosition);
    } catch (error) {
      console.error("Error fetching vote counts:", error);
      toast.error("Failed to load vote counts");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // If loading, display loading state
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link to="/elections"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Elections</Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-xl mb-2">Loading election details...</div>
          <p className="text-sm text-muted-foreground">Please wait while we fetch the election information.</p>
        </div>
      </div>
    );
  }

  // If error, display error state
  if (error || !election) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link to="/elections"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Elections</Link>
          </Button>
        </div>
        <div className="text-center py-12 border rounded-md">
          <p className="text-xl text-destructive font-medium mb-4">
            {error || "Election not found"}
          </p>
          <Button asChild>
            <Link to="/elections">Return to Elections</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Render election details
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back button and election status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link to="/elections"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Elections</Link>
          </Button>
          
          {election.status === "active" && (
            <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
          )}
          {election.status === "upcoming" && (
            <Badge variant="outline" className="text-blue-500 border-blue-500">Upcoming</Badge>
          )}
          {election.status === "completed" && (
            <Badge variant="secondary">Completed</Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* File Candidacy button (only shown during candidacy period and for eligible voters) */}
          {isCandidacyPeriodActive && isVoter && (
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <Link to={`/elections/${election.id}/candidates`}>
                <FileText className="h-4 w-4" />
                <span>File Candidacy</span>
              </Link>
            </Button>
          )}
          
          {/* Vote button (only shown during active elections) */}
          {election.status === "active" && (
            <>
              {hasVoted ? (
                <Badge className="flex items-center gap-1 bg-green-500">
                  <CheckCircle className="h-3 w-3" />
                  <span>You have voted</span>
                </Badge>
              ) : (
                <Button className="flex items-center gap-2" asChild>
                  <Link to={`/elections/${election.id}`}>
                    <Vote className="h-4 w-4" />
                    <span>Cast Your Vote</span>
                  </Link>
                </Button>
              )}
            </>
          )}
          
          {/* View Results button (only shown for completed elections) */}
          {election.status === "completed" && (
            <Button asChild>
              <Link to={`/elections/${election.id}/results`}>View Full Results</Link>
            </Button>
          )}
        </div>
      </div>
      
      {/* Election title and description */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{election.title}</h1>
        {election.description && (
          <p className="text-muted-foreground mt-2">{election.description}</p>
        )}
      </div>
      
      {/* Status alerts for non-active elections */}
      {election.status !== "active" && (
        <ElectionStatusAlert election={election} status={election.status} />
      )}
      
      {/* Election banner if available */}
      {election.banner_urls && election.banner_urls.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-lg">
          <img 
            src={election.banner_urls[0]} 
            alt={election.title}
            className="w-full h-48 md:h-64 object-cover"
          />
        </div>
      )}
      
      {/* Election details */}
      <Card className="mb-6">
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <h3 className="font-medium">Voting Period</h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(election.startDate)} - {formatDate(election.endDate)}
              </p>
            </div>
          </div>
          
          {election.candidacyStartDate && election.candidacyEndDate && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="font-medium">Candidacy Period</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDate(election.candidacyStartDate)} - {formatDate(election.candidacyEndDate)}
                </p>
              </div>
            </div>
          )}
          
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <h3 className="font-medium">Department</h3>
              <p className="text-sm text-muted-foreground">
                {election.departments && election.departments.length > 0
                  ? election.departments.join(", ")
                  : election.department || "University-wide"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs for Overview and Candidates */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
        </TabsList>
        
        {/* Overview tab content */}
        <TabsContent value="overview" className="space-y-6">
          {election.status === "active" && election.positions && election.positions.length > 0 ? (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Live Election Results</h2>
              
              {election.positions.map((position) => {
                const positionData = positionVotes[position];
                const totalVotes = positionData?.totalVotes || 0;
                
                return (
                  <Card key={position} className="overflow-hidden">
                    <div className="bg-muted p-4">
                      <h3 className="font-medium">{position}</h3>
                      <p className="text-sm text-muted-foreground">
                        {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} cast
                      </p>
                    </div>
                    <CardContent className="p-0">
                      {candidates
                        ?.filter(candidate => candidate.position === position)
                        .map((candidate) => {
                          const candidateVotes = positionData?.candidates[candidate.id] || 0;
                          const percentage = totalVotes > 0 ? (candidateVotes / totalVotes) * 100 : 0;
                          
                          return (
                            <div 
                              key={candidate.id}
                              className="p-4 border-b last:border-b-0 flex justify-between items-center"
                            >
                              <div className="flex items-center gap-3">
                                {candidate.image_url && (
                                  <div className="h-10 w-10 rounded-full overflow-hidden">
                                    <img 
                                      src={candidate.image_url}
                                      alt={candidate.name}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium">{candidate.name}</p>
                                  {candidate.bio && (
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                      {candidate.bio}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">{candidateVotes}</p>
                                <p className="text-xs text-muted-foreground">
                                  {percentage.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        
                      {candidates?.filter(candidate => candidate.position === position).length === 0 && (
                        <div className="p-6 text-center text-muted-foreground">
                          No candidates for this position
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <h2 className="text-xl font-semibold mb-2">
                {election.status === "upcoming" ? "Election has not started yet" : "Election has ended"}
              </h2>
              <p className="text-muted-foreground">
                {election.status === "upcoming" 
                  ? `Voting will begin on ${formatDate(election.startDate)}`
                  : `The election ended on ${formatDate(election.endDate)}`
                }
              </p>
              
              {election.status === "completed" && (
                <Button className="mt-4" asChild>
                  <Link to={`/elections/${election.id}/results`}>View Full Results</Link>
                </Button>
              )}
            </div>
          )}
        </TabsContent>
        
        {/* Candidates tab content */}
        <TabsContent value="candidates" className="space-y-6">
          <h2 className="text-xl font-semibold">Election Candidates</h2>
          
          {election.positions && election.positions.length > 0 ? (
            <div className="space-y-8">
              {election.positions.map((position) => (
                <div key={position} className="space-y-4">
                  <h3 className="text-lg font-medium">{position}</h3>
                  <Separator />
                  
                  {candidates && candidates.filter(c => c.position === position).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {candidates
                        .filter(candidate => candidate.position === position)
                        .map((candidate) => (
                          <CandidatesList 
                            key={candidate.id}
                            candidates={[candidate]}
                            readOnly={true}
                          />
                        ))
                      }
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No candidates for this position</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            candidates && candidates.length > 0 ? (
              <CandidatesList candidates={candidates} readOnly={true} />
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No candidates have been added to this election yet.</p>
              </div>
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ElectionDetailPage;
