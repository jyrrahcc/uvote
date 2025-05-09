
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { CandidateFormData } from "../schemas/candidateFormSchema";

interface UseCandidateRegistrationProps {
  electionId: string;
  userId: string;
  onCandidateAdded: (candidate: any) => void;
  onClose: () => void;
}

export const useCandidateRegistration = ({
  electionId,
  userId,
  onCandidateAdded,
  onClose
}: UseCandidateRegistrationProps) => {
  const [loading, setLoading] = useState(false);
  
  const registerCandidate = async (values: CandidateFormData) => {
    try {
      setLoading(true);
      console.log("Registering candidate with data:", values);
      
      const newCandidate = {
        name: values.name,
        bio: values.bio,
        position: values.position,
        image_url: values.image_url || null,
        student_id: values.student_id || null,
        department: values.department || null,
        year_level: values.year_level || null,
        election_id: electionId,
        created_by: userId
      };
      
      const { data, error } = await supabase
        .from('candidates')
        .insert(newCandidate)
        .select();
      
      if (error) {
        console.error("Error registering candidate:", error);
        throw error;
      }
      
      console.log("Candidate registered successfully:", data);
      toast.success("Your candidate registration has been submitted successfully");
      
      onClose();
      
      if (data) {
        onCandidateAdded(data);
      }
      
      return true;
    } catch (error) {
      console.error("Error registering as candidate:", error);
      toast.error("Failed to register as candidate");
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    registerCandidate,
    loading
  };
};
