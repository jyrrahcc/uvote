
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRole } from "@/features/auth/context/RoleContext";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useCandidates } from "../hooks/useCandidates";
import CandidatesPageHeader from "../components/CandidatesPageHeader";
import CandidatesTabView from "../components/CandidatesTabView";
import VoterEligibilityAlert from "@/features/elections/components/VoterEligibilityAlert";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";

const CandidatesPage = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const [activeTab, setActiveTab] = useState("candidates");
  const { isAdmin } = useRole();
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    candidates,
    election,
    loading,
    error,
    isDialogOpen,
    setIsDialogOpen,
    userHasRegistered,
    userHasApplied,
    isUserEligible,
    eligibilityReason,
    handleDeleteCandidate,
    handleCandidateAdded,
    handleApplicationSubmitted
  } = useCandidates(electionId, user?.id);

  useEffect(() => {
    if (error) {
      console.error("Error in CandidatesPage:", error);
    }
  }, [error]);

  const isElectionActiveOrUpcoming = () => {
    return election?.status === 'active' || election?.status === 'upcoming';
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error || !election) {
    return <ErrorState error={error} />;
  }

  // Show eligibility restriction message if not eligible and not admin
  if (!isUserEligible && !isAdmin && election?.restrictVoting) {
    return (
      <div className="space-y-6">
        <CandidatesPageHeader
          election={election}
          isAdmin={isAdmin}
          isDialogOpen={false}
          setIsDialogOpen={() => {}}
          electionId={electionId || ''}
          userId={user?.id}
          userHasRegistered={false}
          userHasApplied={false}
          isUserEligible={false}
          handleCandidateAdded={() => {}}
          isElectionActiveOrUpcoming={isElectionActiveOrUpcoming}
          handleApplicationSubmitted={() => {}}
        />
        
        <VoterEligibilityAlert 
          election={election}
          reason={eligibilityReason}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CandidatesPageHeader
        election={election}
        isAdmin={isAdmin}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        electionId={electionId || ''}
        userId={user?.id}
        userHasRegistered={userHasRegistered}
        userHasApplied={userHasApplied}
        isUserEligible={isUserEligible}
        handleCandidateAdded={handleCandidateAdded}
        isElectionActiveOrUpcoming={isElectionActiveOrUpcoming}
        handleApplicationSubmitted={handleApplicationSubmitted}
      />
      
      <CandidatesTabView
        isAdmin={isAdmin}
        candidates={candidates}
        loading={loading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        electionId={electionId || ''}
        handleDeleteCandidate={handleDeleteCandidate}
        onOpenAddDialog={() => setIsDialogOpen(true)}
      />
    </div>
  );
};

export default CandidatesPage;
