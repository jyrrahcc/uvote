import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { toast } from "sonner";
import { University } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Import components and hooks
import { useElection } from "../hooks/useElection";
import ElectionHeader from "../components/ElectionHeader";
import VotingForm from "../components/VotingForm";
import PrivateElectionAccess from "../components/voting/PrivateElectionAccess";
import ElectionLoading from "../components/voting/ElectionLoading";
import VoterAccessRestriction from "../components/voting/VoterAccessRestriction";
import VotingInstructions from "../components/voting/VotingInstructions";
import VoteConfirmation from "../components/voting/VoteConfirmation";

/**
 * Voting page component displays election details and allows voting
 */
const VotingPage = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [canVoteInElection, setCanVoteInElection] = useState<boolean | null>(null);
  const [userHasVoted, setUserHasVoted] = useState(false);
  
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

  // Check if user has already voted
  useEffect(() => {
    const checkIfUserHasVoted = async () => {
      if (!user || !electionId) return;
      
      try {
        const { data, error } = await supabase
          .from('votes')
          .select('id')
          .eq('election_id', electionId)
          .eq('user_id', user.id)
          .is('position', null) // Look for the marker record
          .maybeSingle();
          
        if (error) throw error;
        
        const hasAlreadyVoted = !!data;
        console.log("User has already voted:", hasAlreadyVoted);
        setUserHasVoted(hasAlreadyVoted);
        setHasVoted(hasAlreadyVoted);
      } catch (error) {
        console.error("Error checking if user has voted:", error);
      }
    };
    
    checkIfUserHasVoted();
  }, [user, electionId, setHasVoted]);

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
      <PrivateElectionAccess
        election={election}
        onVerify={(verified) => setAccessCodeVerified(verified)}
      />
    );
  }

  // Handle Loading State
  if (loading) {
    return <ElectionLoading />;
  }

  if (!election) {
    toast.error("Election not found");
    navigate('/elections');
    return null;
  }

  // Check if user is allowed to vote (if voting is restricted)
  if (election.restrictVoting && canVoteInElection === false) {
    return <VoterAccessRestriction election={election} />;
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex items-center mb-6">
        <University className="h-7 w-7 mr-2 text-[#008f50]" />
        <h1 className="text-2xl font-bold">{election.department || "University-wide"} Election</h1>
      </div>
      
      <ElectionHeader election={election} />
      
      <VotingInstructions 
        election={election} 
        isInCandidacyPeriod={isInCandidacyPeriod()} 
        userHasVoted={userHasVoted} 
      />
      
      {/* Voting Section */}
      {election.status === 'active' && (
        <VotingForm 
          electionId={election.id}
          candidates={candidates}
          userId={user?.id || ''}
          hasVoted={userHasVoted}
          selectedCandidateId={selectedCandidate}
          onSelect={(candidateId) => {
            if (!userHasVoted) {
              console.log("Setting selected candidate:", candidateId);
              setSelectedCandidate(candidateId);
              setHasVoted(true);
              setUserHasVoted(true);
            }
          }}
        />
      )}
      
      {/* Already voted message */}
      {election.status === 'active' && userHasVoted && <VoteConfirmation />}
    </div>
  );
};

export default VotingPage;
