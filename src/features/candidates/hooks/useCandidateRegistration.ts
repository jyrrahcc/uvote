
import { useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
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
  const { user } = useAuth();
  
  const registerCandidate = async (formData: CandidateFormData) => {
    if (!user) {
      toast.error("You must be logged in to register as a candidate");
      return null;
    }
    
    setLoading(true);
    
    try {
      const candidateData = {
        name: formData.name,
        position: formData.position,
        bio: formData.bio,
        imageUrl: formData.image_url,
        electionId: electionId,
        createdBy: userId,
        studentId: formData.student_id,
        department: formData.department,
        yearLevel: formData.year_level
      };
      
      const newCandidate = await createCandidate(candidateData);
      
      if (newCandidate) {
        toast.success("Your candidate profile has been created");
        
        if (onSuccess) {
          onSuccess(newCandidate);
        }
        
        return newCandidate;
      }
    } catch (error: any) {
      console.error("Error registering candidate:", error);
      toast.error(error.message || "Failed to register as candidate");
    } finally {
      setLoading(false);
    }
    
    return null;
  };
  
  return {
    registerCandidate,
    loading
  };
};
