
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Candidate, mapDbCandidateToCandidate } from "@/types";
import { DLSU_DEPARTMENTS, YEAR_LEVELS } from "./candidate-manager/constants";
import { DEFAULT_POSITIONS } from "@/features/elections/types/electionFormTypes";
import CandidatesList from "./candidate-manager/CandidatesList";
import CandidateManagerHeader from "./candidate-manager/CandidateManagerHeader";
import CandidacyMessage from "./candidate-manager/CandidacyMessage";
import ImagePreviewModal from "./candidate-manager/ImagePreviewModal";

export interface CandidateManagerProps {
  electionId: string | null;
  isNewElection: boolean;
  candidacyStartDate?: string;
  candidacyEndDate?: string;
  isAdmin?: boolean;
  positions?: string[];
}

const CandidateManager = forwardRef<any, CandidateManagerProps>(({ 
  electionId, 
  isNewElection, 
  candidacyStartDate, 
  candidacyEndDate,
  isAdmin = false,
  positions = []
}: CandidateManagerProps, ref) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [availablePositions, setAvailablePositions] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Initialize positions
  useEffect(() => {
    if (positions && positions.length > 0) {
      setAvailablePositions(positions);
    } else {
      // If no positions provided, use defaults
      setAvailablePositions(DEFAULT_POSITIONS);
    }
  }, [positions]);

  // Fetch candidates if editing an existing election
  useEffect(() => {
    if (electionId && !isNewElection) {
      fetchCandidates();
    }
  }, [electionId, isNewElection]);

  const fetchCandidates = async () => {
    if (!electionId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('election_id', electionId);
      
      if (error) throw error;

      if (data) {
        const processedCandidates = data.map(candidate => mapDbCandidateToCandidate(candidate));
        setCandidates(processedCandidates);
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  // Check if current date is within candidacy period
  const isInCandidacyPeriod = () => {
    // If it's a new election or the user is an admin, always allow adding candidates
    if (isNewElection || isAdmin) return true;
    
    // For non-admin users, check if within candidacy period
    if (!candidacyStartDate || !candidacyEndDate) return false;
    
    const now = new Date();
    const startDate = new Date(candidacyStartDate);
    const endDate = new Date(candidacyEndDate);
    
    return now >= startDate && now <= endDate;
  };

  // Add a new blank candidate to the list
  const addCandidate = () => {
    // Check if in candidacy period for existing elections (only for non-admin users)
    if (!isAdmin && !isNewElection && !isInCandidacyPeriod()) {
      toast.error("Candidates can only be added during the candidacy period");
      return;
    }

    setCandidates(prev => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        name: "",
        bio: "",
        position: "",
        image_url: "",
        election_id: electionId || ""
      }
    ]);
  };

  // Remove a candidate from the list
  const removeCandidate = (index: number) => {
    setCandidates((prev) => prev.filter((_, i) => i !== index));
  };

  // Update a candidate field
  const updateCandidate = (index: number, field: keyof Candidate, value: string) => {
    setCandidates((prev) => 
      prev.map((c, i) => 
        i === index 
          ? { ...c, [field]: value } 
          : c
      )
    );
  };

  // Preview image
  const handlePreviewImage = (url: string) => {
    setPreviewImage(url);
    setShowPreview(true);
  };

  // This is the critical part - expose the method to parent component
  // Make sure we're not creating circular references
  useImperativeHandle(ref, () => ({
    getCandidatesForNewElection: () => {
      // Return a new array with only the necessary properties
      return candidates
        .filter(candidate => candidate.name && candidate.position) // Only include candidates with at least name and position
        .map(c => ({
          name: c.name,
          bio: c.bio || "",
          position: c.position,
          image_url: c.image_url || "",
          student_id: c.student_id || "",
          department: c.department || "",
          year_level: c.year_level || "",
          // Don't include the election_id here, it will be added by the parent component
        }));
    }
  }));

  if (loading) {
    return <div className="flex justify-center p-4">Loading candidates...</div>;
  }

  const canAddCandidates = isNewElection || isAdmin || isInCandidacyPeriod();

  return (
    <div className="space-y-4">
      <CandidateManagerHeader 
        onAddCandidate={addCandidate}
        showAddButton={canAddCandidates}
      />
      
      <CandidacyMessage
        candidacyStartDate={candidacyStartDate}
        candidacyEndDate={candidacyEndDate}
        isAdmin={isAdmin}
        isNewElection={isNewElection}
        isInCandidacyPeriod={isInCandidacyPeriod()}
      />
      
      <CandidatesList
        candidates={candidates}
        positions={availablePositions}
        onAddCandidate={addCandidate}
        onRemoveCandidate={removeCandidate}
        onUpdateCandidate={updateCandidate}
        onPreviewImage={handlePreviewImage}
      />
      
      <ImagePreviewModal 
        imageUrl={showPreview ? previewImage : null}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
});

CandidateManager.displayName = "CandidateManager";

export default CandidateManager;
