
import { useState } from "react";
import { toast } from "sonner";
import { createCandidate } from "../services/candidateService";
import { CandidateFormData } from "../schemas/candidateFormSchema";

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
  
  const registerCandidate = async (formData: CandidateFormData) => {
    try {
      setLoading(true);
      
      // Create the candidate with the provided data
      const candidateData = {
        ...formData,
        election_id: electionId,
        created_by: userId,
      };
      
      const newCandidate = await createCandidate(candidateData);
      
      toast.success("Successfully registered as a candidate");
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess(newCandidate);
      }
      
      return newCandidate;
    } catch (error) {
      console.error("Error registering candidate:", error);
      toast.error("Failed to register as a candidate");
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    registerCandidate,
    loading
  };
};
