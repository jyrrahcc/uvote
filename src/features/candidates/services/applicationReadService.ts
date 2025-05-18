
import { supabase } from '@/integrations/supabase/client';
import { CandidateApplication } from '@/types';
import { toast } from 'sonner';
import { processApplicationWithProfile } from './base/applicationBaseService';

/**
 * Fetch candidate applications for an election
 */
export const fetchCandidateApplicationsForElection = async (electionId: string): Promise<CandidateApplication[]> => {
  try {
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
        ),
        elections:election_id (
          title,
          description,
          departments
        )
      `)
      .eq('election_id', electionId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return (data || []).map(app => processApplicationWithProfile(app)) as CandidateApplication[];
  } catch (error) {
    console.error("Error fetching applications:", error);
    toast.error("Failed to load candidate applications");
    throw error;
  }
};

/**
 * Fetch candidate applications submitted by current user
 */
export const fetchUserApplications = async (userId?: string): Promise<CandidateApplication[]> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) throw userError;
    
    const currentUserId = userId || userData.user?.id;
    
    if (!currentUserId) {
      toast.error("You need to be logged in to view your applications");
      throw new Error("User not authenticated");
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
        ),
        elections:election_id (
          title,
          description,
          departments
        )
      `)
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return (data || []).map(app => processApplicationWithProfile(app)) as CandidateApplication[];
  } catch (error) {
    console.error("Error fetching user applications:", error);
    toast.error("Failed to load your applications");
    throw error;
  }
};
