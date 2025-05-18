
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Approve a candidate application
 * @param applicationId The ID of the application to approve
 */
export const approveApplication = async (applicationId: string) => {
  try {
    const { data, error } = await supabase
      .from('candidate_applications')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', applicationId);
    
    if (error) {
      throw error;
    }
    
    toast.success('Application approved successfully');
    return data;
  } catch (error) {
    console.error('Error approving application:', error);
    toast.error('Failed to approve application');
    throw error;
  }
};

/**
 * Reject a candidate application
 * @param applicationId The ID of the application to reject
 * @param reason Optional reason for rejection
 */
export const rejectApplication = async (applicationId: string, reason?: string) => {
  try {
    const { data, error } = await supabase
      .from('candidate_applications')
      .update({ 
        status: 'rejected', 
        updated_at: new Date().toISOString(),
        rejection_reason: reason || null
      })
      .eq('id', applicationId);
    
    if (error) {
      throw error;
    }
    
    toast.success('Application rejected');
    return data;
  } catch (error) {
    console.error('Error rejecting application:', error);
    toast.error('Failed to reject application');
    throw error;
  }
};

/**
 * Disqualify a candidate application
 * @param applicationId The ID of the application to disqualify
 * @param reason Reason for disqualification
 */
export const disqualifyApplication = async (applicationId: string, reason: string) => {
  try {
    const { data, error } = await supabase
      .from('candidate_applications')
      .update({ 
        status: 'disqualified', 
        updated_at: new Date().toISOString(),
        disqualification_reason: reason
      })
      .eq('id', applicationId);
    
    if (error) {
      throw error;
    }
    
    toast.success('Candidate disqualified');
    return data;
  } catch (error) {
    console.error('Error disqualifying candidate:', error);
    toast.error('Failed to disqualify candidate');
    throw error;
  }
};
