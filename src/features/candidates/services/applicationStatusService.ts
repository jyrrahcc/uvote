
import { supabase } from "@/integrations/supabase/client";

/**
 * Update status and feedback for a candidate application (for admin use)
 */
export const updateCandidateApplication = async (
  applicationId: string, 
  updates: { 
    status: "approved" | "rejected" | "disqualified" | "pending";
    feedback?: string | null;
    reviewed_by?: string | null;
    reviewed_at?: string | null;
  }
): Promise<void> => {
  try {
    // Remove any fields that aren't in the database schema
    const validUpdates = {
      status: updates.status,
      feedback: updates.feedback,
      reviewed_by: updates.reviewed_by,
      reviewed_at: updates.reviewed_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('candidate_applications')
      .update(validUpdates)
      .eq('id', applicationId);
    
    if (error) throw error;
    
    // The database trigger will handle adding or removing the candidate
  } catch (error) {
    console.error("Error updating application:", error);
    throw error;
  }
};

/**
 * Delete a candidate application (for admin or user)
 */
export const deleteCandidateApplication = async (applicationId: string): Promise<boolean> => {
  try {
    // First, check if the application actually exists
    const { data: applicationExists, error: checkError } = await supabase
      .from('candidate_applications')
      .select('id, status')
      .eq('id', applicationId)
      .single();
    
    if (checkError) {
      console.error("Error checking if application exists:", checkError);
      return false;
    }
    
    if (!applicationExists) {
      console.error("Application not found with ID:", applicationId);
      return false;
    }
    
    // Delete the application
    const { error } = await supabase
      .from('candidate_applications')
      .delete()
      .eq('id', applicationId);
    
    if (error) {
      console.error("Database error when deleting application:", error);
      return false;
    }
    
    console.log("Application deleted successfully:", applicationId);
    return true;
  } catch (error) {
    console.error("Error deleting application:", error);
    return false;
  }
};
