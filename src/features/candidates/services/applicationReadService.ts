
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
    
    // Fix: Explicitly spell out the join condition instead of using the simplified syntax
    const { data, error } = await supabase
      .from('candidate_applications')
      .select(`
        *,
        profiles!candidate_applications_user_id_fkey (
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
    
    return data.map(item => processApplicationWithProfile(item));
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
    // Fix: Explicitly spell out the join by clarifying the foreign key relationship
    const { data, error } = await supabase
      .from('candidate_applications')
      .select(`
        *,
        profiles!candidate_applications_user_id_fkey (
          first_name, last_name, department, year_level, student_id
        )
      `)
      .eq('election_id', electionId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data.map(application => processApplicationWithProfile(application));
  } catch (error) {
    console.error("Error fetching applications for election:", error);
    throw error;
  }
};
