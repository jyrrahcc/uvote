
import { supabase } from '@/integrations/supabase/client';
import { CandidateApplication, mapDbApplicationToApplication } from '@/types';
import { ApplicationBaseService } from './base/applicationBaseService';

// Add the missing function
export const processApplicationWithProfile = async (dbApplication: any): Promise<CandidateApplication> => {
  // Just use the mapper function
  return mapDbApplicationToApplication(dbApplication);
};

export const fetchCandidateApplicationsForElection = async (electionId: string): Promise<CandidateApplication[]> => {
  try {
    const { data, error } = await supabase
      .from('candidate_applications')
      .select('*')
      .eq('election_id', electionId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(mapDbApplicationToApplication);
  } catch (error) {
    console.error('Error fetching applications for election:', error);
    throw error;
  }
};

export const fetchUserApplications = async (userId: string): Promise<CandidateApplication[]> => {
  try {
    const { data, error } = await supabase
      .from('candidate_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(mapDbApplicationToApplication);
  } catch (error) {
    console.error('Error fetching user applications:', error);
    throw error;
  }
};

export const hasUserAppliedForElection = async (electionId: string, userId: string): Promise<boolean> => {
  try {
    const { data, error, count } = await supabase
      .from('candidate_applications')
      .select('id', { count: 'exact' })
      .eq('election_id', electionId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return count !== null && count > 0;
  } catch (error) {
    console.error('Error checking if user applied:', error);
    throw error;
  }
};

export const getApplicationById = async (applicationId: string): Promise<CandidateApplication | null> => {
  return ApplicationBaseService.getApplicationById(applicationId);
};
