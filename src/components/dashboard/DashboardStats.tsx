
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import StatsCard from "./StatsCard";

const DashboardStats = () => {
  const { user } = useAuth();
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard 
        title="Active Elections" 
        value={activeElections} 
        loading={loading} 
      />
      <StatsCard 
        title="Upcoming Elections" 
        value={upcomingElections} 
        loading={loading} 
      />
      <StatsCard 
        title="Completed Elections" 
        value={completedElections} 
        loading={loading} 
      />
      <StatsCard 
        title="My Votes" 
        value={myVotes} 
        loading={loading} 
      />
    </div>
  );
};

export default DashboardStats;
