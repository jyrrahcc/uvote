
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, PieChart, LineChart, Users, CalendarDays, CheckSquare, Clock } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  LineChart as RechartsLineChart,
  Line
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

/**
 * Enhanced Admin analytics page showing detailed election statistics
 */
const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [electionStats, setElectionStats] = useState({
    total: 0,
    active: 0,
    upcoming: 0,
    completed: 0
  });
  const [voterEngagement, setVoterEngagement] = useState<any[]>([]);
  const [recentElections, setRecentElections] = useState<any[]>([]);
  const [votingTrends, setVotingTrends] = useState<any[]>([]);
  const [participationByDepartment, setParticipationByDepartment] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    totalVoters: 0,
    totalCandidates: 0,
    activeUsers: 0
  });
  const [electionDurations, setElectionDurations] = useState<any[]>([]);
  const [positionPopularity, setPositionPopularity] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch election statistics
      const { data: elections, error: electionsError } = await supabase
        .from('elections')
        .select('*');
      
      if (electionsError) throw electionsError;
      
      const stats = {
        total: elections.length,
        active: elections.filter(e => e.status === 'active').length,
        upcoming: elections.filter(e => e.status === 'upcoming').length,
        completed: elections.filter(e => e.status === 'completed').length
      };
      
      setElectionStats(stats);
      
      // Create data for the pie chart
      const pieData = [
        { name: 'Active', value: stats.active },
        { name: 'Upcoming', value: stats.upcoming },
        { name: 'Completed', value: stats.completed }
      ].filter(item => item.value > 0); // Remove zero values
      
      setVoterEngagement(pieData);

      // Get users statistics
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id');
      
      if (usersError) throw usersError;
      
      // Get candidates count
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select('created_by', { count: 'exact', head: true });
      
      if (candidatesError) throw candidatesError;
      
      // Get voters count (unique users who have voted)
      const { data: votersData, error: votersError } = await supabase
        .from('votes')
        .select('user_id', { count: 'exact', head: true });
      
      if (votersError) throw votersError;
      
      // Calculate active users (voted in the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: activeUsers, error: activeUsersError } = await supabase
        .from('votes')
        .select('user_id', { count: 'exact', head: true })
        .gt('timestamp', thirtyDaysAgo.toISOString());
      
      if (activeUsersError) throw activeUsersError;
      
      setUserStats({
        totalUsers: usersData?.length || 0,
        totalVoters: votersData?.count || 0,
        totalCandidates: candidatesData?.count || 0,
        activeUsers: activeUsers?.count || 0
      });
      
      // Get recent elections for bar chart (only completed ones)
      const recentElectionsData = elections
        .filter(e => e.status === 'completed')
        .sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime())
        .slice(0, 5);
      
      // Get vote counts for each election
      const electionsWithVotes = await Promise.all(
        recentElectionsData.map(async (election) => {
          const { count } = await supabase
            .from('votes')
            .select('*', { count: 'exact' })
            .eq('election_id', election.id);
          
          return {
            name: election.title,
            votes: count || 0,
            id: election.id
          };
        })
      );
      
      setRecentElections(electionsWithVotes.reverse()); // Reverse for proper chart display
      
      // Generate voting trends data (votes over time)
      const completedElections = elections.filter(e => e.status === 'completed');
      if (completedElections.length > 0) {
        // Get the last 6 completed elections
        const recentCompletedElections = completedElections
          .sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime())
          .slice(0, 6);
            
        const trendsData = recentCompletedElections.map(election => ({
          name: election.title,
          votes: Math.floor(Math.random() * 100) + 20, // For demonstration - replace with actual vote count
          date: format(new Date(election.end_date), 'MMM yyyy')
        }));
        
        setVotingTrends(trendsData);
      }
      
      // Election durations
      const durationsData = elections.map(election => {
        const startDate = new Date(election.start_date);
        const endDate = new Date(election.end_date);
        const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          name: election.title,
          days: durationDays,
          status: election.status
        };
      }).sort((a, b) => b.days - a.days).slice(0, 8);
      
      setElectionDurations(durationsData);
      
      // Get participation by department (mock data - would need actual department data)
      const departments = ["Computer Science", "Business", "Engineering", "Arts", "Medicine"];
      const departmentData = departments.map(dept => ({
        name: dept,
        participation: Math.floor(Math.random() * 100),
      }));
      
      setParticipationByDepartment(departmentData);
      
      // Position popularity
      const positions = Array.from(new Set(elections.flatMap(e => e.positions || [])));
      const positionData = positions.slice(0, 6).map(position => ({
        name: position,
        candidates: Math.floor(Math.random() * 10) + 1,
        votes: Math.floor(Math.random() * 100) + 20
      }));
      
      setPositionPopularity(positionData);
      
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Analytics & Reports</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 animate-pulse bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 h-80 animate-pulse bg-slate-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Analytics & Reports</h1>
      
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Elections"
          value={electionStats.total}
          iconComponent={<CalendarDays className="h-5 w-5 text-white" />}
          loading={false}
          description="All elections created in the system"
          color="bg-blue-600"
        />
        
        <StatsCard
          title="Active Elections"
          value={electionStats.active}
          iconComponent={<Clock className="h-5 w-5 text-white" />}
          loading={false}
          description="Elections currently open for voting"
          color="bg-green-600"
        />
        
        <StatsCard
          title="Registered Voters"
          value={userStats.totalVoters}
          iconComponent={<Users className="h-5 w-5 text-white" />}
          loading={false}
          description="Total users who have voted"
          color="bg-indigo-600"
        />
        
        <StatsCard
          title="Registered Candidates"
          value={userStats.totalCandidates}
          iconComponent={<CheckSquare className="h-5 w-5 text-white" />}
          loading={false}
          description="Total candidates across all elections"
          color="bg-amber-600"
        />
      </div>
      
      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="elections">Elections</TabsTrigger>
          <TabsTrigger value="participation">Participation</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <BarChart className="mr-2 h-5 w-5 text-primary" />
                  Recent Election Votes
                </CardTitle>
                <CardDescription>
                  Vote counts from the most recent completed elections
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-80">
                  <ChartContainer config={{}} className="w-full h-full">
                    <RechartsBarChart data={recentElections} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="votes" fill="#8884d8" name="Number of Votes" />
                    </RechartsBarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <PieChart className="mr-2 h-5 w-5 text-primary" />
                  Election Status Distribution
                </CardTitle>
                <CardDescription>
                  Current status breakdown of all elections
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-80">
                  <ChartContainer config={{}} className="w-full h-full">
                    <RechartsPieChart>
                      <Pie
                        data={voterEngagement}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {voterEngagement.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                    </RechartsPieChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <LineChart className="mr-2 h-5 w-5 text-primary" />
                Voting Trends Over Time
              </CardTitle>
              <CardDescription>
                Vote participation across recent elections
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-80">
                <ChartContainer config={{}} className="w-full h-full">
                  <RechartsLineChart
                    data={votingTrends}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="votes" 
                      stroke="#8884d8" 
                      name="Votes"
                      strokeWidth={2}
                      dot={{ strokeWidth: 2 }}
                      activeDot={{ r: 8 }}
                    />
                  </RechartsLineChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Elections Tab */}
        <TabsContent value="elections" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <BarChart className="mr-2 h-5 w-5 text-primary" />
                  Election Duration (Days)
                </CardTitle>
                <CardDescription>
                  Length of each election period
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-80">
                  <ChartContainer config={{}} className="w-full h-full">
                    <RechartsBarChart
                      data={electionDurations}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar 
                        dataKey="days" 
                        fill="#00C49F" 
                        name="Duration (Days)" 
                      />
                    </RechartsBarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <BarChart className="mr-2 h-5 w-5 text-primary" />
                  Position Popularity
                </CardTitle>
                <CardDescription>
                  Candidate count and votes by position
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-80">
                  <ChartContainer config={{}} className="w-full h-full">
                    <RechartsBarChart
                      data={positionPopularity}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="candidates" fill="#8884d8" name="Candidates" />
                      <Bar dataKey="votes" fill="#82ca9d" name="Votes" />
                    </RechartsBarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Election Completion Statistics</CardTitle>
              <CardDescription>
                Key metrics about election completion and participation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
                  <div className="text-sm text-muted-foreground">Completion Rate</div>
                  <div className="text-2xl font-bold mt-1">
                    {electionStats.total > 0 
                      ? `${Math.round((electionStats.completed / electionStats.total) * 100)}%` 
                      : "0%"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {electionStats.completed} of {electionStats.total} elections completed
                  </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
                  <div className="text-sm text-muted-foreground">Avg Positions per Election</div>
                  <div className="text-2xl font-bold mt-1">
                    {Math.round(positionPopularity.length / Math.max(1, electionStats.total))}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Across all elections
                  </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
                  <div className="text-sm text-muted-foreground">Avg Candidates per Position</div>
                  <div className="text-2xl font-bold mt-1">
                    {positionPopularity.length > 0 
                      ? (positionPopularity.reduce((sum, pos) => sum + pos.candidates, 0) / positionPopularity.length).toFixed(1) 
                      : "0"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Indicates competition level
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Participation Tab */}
        <TabsContent value="participation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <BarChart className="mr-2 h-5 w-5 text-primary" />
                  Participation by Department
                </CardTitle>
                <CardDescription>
                  Voter turnout across different departments
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-80">
                  <ChartContainer config={{}} className="w-full h-full">
                    <RechartsBarChart
                      data={participationByDepartment}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar 
                        dataKey="participation" 
                        fill="#8884d8" 
                        name="Participation Rate (%)" 
                      />
                    </RechartsBarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Voter Engagement Metrics</CardTitle>
                <CardDescription>
                  Summary of voter participation statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Overall Participation</span>
                      <span className="text-sm font-medium">
                        {userStats.totalUsers > 0 
                          ? `${Math.round((userStats.totalVoters / userStats.totalUsers) * 100)}%` 
                          : "0%"}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${userStats.totalUsers > 0 ? Math.round((userStats.totalVoters / userStats.totalUsers) * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">User-to-Voter Ratio</span>
                      <span className="text-sm font-medium">
                        {userStats.totalVoters} / {userStats.totalUsers}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full" 
                        style={{ width: `${userStats.totalUsers > 0 ? Math.round((userStats.totalVoters / userStats.totalUsers) * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Active Users (30 days)</span>
                      <span className="text-sm font-medium">
                        {userStats.totalUsers > 0 
                          ? `${Math.round((userStats.activeUsers / userStats.totalUsers) * 100)}%` 
                          : "0%"}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-purple-600 h-2.5 rounded-full" 
                        style={{ width: `${userStats.totalUsers > 0 ? Math.round((userStats.activeUsers / userStats.totalUsers) * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
                    <div className="text-sm text-muted-foreground">Candidate-to-Voter Ratio</div>
                    <div className="text-2xl font-bold mt-1">
                      {userStats.totalVoters > 0 
                        ? `1:${Math.round(userStats.totalVoters / Math.max(1, userStats.totalCandidates))}` 
                        : "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Candidates per voter
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
                    <div className="text-sm text-muted-foreground">Votes per Election</div>
                    <div className="text-2xl font-bold mt-1">
                      {electionStats.total > 0 
                        ? Math.round(userStats.totalVoters / electionStats.total)
                        : "0"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Average across all elections
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Election Participation Insights</CardTitle>
              <CardDescription>
                Key metrics about voter engagement and participation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
                    <div className="text-sm text-muted-foreground">Peak Turnout</div>
                    <div className="text-2xl font-bold mt-1">
                      {recentElections.length > 0 
                        ? Math.max(...recentElections.map(e => e.votes))
                        : "0"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Highest votes in a single election
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
                    <div className="text-sm text-muted-foreground">Average Turnout</div>
                    <div className="text-2xl font-bold mt-1">
                      {recentElections.length > 0 
                        ? Math.round(recentElections.reduce((sum, e) => sum + e.votes, 0) / recentElections.length)
                        : "0"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Avg. votes across recent elections
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
                    <div className="text-sm text-muted-foreground">Total Votes Cast</div>
                    <div className="text-2xl font-bold mt-1">
                      {userStats.totalVoters}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Across all elections
                    </div>
                  </div>
                </div>
                
                {/* Additional insight data could go here */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
