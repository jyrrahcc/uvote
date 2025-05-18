
import { useParams } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import { useElection } from "@/features/elections/hooks/useElection";
import { usePositionVotes } from "@/features/elections/hooks/usePositionVotes";
import { checkUserEligibility } from "@/utils/eligibilityUtils";
import { useState, useEffect } from "react";

// Components
import ElectionLoadingState from "../components/detail-page/ElectionLoadingState";
import ElectionErrorState from "../components/detail-page/ElectionErrorState";
import ElectionHeader from "../components/position-details/ElectionHeader";
import ElectionTitleSection from "../components/detail-page/ElectionTitleSection";
import ElectionStatusAlert from "../components/ElectionStatusAlert";
import ElectionBanner from "../components/detail-page/ElectionBanner";
import ElectionMetadata from "../components/position-details/ElectionMetadata";
import ElectionTabsView from "../components/detail-page/ElectionTabsView";
import VoterEligibilityAlert from "../components/VoterEligibilityAlert";

/**
 * Election Detail Page - Displays full information about a specific election
 */
const ElectionDetailPage = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const { user } = useAuth();
  const { isVoter } = useRole();
  const {
    election,
    loading,
    error,
    candidates,
    hasVoted,
    votingStats,
    accessCodeVerified,
    setAccessCodeVerified
  } = useElection(electionId);
  
  const { positionVotes } = usePositionVotes(election, candidates, electionId);
  const [isEligible, setIsEligible] = useState<boolean>(true);
  const [eligibilityReason, setEligibilityReason] = useState<string | null>(null);
  const [eligibilityChecked, setEligibilityChecked] = useState<boolean>(false);

  // Check if the user is eligible to participate in this election
  useEffect(() => {
    const checkEligibility = async () => {
      if (!user || !election || eligibilityChecked) {
        return;
      }
      
      try {
        const { isEligible, reason } = await checkUserEligibility(user.id, election);
        setIsEligible(isEligible);
        setEligibilityReason(reason);
        setEligibilityChecked(true);
      } catch (error) {
        console.error("Error checking eligibility:", error);
        setIsEligible(false);
        setEligibilityReason("Could not verify your eligibility");
        setEligibilityChecked(true);
      }
    };
    
    checkEligibility();
  }, [user, election, eligibilityChecked]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // If loading, display loading state
  if (loading) {
    return <ElectionLoadingState />;
  }

  // If error, display error state
  if (error || !election) {
    return <ElectionErrorState error={error ? error.toString() : "Unknown error"} />;
  }

  // Render election details
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header with back button and action buttons */}
      <ElectionHeader 
        election={election} 
        hasVoted={hasVoted} 
        isVoter={isVoter}
        isEligible={isEligible}
      />
      
      {/* Election title and description */}
      <ElectionTitleSection 
        title={election.title} 
        description={election.description} 
      />
      
      {/* Status alerts for non-active elections */}
      {election.status !== "active" && (
        <ElectionStatusAlert election={election} status={election.status} />
      )}

      {/* Eligibility alert when user is not eligible */}
      {!isEligible && user && election.restrictVoting && (
        <VoterEligibilityAlert 
          election={election} 
          reason={eligibilityReason}
        />
      )}
      
      {/* Election banner carousel if available */}
      <ElectionBanner bannerUrls={election.bannerUrls} title={election.title} />
      
      {/* Election metadata */}
      <ElectionMetadata election={election} formatDate={(date) => new Date(date).toLocaleDateString()} />
      
      {/* Tabs for Overview and Candidates */}
      <ElectionTabsView
        election={election}
        candidates={candidates}
        positionVotes={positionVotes}
        formatDate={(date) => new Date(date).toLocaleDateString()}
        isUserEligible={isEligible}
      />
    </div>
  );
};

export default ElectionDetailPage;
