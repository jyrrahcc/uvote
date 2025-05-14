
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { Election, mapDbElectionToElection } from "@/types";
import { Separator } from "@/components/ui/separator";

import ElectionDetailHeader from "../components/detail/ElectionDetailHeader";
import ElectionStatCards from "../components/detail/ElectionStatCards";
import ElectionDetailTabs from "../components/detail/ElectionDetailTabs";
import { SkeletonCard } from "@/components/ui/skeleton";

const ElectionDetailPage = () => {
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
        
        <div className="h-[400px] rounded-md border animate-pulse bg-muted/20 mt-4" />
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

  return (
    <div className="container mx-auto py-12 px-4 space-y-8">
      {/* Header */}
      <ElectionDetailHeader 
        election={election} 
        navigate={navigate} 
        onCompleteElection={handleCompleteElection} 
        onResetVotes={handleResetVotes} 
      />

      <Separator />
      
      {/* Stats Cards */}
      <ElectionStatCards stats={stats} election={election} />
      
      {/* Tabs for different data views */}
      <ElectionDetailTabs 
        election={election} 
        candidates={candidates} 
        stats={stats} 
        votes={votes}
      />
    </div>
  );
};

export default ElectionDetailPage;
