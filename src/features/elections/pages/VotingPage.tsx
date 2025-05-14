
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import { Candidate, Election, mapDbElectionToElection } from "@/types";
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
        const election = mapDbElectionToElection(electionData);
        setElection(election);
        
        // Check if user has already voted
        if (user) {
          const { data: voteData, error: voteError } = await supabase
            .from('votes')
            .select('id')
            .eq('election_id', electionId)
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (voteError && voteError.code !== 'PGRST116') {
            console.error("Error checking if user has voted:", voteError);
          }
          
          if (voteData) {
            setHasVoted(true);
            // Get any candidate they voted for to display in UI
            const { data: voteCandidateData } = await supabase
              .from('vote_candidates')
              .select('candidate_id')
              .eq('vote_id', voteData.id)
              .not('candidate_id', 'is', null)
              .limit(1)
              .maybeSingle();
              
            if (voteCandidateData && voteCandidateData.candidate_id) {
              setSelectedCandidateId(voteCandidateData.candidate_id);
            }
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
        
        // Check eligibility if user is logged in
        if (user) {
          const eligibilityCheck = await checkUserEligibility(user.id, election);
          setIsEligible(eligibilityCheck.isEligible);
          setEligibilityReason(eligibilityCheck.reason);
        } else {
          // When no user, they're not eligible
          setIsEligible(false);
        }
      } catch (err: any) {
        console.error("Error fetching election data:", err);
        setError(err.message || "Failed to load election data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchElection();
  }, [electionId, user]);
  
  const handleAccessCodeValidation = (isValid: boolean) => {
    setIsAccessVerified(isValid);
  };
  
  const handleVoteCast = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    setHasVoted(true);
    
    // Navigate to results page after voting
    navigate(`/elections/${electionId}/results`);
    toast.success("Your vote has been cast successfully!");
  };
  
  if (loading) {
    return <ElectionLoading />;
  }
  
  if (!election) {
    return <div className="container mx-auto py-8 px-4">Election not found</div>;
  }
  
  // Check if user has the voter role
  if (!isVoter && !isAdmin) {
    return (
      <div className="container mx-auto py-8 px-4">
        <ElectionHeader 
          election={election} 
          hasVoted={hasVoted} 
          isVoter={false} 
        />
        <ElectionTitleSection title={election.title} description={election.description} />
        <ElectionBanner bannerUrls={election.banner_urls} title={election.title} />
        <VoterVerification isVoter={isVoter} showToast={false} />
      </div>
    );
  }
  
  // Check eligibility if election restricts voting
  if (isEligible === false && !isAdmin) {
    return (
      <VoterAccessRestriction 
        election={election} 
        reason={eligibilityReason}
      />
    );
  }
  
  // Check if election is private and requires access code
  if (election.isPrivate && !isAccessVerified) {
    return (
      <div className="container mx-auto py-8 px-4">
        <ElectionHeader 
          election={election} 
          hasVoted={hasVoted} 
          isVoter={isVoter} 
        />
        <ElectionTitleSection title={election.title} description={election.description} />
        <ElectionBanner bannerUrls={election.banner_urls} title={election.title} />
        <PrivateElectionAccess
          election={election}
          onVerify={handleAccessCodeValidation}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <ElectionHeader 
        election={election} 
        hasVoted={hasVoted} 
        isVoter={isVoter} 
        isEligible={isEligible || false}
      />
      
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
