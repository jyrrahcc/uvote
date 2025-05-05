
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { toast } from "sonner";

// Import components and hooks
import { useElection } from "../hooks/useElection";
import ElectionHeader from "../components/ElectionHeader";
import AccessCodeInput from "../components/AccessCodeInput";
import ElectionStatusAlert from "../components/ElectionStatusAlert";
import VotingForm from "../components/VotingForm";

/**
 * Voting page component displays election details and allows voting
 */
const VotingPage = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [showAccessCodeInput, setShowAccessCodeInput] = useState(false);
  
  const {
    election,
    candidates,
    loading,
    hasVoted,
    selectedCandidate,
    setSelectedCandidate,
    setHasVoted,
    accessCodeVerified,
    setAccessCodeVerified
  } = useElection({ 
    electionId, 
    userId: user?.id 
  });

  // Handle the special case for private elections
  if (election?.isPrivate && !accessCodeVerified) {
    return (
      <div className="container mx-auto py-12 px-4">
        <AccessCodeInput 
          accessCode={election.accessCode} 
          onVerify={(verified) => {
            if (verified) {
              setAccessCodeVerified(true);
              setShowAccessCodeInput(false);
            }
          }} 
        />
      </div>
    );
  }

  // Handle Loading State
  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <p>Loading election details...</p>
      </div>
    );
  }

  if (!election) {
    toast.error("Election not found");
    navigate('/elections');
    return null;
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <ElectionHeader election={election} />
      
      {/* Election Status Alerts */}
      {election.status === 'completed' && (
        <ElectionStatusAlert election={election} status="completed" />
      )}
      
      {election.status === 'upcoming' && (
        <ElectionStatusAlert election={election} status="upcoming" />
      )}
      
      {/* Voting Section */}
      {election.status === 'active' && (
        <VotingForm 
          electionId={election.id}
          candidates={candidates}
          userId={user?.id || ''}
          hasVoted={hasVoted}
          selectedCandidateId={selectedCandidate}
          onSelect={(candidateId) => {
            if (!hasVoted) {
              setSelectedCandidate(candidateId);
            }
          }}
        />
      )}
    </div>
  );
};

export default VotingPage;
