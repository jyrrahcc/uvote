
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useElection } from "@/features/elections/hooks/useElection";
import { usePositionVotes } from "@/features/elections/hooks/usePositionVotes";
import { formatDateToLocalString } from "@/utils/dateUtils";

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
    error
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
    return <ElectionErrorState error={error} />;
  }

  // Calculate stats
  const stats = {
    totalVoters: election.totalEligibleVoters || 0,
    totalVotes: 0, // Would need to calculate from positionVotes
    participationRate: 0, // Would need to calculate
    positionsCount: election.positions?.length || 0,
    candidatesCount: candidates?.length || 0
  };

  // Handle completion of election
  const handleCompleteElection = async () => {
    console.log("Election completed");
    // Implementation would go here
  };

  // Handle reset of votes
  const handleResetVotes = async () => {
    console.log("Votes reset");
    // Implementation would go here
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <ElectionDetailHeader 
        election={election}
        onBackClick={() => navigate("/admin/elections")}
        onCompleteElection={handleCompleteElection}
        onResetVotes={handleResetVotes}
      />
      
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
        setActiveTab={setActiveTab}
        stats={stats}
      />
    </div>
  );
};

export default ElectionDetailPage;
