
import { useState } from "react";
import { toast } from "sonner";
import { createCandidate } from "../services/candidateService";
import { CandidateFormData } from "../schemas/candidateFormSchema";
import { useRole } from "@/features/auth/context/RoleContext";
import { canRegisterAsCandidate } from "@/utils/admin/roleUtils";

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
      if (!canRegisterAsCandidate(isVoter)) {
        throw new Error("Profile verification required");
      }
      
      setLoading(true);
      
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
