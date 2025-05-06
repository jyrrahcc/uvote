
import { CandidateApplication } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const fetchCandidateApplicationsForElection = async (electionId: string): Promise<CandidateApplication[]> => {
  const { data, error } = await supabase
    .from('candidate_applications')
    .select('*')
    .eq('election_id', electionId);
    
  if (error) {
    console.error("Error fetching applications:", error);
    throw error;
  }
  
  return data as CandidateApplication[];
};

export const fetchCandidateApplicationsByUser = async (): Promise<CandidateApplication[]> => {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user?.id) {
    throw new Error("User not authenticated");
  }
  
  const userId = session.session.user.id;
  const { data, error } = await supabase
    .from('candidate_applications')
    .select('*')
    .eq('user_id', userId);
    
  if (error) {
    console.error("Error fetching user applications:", error);
    throw error;
  }
  
  return data as CandidateApplication[];
};

export const hasUserAppliedForElection = async (electionId: string, userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('candidate_applications')
    .select('id')
    .eq('election_id', electionId)
    .eq('user_id', userId)
    .single();
    
  if (error && error.code !== 'PGRST116') {
    // PGRST116 is the error code for no rows returned
    console.error("Error checking if user applied:", error);
    throw error;
  }
  
  return !!data;
};

export const submitCandidateApplication = async (
  application: Omit<CandidateApplication, 'id' | 'created_at' | 'updated_at' | 'status'>
): Promise<CandidateApplication> => {
  const { data, error } = await supabase
    .from('candidate_applications')
    .insert({
      ...application,
      status: 'pending'
    })
    .select()
    .single();
    
  if (error) {
    console.error("Error submitting application:", error);
    throw error;
  }
  
  return data as CandidateApplication;
};

// New function to update application status
export const updateCandidateApplication = async (
  applicationId: string,
  updates: { status: "approved" | "rejected"; feedback?: string }
): Promise<void> => {
  const { error } = await supabase
    .from('candidate_applications')
    .update({
      status: updates.status,
      feedback: updates.feedback || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', applicationId);
    
  if (error) {
    console.error("Error updating application status:", error);
    throw error;
  }
};

// Add delete function for candidate applications
export const deleteCandidateApplication = async (applicationId: string): Promise<void> => {
  const { error } = await supabase
    .from('candidate_applications')
    .delete()
    .eq('id', applicationId);
    
  if (error) {
    console.error("Error deleting application:", error);
    throw error;
  }
};
