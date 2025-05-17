
import { supabase } from "@/integrations/supabase/client";
import { CandidateApplication } from "@/types";
import { processApplicationWithProfile } from "./base/applicationBaseService";

/**
 * Check if a user has already applied for a specific election
 */
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

/**
 * Fetch applications for the current user
 */
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
    
    // Changed to use separate query approach rather than join with explicit hint
    const { data: applications, error: applicationsError } = await supabase
      .from('candidate_applications')
      .select('*')
      .eq('user_id', userIdToUse)
      .order('created_at', { ascending: false });
      
    if (applicationsError) throw applicationsError;
    
    // Fetch profiles separately
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, department, year_level, student_id')
      .in('id', applications.map(app => app.user_id));
      
    if (profilesError) throw profilesError;
    
    // Merge the profile data with applications
    const enrichedApplications = applications.map(app => {
      const profile = profiles.find(p => p.id === app.user_id);
      
      return {
        ...app,
        profiles: profile ? {
          first_name: profile.first_name,
          last_name: profile.last_name,
          department: profile.department,
          year_level: profile.year_level,
          student_id: profile.student_id
        } : null
      };
    });
    
    return enrichedApplications.map(item => processApplicationWithProfile(item));
  } catch (error) {
    console.error("Error fetching user applications:", error);
    throw error;
  }
};

/**
 * Fetch all applications for a specific election (for admin use)
 */
export const fetchCandidateApplicationsForElection = async (electionId: string): Promise<CandidateApplication[]> => {
  try {
    // Changed to use separate query approach rather than join with explicit hint
    const { data: applications, error: applicationsError } = await supabase
      .from('candidate_applications')
      .select('*')
      .eq('election_id', electionId)
      .order('created_at', { ascending: false });
      
    if (applicationsError) throw applicationsError;
    
    // Empty array check to avoid unnecessary profile query
    if (!applications || applications.length === 0) {
      return [];
    }
    
    // Fetch profiles separately
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, department, year_level, student_id')
      .in('id', applications.map(app => app.user_id));
      
    if (profilesError) throw profilesError;
    
    // Merge the profile data with applications
    const enrichedApplications = applications.map(app => {
      const profile = profiles.find(p => p.id === app.user_id);
      
      return {
        ...app,
        profiles: profile ? {
          first_name: profile.first_name,
          last_name: profile.last_name,
          department: profile.department,
          year_level: profile.year_level,
          student_id: profile.student_id
        } : null
      };
    });
    
    return enrichedApplications.map(application => processApplicationWithProfile(application));
  } catch (error) {
    console.error("Error fetching applications for election:", error);
    throw error;
  }
};
