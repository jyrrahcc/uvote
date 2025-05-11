
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Candidate, Election } from "@/types";
import { fetchElectionDetails } from "@/features/elections/services/electionService";
import { fetchCandidatesForElection, deleteCandidate } from "../services/candidateService";
import { hasUserAppliedForElection } from "../services/candidateApplicationService";
import { checkUserEligibility } from "@/utils/eligibilityUtils";

export const useCandidates = (electionId?: string, userId?: string) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userHasRegistered, setUserHasRegistered] = useState(false);
  const [userHasApplied, setUserHasApplied] = useState(false);
  const [isUserEligible, setIsUserEligible] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    if (electionId) {
      fetchData();
    }
  }, [electionId, userId]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch election details
      const electionData = await fetchElectionDetails(electionId!);
      setElection(electionData);
      
      // Fetch candidates
      const candidatesData = await fetchCandidatesForElection(electionId!);
      setCandidates(candidatesData);
      
      // Check if user has already registered as a candidate
      if (userId) {
        const { data } = await supabase
          .from('candidates')
          .select('id')
          .eq('election_id', electionId)
          .eq('created_by', userId)
          .maybeSingle();
        
        setUserHasRegistered(!!data);
        
        // Check if user has already applied to be a candidate
        const hasApplied = await hasUserAppliedForElection(electionId!, userId);
        setUserHasApplied(hasApplied);
        
        // Use centralized eligibility checker
        const eligibilityResult = await checkUserEligibility(userId, electionData);
        setIsUserEligible(eligibilityResult.isEligible);
        
        if (!eligibilityResult.isEligible && eligibilityResult.reason) {
          console.log("User is not eligible:", eligibilityResult.reason);
        }
      }
      
      setError(null);
    } catch (err: any) {
      console.error("Error fetching candidates data:", err);
      setError(err.message || "Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    try {
      await deleteCandidate(candidateId);
      setCandidates(prev => prev.filter(c => c.id !== candidateId));
      toast.success("Candidate deleted successfully");
    } catch (error) {
      console.error("Error deleting candidate:", error);
      toast.error("Failed to delete candidate");
    }
  };

  const handleCandidateAdded = (newCandidate: any) => {
    setCandidates(prev => [...prev, newCandidate]);
    setIsDialogOpen(false);
    if (!user?.id) return;
    setUserHasRegistered(true);
    toast.success("Successfully added candidate");
  };
  
  const handleApplicationSubmitted = () => {
    setUserHasApplied(true);
    setIsDialogOpen(false);
    toast.success("Your application has been submitted");
  };

  return {
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
  };
};
