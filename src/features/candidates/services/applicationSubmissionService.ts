import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { CandidateApplication, mapApplicationToDbApplication } from "@/types";

// Update the service to use proper property names in the DTO and mapping:
export const submitApplication = async (application: Omit<CandidateApplication, 'id'>) => {
  try {
    const applicationData = mapApplicationToDbApplication({
      ...application,
      id: uuidv4() // Generate new ID for the application
    });

    const { error } = await supabase
      .from('candidate_applications')
      .insert(applicationData);

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error submitting application:', error);
    return { success: false, error };
  }
};
