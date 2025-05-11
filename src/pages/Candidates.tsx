import React from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import CandidatesList from "@/features/candidates/components/CandidatesList";
import LoadingState from "@/features/candidates/components/LoadingState";
import ErrorState from "@/features/candidates/components/ErrorState";
import ElectionDetailsHeader from "@/features/candidates/components/election-header/ElectionDetailsHeader";
import CandidateRegistrationDialog from "@/features/candidates/components/CandidateRegistrationDialog";
import EmptyCandidatesList from "@/features/candidates/components/EmptyCandidatesList";
import { useCandidates } from "@/features/candidates/hooks/useCandidates";

const Candidates = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const { isAdmin } = useRole();
  const { user } = useAuth();
  
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
    handleDeleteCandidate,
    handleCandidateAdded,
    handleApplicationSubmitted
  } = useCandidates(electionId, user?.id);

  const canRegisterAsCandidate = () => {
    return !isAdmin && user && !userHasRegistered && !userHasApplied && 
      election?.status === 'upcoming' && isUserEligible;
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error || !election) {
    return <ErrorState error={error} />;
  }

  // Determine if election is active or upcoming for candidate applications
  const isElectionActiveOrUpcoming = election?.status === 'active' || election?.status === 'upcoming';

  return (
    <div className="container mx-auto py-12 px-4">
      <ElectionDetailsHeader 
        election={election} 
        loading={loading} 
        userHasApplied={userHasApplied}
        isUserEligible={isUserEligible}
        onOpenDialog={() => setIsDialogOpen(true)} 
        onApplicationSubmitted={handleApplicationSubmitted}
      />

      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div className="flex-grow">
          {/* This div is just for spacing - keeping the header structure */}
        </div>
      </div>
      
      <CandidatesList
        candidates={candidates}
        loading={false}
        isAdmin={isAdmin}
        onDeleteCandidate={handleDeleteCandidate}
        onOpenAddDialog={() => setIsDialogOpen(true)}
      />

      {candidates.length === 0 && !loading && (
        <EmptyCandidatesList 
          canRegister={canRegisterAsCandidate()} 
          onRegister={() => setIsDialogOpen(true)}
        />
      )}

      {/* Single instance of candidate registration dialog */}
      <CandidateRegistrationDialog 
        isAdmin={isAdmin}
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        canRegister={canRegisterAsCandidate()}
        userHasRegistered={userHasRegistered}
        userHasApplied={userHasApplied}
        isUserEligible={isUserEligible}
        electionId={electionId || ''}
        userId={user?.id || ''}
        onCandidateAdded={handleCandidateAdded}
        onApplicationSubmitted={handleApplicationSubmitted}
      />
    </div>
  );
};

export default Candidates;
