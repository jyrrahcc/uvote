
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Approve a candidate application
 * @param applicationId The ID of the application to approve
 */
export const approveApplication = async (applicationId: string) => {
  return updateCandidateApplication(applicationId, 'approved');
};

/**
 * Reject a candidate application
 * @param applicationId The ID of the application to reject
 * @param reason Optional reason for rejection
 */
export const rejectApplication = async (applicationId: string, reason?: string) => {
  return updateCandidateApplication(applicationId, 'rejected', reason);
};

/**
 * Disqualify a candidate application
 * @param applicationId The ID of the application to disqualify
 * @param reason Reason for disqualification
 */
export const disqualifyApplication = async (applicationId: string, reason: string) => {
  return updateCandidateApplication(applicationId, 'disqualified', reason);
};

/**
 * Update a candidate application
 * @param applicationId The ID of the application to update
 * @param status The new status for the application
 * @param reason Optional reason for rejection/disqualification
 */
export const updateCandidateApplication = async (
  applicationId: string, 
  status: 'approved' | 'rejected' | 'disqualified' | 'pending', 
  reason?: string
) => {
  try {
    const updateData: any = { 
      status, 
      updated_at: new Date().toISOString() 
    };
    
    if (status === 'rejected') {
      updateData.rejection_reason = reason || null;
    } else if (status === 'disqualified') {
      updateData.disqualification_reason = reason || null;
    }
    
    const { data, error } = await supabase
      .from('candidate_applications')
      .update(updateData)
      .eq('id', applicationId);
    
    if (error) {
      throw error;
    }
    
    let actionText = '';
    switch(status) {
      case 'approved': actionText = 'approved'; break;
      case 'rejected': actionText = 'rejected'; break;
      case 'disqualified': actionText = 'disqualified'; break;
      default: actionText = 'updated';
    }
    
    toast.success(`Application ${actionText} successfully`);
    return data;
  } catch (error) {
    console.error(`Error updating application to ${status}:`, error);
    toast.error(`Failed to update application status`);
    throw error;
  }
};

/**
 * Delete a candidate application
 * @param applicationId The ID of the application to delete
 */
export const deleteCandidateApplication = async (applicationId: string) => {
  try {
    const { data, error } = await supabase
      .from('candidate_applications')
      .delete()
      .eq('id', applicationId);
    
    if (error) {
      throw error;
    }
    
    toast.success('Application deleted successfully');
    return data;
  } catch (error) {
    console.error('Error deleting application:', error);
    toast.error('Failed to delete application');
    throw error;
  }
};
