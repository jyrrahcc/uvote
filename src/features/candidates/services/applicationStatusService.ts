
import { supabase } from '@/integrations/supabase/client';
import { CandidateApplication, CandidateApplicationUpdate } from '@/types';
import { toast } from 'sonner';
import { processApplicationWithProfile } from './base/applicationBaseService';

/**
 * Update the status of a candidate application
 */
export const updateCandidateApplication = async (applicationId: string, update: CandidateApplicationUpdate): Promise<CandidateApplication> => {
  try {
    // Update application status
    const { data, error } = await supabase
      .from('candidate_applications')
      .update({
        status: update.status,
        feedback: update.feedback,
        reviewed_by: update.reviewed_by,
        reviewed_at: update.reviewed_at
      })
      .eq('id', applicationId)
      .select('*, profiles:user_id(*)')
      .single();
    
    if (error) throw error;
    
    // Return the updated application
    return processApplicationWithProfile(data);
  } catch (error) {
    console.error("Error updating application status:", error);
    toast.error("Failed to update application status");
    throw error;
  }
};

/**
 * Approve a candidate application
 */
export const approveApplication = async (applicationId: string, feedback?: string, reviewerId?: string): Promise<CandidateApplication> => {
  const update: CandidateApplicationUpdate = {
    status: 'approved',
    feedback: feedback || null,
    reviewed_by: reviewerId || null,
    reviewed_at: new Date().toISOString()
  };
  
  return updateCandidateApplication(applicationId, update);
};

/**
 * Reject a candidate application
 */
export const rejectApplication = async (applicationId: string, feedback?: string, reviewerId?: string): Promise<CandidateApplication> => {
  const update: CandidateApplicationUpdate = {
    status: 'rejected',
    feedback: feedback || null,
    reviewed_by: reviewerId || null,
    reviewed_at: new Date().toISOString()
  };
  
  return updateCandidateApplication(applicationId, update);
};

/**
 * Disqualify a candidate application
 */
export const disqualifyApplication = async (applicationId: string, feedback?: string, reviewerId?: string): Promise<CandidateApplication> => {
  const update: CandidateApplicationUpdate = {
    status: 'disqualified',
    feedback: feedback || null,
    reviewed_by: reviewerId || null,
    reviewed_at: new Date().toISOString()
  };
  
  return updateCandidateApplication(applicationId, update);
};

/**
 * Delete a candidate application
 */
export const deleteCandidateApplication = async (applicationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('candidate_applications')
      .delete()
      .eq('id', applicationId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error deleting application:", error);
    toast.error("Failed to delete application");
    return false;
  }
};
