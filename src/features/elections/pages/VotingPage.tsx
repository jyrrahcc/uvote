import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import { Candidate, Election } from "@/types";
import { toast } from "sonner";
import { checkUserEligibility } from "@/utils/eligibilityUtils";

// Import custom components
import ElectionHeader from "../components/position-details/ElectionHeader";
import VotingForm from "../components/VotingForm";
import PrivateElectionAccess from "../components/voting/PrivateElectionAccess";
import ElectionLoading from "../components/voting/ElectionLoading";
import VoterAccessRestriction from "../components/voting/VoterAccessRestriction";
import VoterVerification from "../components/voting/VoterVerification";
import ElectionTitleSection from "../components/detail-page/ElectionTitleSection";
import ElectionBanner from "../components/detail-page/ElectionBanner";

const VotingPage = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isVoter } = useRole();
  
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isAccessVerified, setIsAccessVerified] = useState(false);
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [eligibilityReason, setEligibilityReason] = useState<string | null>(null);
  
  useEffect(() => {
    if (!electionId) {
      setError("Election ID is missing");
      setLoading(false);
      return;
    }
    
    const fetchElection = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data: electionData, error: electionError } = await supabase
          .from('elections')
          .select('*')
          .eq('id', electionId)
          .single();
        
        if (electionError) {
          throw electionError;
        }
        
        if (!electionData) {
          setError("Election not found");
          return;
        }
        
        // Map the database election object to the app's Election type
        const { mapDbElectionToElection } = await import("@/types");
        const election = mapDbElectionToElection(electionData);
        setElection(election);
        
        // Check eligibility immediately after getting election data
        if (user) {
          const eligibilityCheck = await checkUserEligibility(user.id, election);
          console.log("Eligibility check result:", eligibilityCheck);
          setIsEligible(eligibilityCheck.isEligible);
          setEligibilityReason(eligibilityCheck.reason);
          
          // If not eligible, show toast notification
          if (!eligibilityCheck.isEligible && eligibilityCheck.reason && !isAdmin) {
            toast.error("Access restricted", {
              description: eligibilityCheck.reason
            });
          }
        }
        
        // Fetch candidates for the election
        const { data: candidatesData, error: candidatesError } = await supabase
          .from('candidates')
          .select('*')
          .eq('election_id', electionId);
        
        if (candidatesError) {
          throw candidatesError;
        }
        
        setCandidates(candidatesData || []);
        
        // Check if the user has already voted
        if (user) {
          const { data: voteData, error: voteError } = await supabase
            .from('votes')
            .select('*')
            .eq('election_id', electionId)
            .eq('user_id', user.id)
            .is('position', null) // Check for the marker record
            .single();
          
          if (voteError) {
            if (voteError.code !== 'PGRST116') { // Not found error code
              throw voteError;
            }
          }
          
          if (voteData) {
            setHasVoted(true);
            setSelectedCandidateId(voteData.candidate_id);
          }
        }
        
      } catch (err: any) {
        console.error("Error fetching election data:", err);
        setError(err.message || "Failed to load election data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchElection();
  }, [electionId, user, isAdmin]);
  
  const handleAccessCodeValidation = (isValid: boolean) => {
    setIsAccessVerified(isValid);
  };
  
  const handleVoteCast = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    setHasVoted(true);
    toast.success("Your vote has been cast successfully!");
  };
  
  if (loading) {
    return <ElectionLoading />;
  }
  
  if (!election) {
    return <div>Election not found</div>;
  }
  
  // Show verification required message if user is not a voter
  if (!isVoter && !isAdmin) {
    // Pass false to prevent duplicate toast notifications
    // The toast will already be shown by RoleProtectedRoute
    return <VoterVerification isVoter={isVoter} showToast={false} />;
  }
  
  // Check election eligibility - but only if election restricts voting
  if (election.restrictVoting && isEligible === false && !isAdmin) {
    return (
      <VoterAccessRestriction 
        election={election} 
        reason={eligibilityReason}
      />
    );
  }
  
  if (election.isPrivate && !isAccessVerified) {
    return (
      <PrivateElectionAccess
        election={election}
        onVerify={handleAccessCodeValidation}
      />
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <ElectionHeader election={election} hasVoted={hasVoted} isVoter={isVoter} />
      
      <ElectionTitleSection title={election.title} description={election.description} />
      
      <ElectionBanner bannerUrls={election.banner_urls} title={election.title} />
      
      {candidates && candidates.length > 0 ? (
        <VotingForm 
          electionId={electionId}
          candidates={candidates}
          userId={user?.id || ''}
          hasVoted={hasVoted}
          selectedCandidateId={selectedCandidateId}
          onSelect={handleVoteCast}
        />
      ) : (
        <div className="text-center py-8">
          <p className="text-lg text-muted-foreground">
            No candidates have been added to this election yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default VotingPage;
