
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
          .maybeSingle();
        
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
    console.log(`Updating application ${applicationId} with status: ${updates.status}`);
    
    // Remove any fields that aren't in the database schema
    const validUpdates = {
      status: updates.status,
      feedback: updates.feedback,
      reviewed_by: updates.reviewed_by,
      reviewed_at: updates.reviewed_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { error: updateError } = await supabase
      .from('candidate_applications')
      .update(validUpdates)
      .eq('id', applicationId);
    
    if (updateError) {
      console.error("Error updating application status:", updateError);
      throw updateError;
    }
    
    // If the status is approved, automatically add the candidate to the candidates table
    if (updates.status === 'approved') {
      // Get the application data
      const { data: appData, error: appError } = await supabase
        .from('candidate_applications')
        .select('*')
        .eq('id', applicationId)
        .single();
        
      if (appError) {
        console.error("Error fetching application data for candidate creation:", appError);
        throw appError;
      }
      
      if (appData) {
        console.log(`Creating candidate from approved application: ${applicationId}`);
        
        // Type assertion to ensure TypeScript recognizes the extended fields
        type ExtendedAppData = {
          id: string;
          name: string;
          position: string;
          bio: string | null;
          image_url: string | null;
          election_id: string;
          user_id: string;
          department: string | null;
          year_level: string | null;
          student_id: string | null;
          status: string;
          feedback: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        
        const typedAppData = appData as unknown as ExtendedAppData;
        
        // Add the candidate to the candidates table
        const { error: candidateError } = await supabase
          .from('candidates')
          .insert({
            name: typedAppData.name,
            position: typedAppData.position,
            bio: typedAppData.bio || null,
            image_url: typedAppData.image_url || null,
            election_id: typedAppData.election_id,
            created_by: typedAppData.user_id,
            department: typedAppData.department || null,
            year_level: typedAppData.year_level || null,
            student_id: typedAppData.student_id || null
          });
          
        if (candidateError) {
          console.error("Error adding approved candidate to candidates table:", candidateError);
          throw candidateError;
        }
        
        console.log(`Successfully created candidate from application: ${applicationId}`);
      }
    }
    
    // If the status is disqualified, remove any existing candidate entry for this user in this election
    if (updates.status === 'disqualified') {
      // Get the application data
      const { data: appData, error: appError } = await supabase
        .from('candidate_applications')
        .select('*')
        .eq('id', applicationId)
        .single();
        
      if (appError) {
        console.error("Error fetching application data for disqualification:", appError);
        throw appError;
      }
      
      if (appData) {
        console.log(`Removing candidate due to disqualification for application: ${applicationId}`);
        
        // Remove any candidate entries for this user in this election
        const { error: removeError } = await supabase
          .from('candidates')
          .delete()
          .eq('created_by', appData.user_id)
          .eq('election_id', appData.election_id);
          
        if (removeError) {
          console.error("Error removing disqualified candidate:", removeError);
          throw removeError;
        }
      }
    }
  } catch (error) {
    console.error("Error in updateCandidateApplication:", error);
    throw error;
  }
};

export const deleteCandidateApplication = async (applicationId: string): Promise<boolean> => {
  try {
    console.log(`Attempting to delete application: ${applicationId}`);
    
    // First, get the application data to check if it's approved
    const { data: appData, error: appError } = await supabase
      .from('candidate_applications')
      .select('*')
      .eq('id', applicationId)
      .single();
    
    if (appError) {
      console.error(`Error fetching application ${applicationId}:`, appError);
      throw appError;
    }
    
    if (!appData) {
      console.error(`Application not found with ID: ${applicationId}`);
      return false;
    }
    
    // If the application is approved, also remove the candidate
    if (appData.status === 'approved') {
      console.log(`Application ${applicationId} has approved status, removing related candidate`);
      
      const { error: candidateError } = await supabase
        .from('candidates')
        .delete()
        .eq('created_by', appData.user_id)
        .eq('election_id', appData.election_id);
        
      if (candidateError) {
        console.error(`Error deleting related candidate for application ${applicationId}:`, candidateError);
        // Continue with application deletion even if candidate deletion fails
      } else {
        console.log(`Successfully removed candidate for application: ${applicationId}`);
      }
    }
    
    // Delete the application
    const { error: deleteError } = await supabase
      .from('candidate_applications')
      .delete()
      .eq('id', applicationId);
    
    if (deleteError) {
      console.error(`Database error when deleting application ${applicationId}:`, deleteError);
      throw deleteError;
    }
    
    console.log(`Successfully deleted application: ${applicationId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting application ${applicationId}:`, error);
    return false;
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
        name: applicationData.name,
        bio: applicationData.bio,
        position: applicationData.position,
        image_url: applicationData.image_url,
        election_id: applicationData.election_id,
        user_id: applicationData.user_id,
        status: 'pending',
        department: applicationData.department,
        year_level: applicationData.year_level,
        student_id: applicationData.student_id,
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
