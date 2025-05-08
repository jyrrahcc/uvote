
import { useState, useEffect } from 'react';
import StatsCard from './StatsCard';
import { supabase } from '@/integrations/supabase/client';
import { Vote, LineVertical, BarChart, Award } from 'lucide-react';

const DashboardStats = () => {
  const [stats, setStats] = useState({
    activeElections: 0,
    totalVotes: 0,
    totalElections: 0,
    completedElections: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Active elections
        const { count: activeCount, error: activeError } = await supabase
          .from('elections')
          .select('*', { count: 'exact' })
          .eq('status', 'active');

        // Total elections
        const { count: totalCount, error: totalError } = await supabase
          .from('elections')
          .select('*', { count: 'exact' });

        // Completed elections
        const { count: completedCount, error: completedError } = await supabase
          .from('elections')
          .select('*', { count: 'exact' })
          .eq('status', 'completed');

        // Total votes cast
        const { count: votesCount, error: votesError } = await supabase
          .from('votes')
          .select('*', { count: 'exact' });

        setStats({
          activeElections: activeCount || 0,
          totalElections: totalCount || 0,
          completedElections: completedCount || 0,
          totalVotes: votesCount || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard 
        title="Active Elections"
        value={stats.activeElections}
        iconComponent={<Vote className="h-5 w-5" />}
        loading={loading}
        description="Elections currently in progress"
        color="bg-blue-500"
      />
      <StatsCard 
        title="Total Votes"
        value={stats.totalVotes}
        iconComponent={<LineVertical className="h-5 w-5" />}
        loading={loading}
        description="Total votes cast across all elections"
        color="bg-green-500"
      />
      <StatsCard 
        title="All Elections"
        value={stats.totalElections}
        iconComponent={<BarChart className="h-5 w-5" />}
        loading={loading}
        description="Total number of elections"
        color="bg-purple-500"
      />
      <StatsCard 
        title="Completed Elections"
        value={stats.completedElections}
        iconComponent={<Award className="h-5 w-5" />}
        loading={loading}
        description="Elections that have concluded"
        color="bg-amber-500"
      />
    </div>
  );
};

export default DashboardStats;
