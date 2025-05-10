
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Election, Candidate, mapDbElectionToElection, mapDbCandidateToCandidate } from "@/types";

export const useCandidates = (electionId: string | undefined, userId: string | undefined) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userHasRegistered, setUserHasRegistered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (electionId) {
      loadData();
    }
  }, [electionId]);

  const loadData = async () => {
    if (!electionId) {
      navigate('/elections');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch election details
      const { data: electionData, error: electionError } = await supabase
        .from('elections')
        .select('*')
        .eq('id', electionId)
        .single();
      
      if (electionError) {
        throw new Error("Failed to load election details");
      }
      
      if (!electionData) {
        throw new Error("Election not found");
      }
      
      const transformedElection = mapDbElectionToElection(electionData);
      setElection(transformedElection);
      
      // Fetch candidates
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select('*')
        .eq('election_id', electionId);
      
      if (candidatesError) {
        throw new Error("Failed to load candidates");
      }
      
      // Map database candidates to our Candidate type
      const transformedCandidates = candidatesData.map(mapDbCandidateToCandidate);
      setCandidates(transformedCandidates);

      // Check if current user has already registered as a candidate
      if (userId) {
        const { data, error: checkError } = await supabase
          .from('candidates')
          .select('id')
          .eq('election_id', electionId)
          .eq('created_by', userId)
          .maybeSingle();
        
        if (!checkError || checkError.code !== 'PGRST116') {
          setUserHasRegistered(!!data);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
      toast.error("Failed to load election data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Candidate deleted successfully");
      // Update local state
      setCandidates(candidates.filter(candidate => candidate.id !== id));
    } catch (error) {
      console.error("Error deleting candidate:", error);
      toast.error("Failed to delete candidate");
    }
  };

  const handleCandidateAdded = (newCandidateData: any) => {
    console.log("Candidate added:", newCandidateData);
    
    // Make sure to transform the new candidate data to match our Candidate type
    let newCandidate: Candidate[] = [];
    
    if (Array.isArray(newCandidateData)) {
      newCandidate = newCandidateData.map(mapDbCandidateToCandidate);
    } else {
      newCandidate = [mapDbCandidateToCandidate(newCandidateData)];
    }
    
    setCandidates(prev => [...prev, ...newCandidate]);
    
    setUserHasRegistered(true);
    setIsDialogOpen(false);
  };

  return {
    candidates,
    election,
    loading,
    error,
    isDialogOpen,
    setIsDialogOpen,
    userHasRegistered,
    handleDeleteCandidate,
    handleCandidateAdded
  };
};
