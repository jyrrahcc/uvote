
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Process application data with user profile
 */
export const processApplicationWithProfile = async (application: any) => {
  try {
    // Get user profile for this application
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', application.user_id)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }
    
    // Return application with profile data
    return {
      ...application,
      profile: profileData || null
    };
  } catch (error) {
    console.error('Error processing application:', error);
    return application;
  }
};

/**
 * Fetch candidate applications for a specific election
 */
export const fetchCandidateApplicationsForElection = async (electionId: string) => {
  try {
    const { data, error } = await supabase
      .from('candidate_applications')
      .select('*')
      .eq('election_id', electionId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Process each application to include profile data
    const applicationsWithProfiles = await Promise.all(
      (data || []).map(processApplicationWithProfile)
    );
    
    return applicationsWithProfiles;
  } catch (error) {
    console.error('Error fetching applications:', error);
    toast.error('Failed to load candidate applications');
    throw error;
  }
};

/**
 * Fetch candidate applications for a specific user
 */
export const fetchUserCandidateApplications = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('candidate_applications')
      .select('*, elections(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching user applications:', error);
    toast.error('Failed to load your applications');
    throw error;
  }
};

/**
 * Fetch a single candidate application by ID
 */
export const fetchCandidateApplicationById = async (applicationId: string) => {
  try {
    const { data, error } = await supabase
      .from('candidate_applications')
      .select('*, elections(*)')
      .eq('id', applicationId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching application:', error);
    toast.error('Failed to load application details');
    throw error;
  }
};
