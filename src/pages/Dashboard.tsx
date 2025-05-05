
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Election } from "@/types";

const Dashboard = () => {
  const { user } = useAuth();
  const { isAdmin, userRole } = useRole();
  const [activeElections, setActiveElections] = useState<number>(0);
  const [upcomingElections, setUpcomingElections] = useState<number>(0);
  const [completedElections, setCompletedElections] = useState<number>(0);
  const [myVotes, setMyVotes] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Count elections by status
        const { data: activeData } = await supabase
          .from('elections')
          .select('id', { count: 'exact' })
          .eq('status', 'active');
        
        const { data: upcomingData } = await supabase
          .from('elections')
          .select('id', { count: 'exact' })
          .eq('status', 'upcoming');
        
        const { data: completedData } = await supabase
          .from('elections')
          .select('id', { count: 'exact' })
          .eq('status', 'completed');

        // Count user's votes
        const { count: votesCount } = await supabase
          .from('votes')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id);

        setActiveElections(activeData?.length || 0);
        setUpcomingElections(upcomingData?.length || 0);
        setCompletedElections(completedData?.length || 0);
        setMyVotes(votesCount || 0);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Welcome, {user?.user_metadata?.first_name || 'User'}
      </h1>
      <p className="text-muted-foreground">
        You are logged in as a {userRole || 'user'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Active Elections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : activeElections}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Elections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : upcomingElections}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Elections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : completedElections}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              My Votes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : myVotes}
            </div>
          </CardContent>
        </Card>
      </div>

      {isAdmin && (
        <div className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Admin Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Election Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Create, edit, and manage elections. Monitor ongoing elections and view results.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Manage user accounts, assign roles, and monitor user activity.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
