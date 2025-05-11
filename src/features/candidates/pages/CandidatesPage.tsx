
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRole } from "@/features/auth/context/RoleContext";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useCandidates } from "../hooks/useCandidates";
import CandidatesPageHeader from "../components/CandidatesPageHeader";
import CandidatesTabView from "../components/CandidatesTabView";

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
    isDialogOpen,
    setIsDialogOpen,
    userHasRegistered,
    userHasApplied,
    isUserEligible,
    handleDeleteCandidate,
    handleCandidateAdded,
    handleApplicationSubmitted
  } = useCandidates(electionId, user?.id);

  const isElectionActiveOrUpcoming = () => {
    return election?.status === 'active' || election?.status === 'upcoming';
  };

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
