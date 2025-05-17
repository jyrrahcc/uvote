
import { supabase } from "@/integrations/supabase/client";
import { CandidateApplication, mapDbCandidateApplicationToCandidateApplication, DbCandidateApplication } from "@/types";
import { Election, mapDbElectionToElection } from "@/types";
import { checkUserEligibility } from "@/utils/eligibilityUtils";
import { v4 as uuidv4 } from "uuid";

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
    
    const { data, error } = await supabase
      .from('candidate_applications')
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          department,
          year_level,
          student_id
        )
      `)
      .eq('user_id', userIdToUse)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data.map(item => {
      const extendedApp = item as unknown as ExtendedApplicationData;
      
      // Create a valid DbCandidateApplication with additional fields from profiles
      const dbApp: DbCandidateApplication = {
        ...extendedApp,
        student_id: extendedApp.student_id || extendedApp.profiles?.student_id || null,
        department: extendedApp.department || extendedApp.profiles?.department || null,
        year_level: extendedApp.year_level || extendedApp.profiles?.year_level || null
      };
      
      return mapDbCandidateApplicationToCandidateApplication(dbApp);
    });
  } catch (error) {
    console.error("Error fetching user applications:", error);
    throw error;
  }
};

/**
 * Check if user is eligible to apply for an election
 */
export const checkUserEligibilityForElection = async (userId: string, election: Election): Promise<{isEligible: boolean; reason: string | null}> => {
  try {
    // Use the centralized eligibility checker
    return await checkUserEligibility(userId, election);
  } catch (error) {
    console.error("Error checking user eligibility:", error);
    return { isEligible: false, reason: "Error checking eligibility" };
  }
};

// Type definition for the enriched application data that includes profile information
interface ExtendedApplicationData extends DbCandidateApplication {
  profiles?: {
    first_name: string;
    last_name: string;
    department?: string | null;
    year_level?: string | null;
    student_id?: string | null;
  } | null;
}

/**
 * Fetch all applications for a specific election (for admin use)
 */
export const fetchCandidateApplicationsForElection = async (electionId: string): Promise<CandidateApplication[]> => {
  try {
    // Fetch the applications with join to profiles table
    const { data, error } = await supabase
      .from('candidate_applications')
      .select(`
        *,
        profiles:user_id (
          first_name, last_name, department, year_level, student_id
        )
      `)
      .eq('election_id', electionId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Map the extended data to CandidateApplication type
    return data.map(application => {
      const extendedApp = application as unknown as ExtendedApplicationData;
      
      // Create a valid DbCandidateApplication with additional fields from profiles
      const validDbCandidateApplication: DbCandidateApplication = {
        ...extendedApp,
        student_id: extendedApp.student_id || extendedApp.profiles?.student_id || null,
        department: extendedApp.department || extendedApp.profiles?.department || null,
        year_level: extendedApp.year_level || extendedApp.profiles?.year_level || null
      };
      
      return mapDbCandidateApplicationToCandidateApplication(validDbCandidateApplication);
    });
  } catch (error) {
    console.error("Error fetching applications for election:", error);
    throw error;
  }
};

/**
 * Update status and feedback for a candidate application (for admin use)
 */
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

/**
 * Submit a new candidate application
 */
export const submitCandidateApplication = async (applicationData: Omit<CandidateApplication, 'id'>): Promise<CandidateApplication> => {
  try {
    // Generate a UUID for the application
    const id = uuidv4();
    
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
        id,
        ...applicationData,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        profiles:user_id (
          first_name, last_name, department, year_level, student_id
        )
      `)
      .single();
      
    if (error) throw error;
    
    // Map the extended data to CandidateApplication type
    const extendedApp = data as unknown as ExtendedApplicationData;
    const dbApp: DbCandidateApplication = {
      ...extendedApp,
      student_id: extendedApp.student_id || extendedApp.profiles?.student_id || null,
      department: extendedApp.department || extendedApp.profiles?.department || null,
      year_level: extendedApp.year_level || extendedApp.profiles?.year_level || null
    };
    
    return mapDbCandidateApplicationToCandidateApplication(dbApp);
  } catch (error) {
    console.error("Error submitting application:", error);
    throw error;
  }
};
