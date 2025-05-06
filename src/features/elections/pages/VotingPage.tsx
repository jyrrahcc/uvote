
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { toast } from "sonner";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { University } from "lucide-react";

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
        <div className="flex items-center justify-center mb-8">
          <University className="h-8 w-8 mr-2 text-[#008f50]" />
          <h1 className="text-2xl font-semibold">DLSU-D Election Access</h1>
        </div>
        
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <h2 className="text-xl font-medium text-center">Private Election</h2>
            <p className="text-center text-muted-foreground">This election requires an access code</p>
          </CardHeader>
          <CardContent>
            <AccessCodeInput 
              accessCode={election.accessCode} 
              onVerify={(verified) => {
                if (verified) {
                  setAccessCodeVerified(true);
                  setShowAccessCodeInput(false);
                  toast.success("Access code verified. You may now vote.");
                }
              }} 
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle Loading State
  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-[#008f50] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-xl">Loading election details...</p>
        <p className="text-sm text-muted-foreground mt-2">Please wait while we fetch the information</p>
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
      <div className="flex items-center mb-6">
        <University className="h-7 w-7 mr-2 text-[#008f50]" />
        <h1 className="text-2xl font-bold">{election.department || "University-wide"} Election</h1>
      </div>
      
      <ElectionHeader election={election} />
      
      {/* Election Status Alerts */}
      {election.status === 'completed' && (
        <ElectionStatusAlert election={election} status="completed" />
      )}
      
      {election.status === 'upcoming' && (
        <ElectionStatusAlert election={election} status="upcoming" />
      )}
      
      {/* Voter instructions */}
      {election.status === 'active' && !hasVoted && (
        <Alert className="mb-6 bg-[#008f50]/5 border-[#008f50]/20">
          <AlertTitle className="text-[#008f50]">DLSU-D Election Voting Instructions</AlertTitle>
          <AlertDescription>
            <p>Please review all candidates carefully before casting your vote. Once submitted, your vote cannot be changed.</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Select one candidate for each position</li>
              <li>You must be a registered DLSU-D student to vote</li>
              <li>Your vote is confidential and secure</li>
              <li>Results will be available after the election ends</li>
            </ul>
          </AlertDescription>
        </Alert>
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
      
      {/* Already voted message */}
      {election.status === 'active' && hasVoted && (
        <div className="text-center py-8 border rounded-md bg-green-50">
          <div className="text-2xl font-semibold text-green-700 mb-2">Thank you for voting!</div>
          <p className="text-green-600">Your vote has been recorded. Results will be available when the election closes.</p>
        </div>
      )}
    </div>
  );
};

export default VotingPage;
