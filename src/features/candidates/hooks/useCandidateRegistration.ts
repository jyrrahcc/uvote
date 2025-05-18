
import { useState } from "react";
import { toast } from "sonner";
import { createCandidate } from "../services/candidateService";
import { CandidateFormData } from "../schemas/candidateFormSchema";
import { useRole } from "@/features/auth/context/RoleContext";
import { checkUserEligibility } from "@/utils/eligibilityUtils";
import { supabase } from "@/integrations/supabase/client";
import { DbElection, mapDbElectionToElection } from "@/types";

interface UseCandidateRegistrationProps {
  electionId: string;
  userId: string;
  onSuccess?: (candidate: any) => void;
}

export const useCandidateRegistration = ({ 
  electionId, 
  userId,
  onSuccess
}: UseCandidateRegistrationProps) => {
  const [loading, setLoading] = useState(false);
  const { isVoter } = useRole();
  
  const registerCandidate = async (formData: CandidateFormData) => {
    if (!electionId || !userId) {
      toast.error("Missing election or user information");
      return null;
    }

    try {
      // Check if user has voter role first
      if (!isVoter) {
        toast.error("You must be a verified voter to register as a candidate", {
          description: "Please verify your profile first"
        });
        throw new Error("Profile verification required");
      }
      
      setLoading(true);
      
      // Get election details for eligibility check
      const { data: electionData, error: electionError } = await supabase
        .from('elections')
        .select('*')
        .eq('id', electionId)
        .single();
        
      if (electionError) throw electionError;
      
      // Validate that status is the expected enum type
      const dbElection: DbElection = {
        ...electionData,
        status: (electionData.status as "upcoming" | "active" | "completed")
      };
      
      // Transform the raw election data to the typed Election interface
      const typedElection = mapDbElectionToElection(dbElection);
      
      // Check eligibility based on department and year level
      const eligibilityCheck = await checkUserEligibility(userId, typedElection);
      if (!eligibilityCheck.isEligible) {
        toast.error("You are not eligible to register as a candidate", {
          description: eligibilityCheck.reason || "You do not meet the department or year level requirements"
        });
        throw new Error("Not eligible for candidacy");
      }
      
      // Create the candidate with the provided data
      const candidateData = {
        ...formData,
        election_id: electionId,
        created_by: userId,
      };
      
      // Call the service function to create the candidate
      const newCandidate = await createCandidate(candidateData);
      
      toast.success("Successfully registered as a candidate");
      
      // Call the success callback if provided
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(newCandidate);
      }
      
      return newCandidate;
    } catch (error) {
      console.error("Error registering candidate:", error);
      if (!(error instanceof Error && error.message === "Profile verification required")) {
        toast.error("Failed to register as a candidate");
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    registerCandidate,
    loading,
    canRegister: isVoter
  };
};
