
import { supabase } from "@/integrations/supabase/client";
import { CandidateApplication, mapDbCandidateApplicationToCandidateApplication } from "@/types";
import { Election } from "@/types";
import { checkUserEligibility } from "@/utils/eligibilityUtils";

export const hasUserAppliedForElection = async (electionId: string, userId: string): Promise<boolean> => {
  try {
    const { data } = await supabase
      .from('candidate_applications')
      .select('id')
      .eq('election_id', electionId)
      .eq('user_id', userId);
      
    return data !== null && data.length > 0;
  } catch (error) {
    console.error("Error checking if user has applied:", error);
    return false;
  }
};

export const fetchUserApplications = async (userId: string): Promise<CandidateApplication[]> => {
  try {
    const { data, error } = await supabase
      .from('candidate_applications')
      .select('*, elections(title, candidacy_start_date, candidacy_end_date, status)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data?.map(item => mapDbCandidateApplicationToCandidateApplication(item)) || [];
  } catch (error) {
    console.error("Error fetching user applications:", error);
    throw error;
  }
};

export const checkUserEligibilityForElection = async (userId: string, election: Election): Promise<boolean> => {
  try {
    // Use the centralized eligibility checker
    const { isEligible } = await checkUserEligibility(userId, election);
    return isEligible;
  } catch (error) {
    console.error("Error checking user eligibility:", error);
    return false;
  }
};

// Add the missing functions below

export const fetchCandidateApplicationsForElection = async (electionId: string): Promise<CandidateApplication[]> => {
  try {
    const { data, error } = await supabase
      .from('candidate_applications')
      .select('*')
      .eq('election_id', electionId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data?.map(item => mapDbCandidateApplicationToCandidateApplication(item)) || [];
  } catch (error) {
    console.error("Error fetching applications for election:", error);
    throw error;
  }
};

export const fetchCandidateApplicationsByUser = async (): Promise<CandidateApplication[]> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) throw sessionError;
    if (!sessionData.session?.user?.id) {
      throw new Error("User not authenticated");
    }
    
    const userId = sessionData.session.user.id;
    
    const { data, error } = await supabase
      .from('candidate_applications')
      .select('*, elections(title, candidacy_start_date, candidacy_end_date, status)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data?.map(item => mapDbCandidateApplicationToCandidateApplication(item)) || [];
  } catch (error) {
    console.error("Error fetching user applications:", error);
    throw error;
  }
};

export const updateCandidateApplication = async (
  applicationId: string, 
  updates: { status: "approved" | "rejected"; feedback?: string | null }
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('candidate_applications')
      .update({
        status: updates.status,
        feedback: updates.feedback,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error updating application:", error);
    throw error;
  }
};

export const deleteCandidateApplication = async (applicationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('candidate_applications')
      .delete()
      .eq('id', applicationId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error deleting application:", error);
    throw error;
  }
};
