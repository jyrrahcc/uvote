
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, PieChart } from "lucide-react";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

/**
 * Admin analytics page showing election statistics
 */
const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [electionStats, setElectionStats] = useState({
    total: 0,
    active: 0,
    upcoming: 0,
    completed: 0
  });
  const [voterEngagement, setVoterEngagement] = useState([]);
  const [recentElections, setRecentElections] = useState([]);

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
      ];
      
      setVoterEngagement(pieData);
      
      // Get recent elections for bar chart
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
            votes: count || 0
          };
        })
      );
      
      setRecentElections(electionsWithVotes.reverse()); // Reverse for proper chart display
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading analytics data...</div>;
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Analytics & Reports</h1>
      
      {/* Elections Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Elections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{electionStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Elections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{electionStats.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Elections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{electionStats.upcoming}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed Elections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{electionStats.completed}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <BarChart className="mr-2 h-5 w-5 text-primary" />
              Votes by Recent Elections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={recentElections} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="votes" fill="#8884d8" name="Number of Votes" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <PieChart className="mr-2 h-5 w-5 text-primary" />
              Election Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
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
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
