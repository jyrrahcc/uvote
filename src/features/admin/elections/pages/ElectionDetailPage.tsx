import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useElection } from "@/features/elections/hooks/useElection";
import { usePositionVotes } from "@/features/elections/hooks/usePositionVotes";
import { formatDateToLocalString } from "@/utils/dateUtils";
import { completeElection, resetElectionVotes } from "@/features/elections/services/electionService";
import { toast } from "sonner";

// Components
import ElectionErrorState from "@/features/elections/components/detail-page/ElectionErrorState";
import ElectionLoadingState from "@/features/elections/components/detail-page/ElectionLoadingState";
import ElectionTitleSection from "@/features/elections/components/detail-page/ElectionTitleSection";
import ElectionStatCards from "@/features/admin/elections/components/detail/ElectionStatCards";
import ElectionDetailTabs from "@/features/admin/elections/components/detail/ElectionDetailTabs";
import ElectionDetailHeader from "@/features/admin/elections/components/detail/ElectionDetailHeader";

const ElectionDetailPage = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  
  const { 
    election, 
    candidates, 
    loading, 
    error,
    refetch
  } = useElection(electionId || "");
  
  const { positionVotes } = usePositionVotes(election, candidates, electionId);
  
  useEffect(() => {
    // Check if we have an election ID from the URL
    if (!electionId) {
      navigate("/admin/elections");
    }
  }, [electionId, navigate]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return formatDateToLocalString(dateString);
  };
  
  if (loading) {
    return <ElectionLoadingState />;
  }
  
  if (error || !election) {
    return <ElectionErrorState error={error instanceof Error ? error.message : String(error)} />;
  }

  // Calculate stats based on positionVotes
  const calculateStats = () => {
    // Calculate total votes and participation rate
    let totalVotes = 0;
    
    Object.values(positionVotes).forEach(positionData => {
      if (positionData && positionData.totalVotes) {
        totalVotes += positionData.totalVotes;
      }
    });
    
    const totalEligibleVoters = election.totalEligibleVoters || 0;
    const participationRate = totalEligibleVoters > 0 
      ? Math.round((totalVotes / totalEligibleVoters) * 100) 
      : 0;
    
    return {
      totalVoters: totalEligibleVoters,
      totalVotes: totalVotes,
      participationRate: participationRate,
      positionsCount: election.positions?.length || 0,
      candidatesCount: candidates?.length || 0
    };
  };
  
  const stats = calculateStats();

  // Handle completion of election
  const handleCompleteElection = async () => {
    try {
      if (!electionId) return;
      
      await completeElection(electionId);
      toast.success("Election has been marked as completed");
      refetch(); // Refresh election data after completion
    } catch (error) {
      console.error("Error completing election:", error);
      toast.error("Failed to complete the election");
    }
  };

  // Handle reset of votes
  const handleResetVotes = async () => {
    try {
      if (!electionId) return;
      
      await resetElectionVotes(electionId);
      refetch(); // Refresh election data after votes reset
    } catch (error) {
      console.error("Error resetting votes:", error);
      toast.error("Failed to reset votes");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <ElectionDetailHeader 
        election={election}
        onBackClick={() => navigate("/admin/elections")}
        onCompleteElection={handleCompleteElection}
        onResetVotes={handleResetVotes}
      />
      
      {/* Rest of the components */}
      <ElectionTitleSection 
        title={election.title}
        description={election.description || ""}
      />
      
      <ElectionStatCards 
        election={election}
        positionVotes={positionVotes}
        formatDate={formatDate}
        stats={stats}
      />
      
      <ElectionDetailTabs 
        election={election}
        candidates={candidates || []}
        positionVotes={positionVotes}
        activeTab={activeTab}
        setActiveTab={activeTab}
        stats={stats}
        votes={[]} // This would need to be populated if needed for vote details
      />
    </div>
  );
};

export default ElectionDetailPage;
