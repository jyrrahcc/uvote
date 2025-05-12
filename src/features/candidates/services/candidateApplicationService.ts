
import { supabase } from "@/integrations/supabase/client";
import { CandidateApplication, mapDbCandidateApplicationToCandidateApplication } from "@/types";
import { Election, mapDbElectionToElection } from "@/types";
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

export const fetchUserApplications = async (userId?: string): Promise<CandidateApplication[]> => {
  try {
    // If userId is provided, use it; otherwise, get the current user's ID from the session
    let userIdToUse = userId;
    
    if (!userIdToUse) {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      if (!sessionData.session?.user?.id) {
        throw new Error("User not authenticated");
      }
      
      userIdToUse = sessionData.session.user.id;
    }
    
    const { data, error } = await supabase
      .from('candidate_applications')
      .select('*, elections(title, candidacy_start_date, candidacy_end_date, status)')
      .eq('user_id', userIdToUse)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data?.map(item => mapDbCandidateApplicationToCandidateApplication(item)) || [];
  } catch (error) {
    console.error("Error fetching user applications:", error);
    throw error;
  }
};

export const checkUserEligibilityForElection = async (userId: string, election: Election): Promise<{isEligible: boolean; reason: string | null}> => {
  try {
    // Use the centralized eligibility checker
    return await checkUserEligibility(userId, election);
  } catch (error) {
    console.error("Error checking user eligibility:", error);
    return { isEligible: false, reason: "Error checking eligibility" };
  }
};

export const fetchCandidateApplicationsForElection = async (electionId: string): Promise<CandidateApplication[]> => {
  try {
    // Instead of using the profile reference directly, fetch the applications and user data separately
    const { data, error } = await supabase
      .from('candidate_applications')
      .select('*')
      .eq('election_id', electionId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // For each application, fetch the related user profile data
    const applicationsWithProfiles = await Promise.all(
      data.map(async (application) => {
        // Get the user profile information
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, department, year_level, student_id')
          .eq('id', application.user_id)
          .single();
        
        if (profileError) {
          console.warn("Error fetching profile for user:", application.user_id, profileError);
          // Return the application without profile data
          return mapDbCandidateApplicationToCandidateApplication(application);
        }
        
        // Merge the application data with profile data
        const enrichedApplication = {
          ...application,
          profiles: profileData
        };
        
        return mapDbCandidateApplicationToCandidateApplication(enrichedApplication);
      })
    );
    
    return applicationsWithProfiles;
  } catch (error) {
    console.error("Error fetching applications for election:", error);
    throw error;
  }
};

export const fetchCandidateApplicationsByUser = async (): Promise<CandidateApplication[]> => {
  // This is now redundant with fetchUserApplications, but we'll keep it for backward compatibility
  return fetchUserApplications();
};

export const updateCandidateApplication = async (
  applicationId: string, 
  updates: { 
    status: "approved" | "rejected" | "disqualified";
    feedback?: string | null;
    reviewed_by?: string | null;
    reviewed_at?: string | null;
  }
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('candidate_applications')
      .update({
        status: updates.status,
        feedback: updates.feedback,
        reviewed_by: updates.reviewed_by,
        reviewed_at: updates.reviewed_at,
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
    
    if (error) {
      console.error("Database error when deleting application:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error deleting application:", error);
    throw error;
  }
};

export const submitCandidateApplication = async (applicationData: Omit<CandidateApplication, 'id'>): Promise<CandidateApplication> => {
  try {
    // Check eligibility first
    const { data: electionData, error: electionError } = await supabase
      .from('elections')
      .select('*')
      .eq('id', applicationData.election_id)
      .single();
      
    if (electionError) throw electionError;
    
    const election = mapDbElectionToElection(electionData);
    const eligibilityResult = await checkUserEligibility(applicationData.user_id, election);
    
    if (!eligibilityResult.isEligible) {
      throw new Error(eligibilityResult.reason || "You are not eligible to apply for this election");
    }
    
    // If eligible, proceed with submission
    const { data, error } = await supabase
      .from('candidate_applications')
      .insert({
        ...applicationData,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return mapDbCandidateApplicationToCandidateApplication(data);
  } catch (error) {
    console.error("Error submitting application:", error);
    throw error;
  }
};

export const getApplicationHistory = async (applicationId: string): Promise<any[]> => {
  try {
    // This is a placeholder for a future feature to track application history
    // We would need to create a new table for tracking history
    return [];
  } catch (error) {
    console.error("Error fetching application history:", error);
    throw error;
  }
};
