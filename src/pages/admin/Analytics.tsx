
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { formatNumberWithSuffix, calculatePercentage } from "@/utils/admin/helperUtils";
import { Separator } from "@/components/ui/separator";
import { Election, mapDbElectionToElection } from "@/types";

const COLORS = [
  "#008f50", // Primary DLSU color
  "#e8c547", // Secondary color
  "#f87171",
  "#60a5fa",
  "#34d399",
  "#a78bfa",
  "#fbbf24",
];

const Analytics = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalElections: 0,
    totalVoters: 0,
    totalCandidates: 0,
    activeElections: 0,
    completedElections: 0,
    totalVotes: 0,
    averageParticipation: 0,
  });

  const [elections, setElections] = useState<Election[]>([]);
  const [votesData, setVotesData] = useState<any[]>([]);
  const [candidatesData, setCandidatesData] = useState<any[]>([]);
  const [votersData, setVotersData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch elections
        const { data: electionsData, error: electionsError } = await supabase
          .from("elections")
          .select("*");
          
        if (electionsError) throw electionsError;
        
        // Fetch candidates
        const { data: candidatesData, error: candidatesError } = await supabase
          .from("candidates")
          .select("*");
          
        if (candidatesError) throw candidatesError;
        
        // Fetch votes
        const { data: votesData, error: votesError } = await supabase
          .from("votes")
          .select("*");
          
        if (votesError) throw votesError;
        
        // Fetch vote candidates (individual position votes)
        const { data: voteCandidatesData, error: voteCandidatesError } = await supabase
          .from("vote_candidates")
          .select("*");
          
        if (voteCandidatesError) throw voteCandidatesError;
        
        // Fetch profiles (to get voter count)
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("*");
          
        if (profilesError) throw profilesError;
        
        // Process data - map DB elections to our Election type
        const typedElections: Election[] = electionsData ? electionsData.map(mapDbElectionToElection) : [];
        setElections(typedElections);
        
        // Group data for analysis
        const activeElections = typedElections.filter(e => e.status === 'active');
        const completedElections = typedElections.filter(e => e.status === 'completed');
        
        // Calculate stats
        const totalVoters = votesData ? [...new Set(votesData.map(v => v.user_id))].length : 0;
        const uniqueVoters = votesData ? [...new Set(votesData.map(v => v.user_id))] : [];
        const uniqueCreators = electionsData ? [...new Set(electionsData.map(e => e.created_by).filter(Boolean))] : [];
        
        setStats({
          totalElections: electionsData ? electionsData.length : 0,
          totalVoters: uniqueVoters.length,
          totalCandidates: candidatesData ? candidatesData.length : 0,
          activeElections: activeElections.length,
          completedElections: completedElections.length,
          totalVotes: voteCandidatesData ? voteCandidatesData.length : 0,
          averageParticipation: totalVoters && profilesData ? 
            Math.round((totalVoters / profilesData.length) * 100) : 0
        });
        
        setVotesData(votesData || []);
        setCandidatesData(candidatesData || []);
        setVotersData(uniqueVoters.map(id => ({ user_id: id })) || []);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Chart data preparations
  const electionsByStatusData = [
    { name: "Active", value: stats.activeElections },
    { name: "Completed", value: stats.completedElections },
    { name: "Upcoming", value: stats.totalElections - stats.activeElections - stats.completedElections },
  ];

  const generateMonthlyData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    
    // Get monthly data for elections created this year
    const monthlyElections = months.map((month, index) => {
      const monthElections = elections.filter(election => {
        if (!election.createdAt) return false;
        const createdAt = new Date(election.createdAt);
        return createdAt.getMonth() === index && createdAt.getFullYear() === currentYear;
      });
      
      return {
        month,
        elections: monthlyElections.length,
      };
    });
    
    return monthlyElections;
  };
  
  const monthlyData = generateMonthlyData();
  
  // Generate participation rate data
  const generateParticipationData = () => {
    return elections
      .filter(election => election.status === 'completed')
      .map(election => {
        const electionVotes = votesData.filter(vote => vote.election_id === election.id);
        const participationRate = election.totalEligibleVoters 
          ? (electionVotes.length / election.totalEligibleVoters) * 100 
          : 0;
          
        return {
          name: election.title.substring(0, 20) + (election.title.length > 20 ? '...' : ''),
          rate: Math.round(participationRate),
        };
      })
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);
  };
  
  const participationData = generateParticipationData();
  
  // Generate position popularity data
  const generatePositionData = () => {
    const positionCounts: Record<string, number> = {};
    
    candidatesData.forEach(candidate => {
      if (candidate.position) {
        positionCounts[candidate.position] = (positionCounts[candidate.position] || 0) + 1;
      }
    });
    
    return Object.entries(positionCounts)
      .map(([position, count]) => ({ position, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  };
  
  const positionData = generatePositionData();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Election Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{formatNumberWithSuffix(stats.totalElections)}</CardTitle>
            <CardDescription>Total Elections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {stats.activeElections} active, {stats.completedElections} completed
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{formatNumberWithSuffix(stats.totalVotes)}</CardTitle>
            <CardDescription>Total Votes Cast</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              By {formatNumberWithSuffix(votersData.length)} unique voters
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{formatNumberWithSuffix(stats.totalCandidates)}</CardTitle>
            <CardDescription>Total Candidates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Across all elections
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="elections">Elections</TabsTrigger>
          <TabsTrigger value="voters">Voters</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Elections by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={electionsByStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {electionsByStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Monthly Elections Created</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlyData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="elections"
                        stroke="#008f50"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Voter Participation in Completed Elections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={participationData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end"
                      height={80} 
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="rate" 
                      name="Participation Rate (%)" 
                      fill="#008f50" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="elections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Election Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Status Distribution</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col bg-green-50 border border-green-100 rounded-lg p-4">
                      <span className="text-2xl font-bold text-green-600">{stats.activeElections}</span>
                      <span className="text-sm text-green-800">Active Elections</span>
                    </div>
                    <div className="flex flex-col bg-blue-50 border border-blue-100 rounded-lg p-4">
                      <span className="text-2xl font-bold text-blue-600">
                        {stats.totalElections - stats.activeElections - stats.completedElections}
                      </span>
                      <span className="text-sm text-blue-800">Upcoming Elections</span>
                    </div>
                    <div className="flex flex-col bg-gray-50 border border-gray-100 rounded-lg p-4">
                      <span className="text-2xl font-bold text-gray-600">{stats.completedElections}</span>
                      <span className="text-sm text-gray-800">Completed Elections</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Election Engagement</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted rounded-lg p-4">
                      <div className="text-2xl font-bold">
                        {stats.averageParticipation}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Average Participation Rate
                      </div>
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <div className="text-2xl font-bold">
                        {calculatePercentage(stats.totalVotes, stats.totalElections * stats.totalVoters)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Ballot Completion Rate
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Election Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="elections"
                      stroke="#008f50"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="voters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voter Participation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-2xl font-bold">
                      {formatNumberWithSuffix(votersData.length)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Unique Voters
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-2xl font-bold">
                      {formatNumberWithSuffix(stats.totalVotes)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Votes Cast
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Top Elections by Participation</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={participationData}
                        layout="vertical"
                        margin={{
                          top: 5,
                          right: 30,
                          left: 100,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="rate" name="Participation Rate (%)" fill="#008f50" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="candidates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Most Popular Positions</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={positionData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 60,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="position" 
                          angle={-45} 
                          textAnchor="end" 
                          height={80}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey="count" 
                          name="Number of Candidates" 
                          fill="#008f50" 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Candidate Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-2xl font-bold">
                    {formatNumberWithSuffix(stats.totalCandidates)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Candidates
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-2xl font-bold">
                    {stats.totalElections ? (stats.totalCandidates / stats.totalElections).toFixed(1) : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Average Candidates per Election
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-2xl font-bold">
                    {positionData.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Unique Positions
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
