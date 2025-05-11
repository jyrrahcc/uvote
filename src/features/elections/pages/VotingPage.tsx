
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import { Candidate, Election } from "@/types";
import { toast } from "sonner";

// Import custom components
import ElectionHeader from "../components/ElectionHeader";
import VotingForm from "../components/VotingForm";
import PrivateElectionAccess from "../components/voting/PrivateElectionAccess";
import ElectionLoading from "../components/voting/ElectionLoading";
import VoterAccessRestriction from "../components/voting/VoterAccessRestriction";
import VoterVerification from "../components/voting/VoterVerification";

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
          
          // Check eligibility
          if (election.restrictVoting) {
            await checkUserEligibility(election);
          } else {
            setIsEligible(true);
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
  }, [electionId, user]);
  
  const checkUserEligibility = async (election: Election) => {
    if (!user || !election) {
      setIsEligible(false);
      return;
    }
    
    try {
      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('department, year_level')
        .eq('id', user.id)
        .single();
        
      if (!profileData) {
        setIsEligible(false);
        return;
      }
      
      // If election has no restrictions, everyone is eligible
      if (!election.restrictVoting) {
        setIsEligible(true);
        return;
      }
      
      // Check department eligibility
      const isDepartmentEligible = election.departments?.length 
        ? election.departments.includes(profileData.department || '') ||
          election.departments.includes("University-wide")
        : true;
      
      // Check year level eligibility
      const isYearLevelEligible = election.eligibleYearLevels?.length
        ? election.eligibleYearLevels.includes(profileData.year_level || '') ||
          election.eligibleYearLevels.includes("All Year Levels")
        : true;
      
      // Admin users are always eligible
      if (isAdmin) {
        setIsEligible(true);
        return;
      }
      
      // User is eligible if they match both department and year level criteria
      setIsEligible(isDepartmentEligible && isYearLevelEligible);
      
      if (!isDepartmentEligible || !isYearLevelEligible) {
        console.log(`User not eligible. User department: ${profileData.department}, Election departments: ${election.departments?.join(', ')}`);
        console.log(`User year: ${profileData.year_level}, Election years: ${election.eligibleYearLevels?.join(', ')}`);
      }
      
    } catch (error) {
      console.error("Error checking eligibility:", error);
      setIsEligible(false);
    }
  };
  
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
  if (!isVoter) {
    // Pass false to prevent duplicate toast notifications
    // The toast will already be shown by RoleProtectedRoute
    return <VoterVerification isVoter={isVoter} showToast={false} />;
  }
  
  if (isEligible === false && !isAdmin) {
    return <VoterAccessRestriction election={election} />;
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
      <ElectionHeader election={election} />
      
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
