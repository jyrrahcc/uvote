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

const VotingPage = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useRole();
  
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
        const election = mapDbElectionToElection.mapDbElectionToElection(electionData);
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
            throw voteError;
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
  }, [electionId, user]);
  
  useEffect(() => {
    const checkEligibility = async () => {
      if (!user || !election) return;
      
      try {
        // Get user profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        const userProfile = profileData || { department: '', year_level: '', is_verified: false };
        
        // Check if user is explicitly added to eligible_voters
        const { data: eligibleVotersData } = await supabase
          .from('eligible_voters')
          .select('*')
          .eq('election_id', electionId)
          .eq('user_id', user.id);
        
        const isExplicitlyEligible = eligibleVotersData && eligibleVotersData.length > 0;
        
        // If election has no restrictions or user is an admin, they are eligible
        if (!election.restrictVoting || isAdmin) {
          setIsEligible(true);
          return;
        }
        
        // If user is explicitly added to eligible_voters
        if (isExplicitlyEligible) {
          setIsEligible(true);
          return;
        }
        
        // Check department and year level eligibility
        const departmentMatch = election.departments?.includes(userProfile.department) || 
                               election.department === userProfile.department;
        const yearLevelMatch = election.eligibleYearLevels?.includes(userProfile.year_level);
        
        if (election.departments?.length && election.eligibleYearLevels?.length) {
          setIsEligible(departmentMatch && yearLevelMatch);
        } else if (election.departments?.length) {
          setIsEligible(departmentMatch);
        } else if (election.eligibleYearLevels?.length) {
          setIsEligible(yearLevelMatch);
        } else {
          setIsEligible(true); // Default to eligible if no specific restrictions
        }
      } catch (error) {
        console.error("Error checking eligibility:", error);
        setIsEligible(false); // Default to ineligible on error
      }
    };
    
    checkEligibility();
  }, [user, election, electionId, isAdmin]);
  
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
  
  if (isEligible === false) {
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
