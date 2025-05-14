import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  AlertDialog,
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
  BarChart,
  PieChart,
  Users,
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Check,
  RefreshCcw,
  Pencil,
  Eye
} from "lucide-react";
import { Election, mapDbElectionToElection } from "@/types";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const ElectionDetail = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  
  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [voters, setVoters] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalVoters: 0,
    totalVotes: 0,
    participationRate: 0,
    positionsCount: 0,
    candidatesCount: 0
  });

  useEffect(() => {
    if (electionId) {
      fetchElectionDetails();
    }
  }, [electionId]);

  /**
   * Fetch election details and related data
   */
  const fetchElectionDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch election data
      const { data: electionData, error: electionError } = await supabase
        .from("elections")
        .select("*")
        .eq("id", electionId)
        .single();
      
      if (electionError) throw electionError;
      if (!electionData) throw new Error("Election not found");
      
      const formattedElection = mapDbElectionToElection(electionData);
      setElection(formattedElection);
      
      // Fetch candidates
      const { data: candidatesData, error: candidatesError } = await supabase
        .from("candidates")
        .select("*")
        .eq("election_id", electionId);
      
      if (candidatesError) throw candidatesError;
      setCandidates(candidatesData || []);
      
      // Fetch votes
      const { data: votesData, error: votesError } = await supabase
        .from("votes")
        .select("*")
        .eq("election_id", electionId);
      
      if (votesError) throw votesError;
      setVotes(votesData || []);

      // Fetch vote details for analytics
      const { data: voteDetailsData, error: voteDetailsError } = await supabase
        .from("vote_candidates")
        .select("*, votes(*)")
        .eq("votes.election_id", electionId);
        
      if (voteDetailsError) throw voteDetailsError;
      
      // Compute stats
      const positions = formattedElection.positions || [];
      const totalEligibleVoters = formattedElection.totalEligibleVoters || 0;
      const totalVotes = votesData?.length || 0;
      const participationRate = totalEligibleVoters > 0 
        ? Math.round((totalVotes / totalEligibleVoters) * 100) 
        : 0;
        
      setStats({
        totalVoters: totalEligibleVoters,
        totalVotes: totalVotes,
        participationRate: participationRate,
        positionsCount: positions.length,
        candidatesCount: candidatesData?.length || 0
      });
      
    } catch (error) {
      console.error("Error fetching election details:", error);
      setError("Failed to load election details");
      toast.error("Failed to load election data");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Complete an election before its scheduled end date
   */
  const handleCompleteElection = async () => {
    if (!election) return;
    
    try {
      const { error } = await supabase
        .from('elections')
        .update({ status: 'completed' })
        .eq('id', election.id);
      
      if (error) throw error;
      
      toast.success("Election marked as completed", {
        description: "The election has been finalized before its scheduled end date"
      });
      
      // Refresh election data
      fetchElectionDetails();
    } catch (error) {
      console.error("Error completing election:", error);
      toast.error("Failed to complete the election");
    }
  };

  /**
   * Reset all votes for an election
   */
  const handleResetVotes = async () => {
    if (!election) return;
    
    try {
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('election_id', election.id);
      
      if (error) throw error;
      
      toast.success("Election votes have been reset successfully", {
        description: "All voters can now vote again in this election"
      });
      
      // Refresh election data
      fetchElectionDetails();
    } catch (error) {
      console.error("Error resetting election votes:", error);
      toast.error("Failed to reset election votes");
    }
  };

  /**
   * Generate position-based vote data for charts
   */
  const generatePositionChartData = () => {
    if (!candidates || candidates.length === 0) return [];
    
    const positions = [...new Set(candidates.map(c => c.position))];
    return positions.map(position => {
      const positionCandidates = candidates.filter(c => c.position === position);
      return {
        position,
        candidateCount: positionCandidates.length
      };
    });
  };

  /**
   * Generate test participation data for pie chart
   */
  const generateParticipationData = () => {
    return [
      { name: "Voted", value: stats.totalVotes },
      { name: "Not Voted", value: stats.totalVoters - stats.totalVotes }
    ].filter(item => item.value > 0);
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 space-y-8">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/elections')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Elections
          </Button>
          <h2 className="text-2xl font-bold animate-pulse">Loading election details...</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="voters">Voters</TabsTrigger>
          </TabsList>
          <div className="h-[400px] rounded-md border animate-pulse bg-muted/20 mt-4" />
        </Tabs>
      </div>
    );
  }

  // Error state
  if (error || !election) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/elections')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Elections
        </Button>
        
        <div className="text-center p-12 border rounded-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-lg mb-6">{error || "Failed to load election details"}</p>
          <Button onClick={fetchElectionDetails}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const positionChartData = generatePositionChartData();
  const participationData = generateParticipationData();

  return (
    <div className="container mx-auto py-12 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center mb-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/elections')} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Elections
            </Button>
            <Badge variant={election.status === 'active' ? 'default' : election.status === 'upcoming' ? 'outline' : 'secondary'} className="capitalize">
              {election.status}
            </Badge>
          </div>
          
          <h1 className="text-3xl font-bold">{election.title}</h1>
          {election.department && (
            <p className="text-muted-foreground mt-1">{election.department}</p>
          )}
          <p className="mt-4 max-w-3xl text-muted-foreground">{election.description}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate(`/elections/${election.id}`)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Public Page
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate(`/admin/elections/edit/${election.id}`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Election
          </Button>
          
          {election.status !== "completed" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Complete Election
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Complete Election Early?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will mark the election "{election.title}" as completed before its scheduled end date.
                    No further votes will be accepted. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-green-600 text-white hover:bg-green-700"
                    onClick={handleCompleteElection}
                  >
                    Complete Election
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-amber-600">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Reset Votes
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset Election Votes?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all votes for this election. 
                  All voters will be able to vote again. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-amber-600 text-white hover:bg-amber-700"
                  onClick={handleResetVotes}
                >
                  Reset Votes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Separator />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Voter Participation
            </CardTitle>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {stats.participationRate}%
              </div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              {stats.totalVotes} out of {stats.totalVoters} eligible voters
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Election Status
            </CardTitle>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold capitalize">
                {election.status}
              </div>
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              {election.status === 'upcoming' 
                ? `Starts ${new Date(election.startDate).toLocaleDateString()}`
                : election.status === 'active'
                ? `Ends ${new Date(election.endDate).toLocaleDateString()}`
                : `Ended ${new Date(election.endDate).toLocaleDateString()}`
              }
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Candidates & Positions
            </CardTitle>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {stats.candidatesCount}
              </div>
              <ClipboardList className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              Across {stats.positionsCount} {stats.positionsCount === 1 ? 'position' : 'positions'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      
      {/* Tabs for different data views */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="voters">Voters</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Bar Chart */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Candidates per Position
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={positionChartData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 60,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="position" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="candidateCount" fill="#008f50" name="Number of Candidates" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Pie Chart */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Voter Participation
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={participationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {participationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Election Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Election Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-medium">Election Period</div>
                  <div className="text-muted-foreground">
                    {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}
                  </div>
                </div>
                
                {election.candidacyStartDate && election.candidacyEndDate && (
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium">Candidacy Period</div>
                    <div className="text-muted-foreground">
                      {new Date(election.candidacyStartDate).toLocaleDateString()} - {new Date(election.candidacyEndDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-medium">Election Created</div>
                  <div className="text-muted-foreground">
                    {new Date(election.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Candidates Tab */}
        <TabsContent value="candidates">
          <Card>
            <CardHeader>
              <CardTitle>Candidates</CardTitle>
              <CardDescription>
                All registered candidates for this election
              </CardDescription>
            </CardHeader>
            <CardContent>
              {candidates.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No candidates registered for this election yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Array.from(new Set(candidates.map(c => c.position))).map(position => (
                    <div key={position} className="space-y-2">
                      <h3 className="font-semibold text-lg">{position}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {candidates
                          .filter(candidate => candidate.position === position)
                          .map(candidate => (
                            <Card key={candidate.id} className="overflow-hidden">
                              <div className="aspect-video bg-muted flex items-center justify-center">
                                {candidate.image_url ? (
                                  <img 
                                    src={candidate.image_url} 
                                    alt={candidate.name} 
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <div className="text-muted-foreground">No Image</div>
                                )}
                              </div>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{candidate.name}</CardTitle>
                                <CardDescription>
                                  {candidate.department && `${candidate.department}`}
                                  {candidate.year_level && candidate.department && ` • `}
                                  {candidate.year_level && `${candidate.year_level}`}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="pb-2">
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                  {candidate.bio || "No biography provided"}
                                </p>
                              </CardContent>
                            </Card>
                          ))
                        }
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Voters Tab */}
        <TabsContent value="voters">
          <Card>
            <CardHeader>
              <CardTitle>Voter Statistics</CardTitle>
              <CardDescription>
                Summary of voter participation in this election
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col">
                    <div className="text-3xl font-bold">{stats.totalVoters}</div>
                    <div className="text-sm text-muted-foreground">Total Eligible Voters</div>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-3xl font-bold">{stats.totalVotes}</div>
                    <div className="text-sm text-muted-foreground">Total Votes Cast</div>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-3xl font-bold">{stats.participationRate}%</div>
                    <div className="text-sm text-muted-foreground">Participation Rate</div>
                  </div>
                </div>
                
                {election.restrictVoting && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Eligible Voters</h3>
                    <div className="space-y-2">
                      {election.colleges && election.colleges.length > 0 && (
                        <div>
                          <div className="font-medium">Eligible Departments:</div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {election.colleges.map(dept => (
                              <Badge key={dept} variant="outline">{dept}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {election.eligibleYearLevels && election.eligibleYearLevels.length > 0 && (
                        <div>
                          <div className="font-medium">Eligible Year Levels:</div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {election.eligibleYearLevels.map(year => (
                              <Badge key={year} variant="outline">{year}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ElectionDetail;
