
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { toast } from "sonner";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { University, Lock } from "lucide-react";

// Import components and hooks
import { useElection } from "../hooks/useElection";
import ElectionHeader from "../components/ElectionHeader";
import AccessCodeInput from "../components/AccessCodeInput";
import ElectionStatusAlert from "../components/ElectionStatusAlert";
import VotingForm from "../components/VotingForm";
import { supabase } from "@/integrations/supabase/client";

/**
 * Voting page component displays election details and allows voting
 */
const VotingPage = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [showAccessCodeInput, setShowAccessCodeInput] = useState(false);
  const [canVoteInElection, setCanVoteInElection] = useState<boolean | null>(null);
  
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
  } = useElection(electionId);

  // Check if user is eligible to vote in this election
  useEffect(() => {
    const checkEligibility = async () => {
      if (!user || !election || !election.restrictVoting) {
        setCanVoteInElection(true);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('eligible_voters')
          .select('id')
          .eq('election_id', electionId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        setCanVoteInElection(!!data);
        
        if (!data) {
          toast.error("You are not eligible to vote in this election");
        }
      } catch (error) {
        console.error("Error checking voting eligibility:", error);
        toast.error("Failed to verify your voting eligibility");
      }
    };

    if (election && user && election.restrictVoting) {
      checkEligibility();
    }
  }, [electionId, user, election]);

  // Check if election is in candidacy period
  const isInCandidacyPeriod = () => {
    if (!election || !election.candidacyStartDate || !election.candidacyEndDate) {
      return false;
    }
    
    const now = new Date();
    const candidacyStart = new Date(election.candidacyStartDate);
    const candidacyEnd = new Date(election.candidacyEndDate);
    
    return now >= candidacyStart && now <= candidacyEnd;
  };

  // Handle the special case for private elections
  if (election?.isPrivate && !accessCodeVerified) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="flex items-center justify-center mb-8">
          <University className="h-8 w-8 mr-2 text-[#008f50]" />
          <h1 className="text-2xl font-semibold">DLSU-D Election Access</h1>
        </div>
        
        <Card className="max-w-md mx-auto">
          <CardHeader className="flex flex-row items-center gap-2">
            <Lock className="h-5 w-5 text-[#008f50]" />
            <div>
              <h2 className="text-xl font-medium">Private Election</h2>
              <p className="text-muted-foreground">This election requires an access code</p>
            </div>
          </CardHeader>
          <CardContent>
            <AccessCodeInput 
              accessCode={election.accessCode} 
              onVerify={(verified) => {
                if (verified) {
                  setAccessCodeVerified(true);
                  setShowAccessCodeInput(false);
                  toast.success("Access code verified. You may now view this election.");
                } else {
                  toast.error("Invalid access code. Please try again.");
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

  // Check if user is allowed to vote (if voting is restricted)
  if (election.restrictVoting && canVoteInElection === false) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="flex items-center mb-6">
          <University className="h-7 w-7 mr-2 text-[#008f50]" />
          <h1 className="text-2xl font-bold">{election.department || "University-wide"} Election</h1>
        </div>
        
        <ElectionHeader election={election} />
        
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertTitle className="text-red-700">Access Restricted</AlertTitle>
          <AlertDescription className="text-red-600">
            <p>You are not eligible to vote in this election. Please contact the election administrator if you believe this is an error.</p>
          </AlertDescription>
        </Alert>
      </div>
    );
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

      {/* Candidacy Period Alert */}
      {isInCandidacyPeriod() && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertTitle className="text-blue-800">Candidacy Period is Active</AlertTitle>
          <AlertDescription className="text-blue-700">
            <p>The candidacy period for this election is now open. Eligible DLSU-D community members may apply as candidates until {new Date(election.candidacyEndDate!).toLocaleString()}.</p>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Voter instructions */}
      {election.status === 'active' && !hasVoted && (
        <Alert className="mb-6 bg-[#008f50]/5 border-[#008f50]/20">
          <AlertTitle className="text-[#008f50]">DLSU-D Election Voting Instructions</AlertTitle>
          <AlertDescription>
            <p>Please review all candidates carefully before casting your vote. Once submitted, your vote cannot be changed.</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Select one candidate for each position</li>
              <li>You may choose to abstain for any position</li>
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
              setHasVoted(true);
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
