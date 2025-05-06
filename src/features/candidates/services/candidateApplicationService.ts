
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CandidateApplicationInsert {
  election_id: string;
  user_id: string;
  name: string;
  position: string;
  bio: string;
  image_url: string | null;
  student_id?: string | null;
  department?: string | null;
  year_level?: string | null;
}

export interface CandidateApplication {
  id: string;
  election_id: string;
  user_id: string;
  name: string;
  position: string;
  bio: string;
  image_url: string | null;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback: string | null;
  student_id: string | null;
  department: string | null;
  year_level: string | null;
}

/**
 * Create a new candidate application
 */
export const createCandidateApplication = async (
  application: CandidateApplicationInsert
): Promise<void> => {
  const { error } = await supabase.from('candidate_applications').insert([application]);
  
  if (error) {
    console.error("Error creating candidate application:", error);
    throw error;
  }
};

/**
 * Check if a user has already applied for a specific election
 */
export const hasUserAppliedForElection = async (
  electionId: string,
  userId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('candidate_applications')
      .select('id')
      .eq('election_id', electionId)
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error("Error checking candidate application:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Error checking if user has applied:", error);
    return false;
  }
};

/**
 * Get all applications for a specific election
 */
export const getElectionApplications = async (
  electionId: string
): Promise<CandidateApplication[]> => {
  try {
    const { data, error } = await supabase
      .from('candidate_applications')
      .select('*')
      .eq('election_id', electionId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching applications:", error);
      throw error;
    }
    
    return data as CandidateApplication[];
  } catch (error) {
    console.error("Error getting election applications:", error);
    toast.error("Failed to fetch candidate applications");
    return [];
  }
};

/**
 * Get applications submitted by a specific user
 */
export const getUserApplications = async (
  userId: string
): Promise<CandidateApplication[]> => {
  try {
    const { data, error } = await supabase
      .from('candidate_applications')
      .select('*, elections(title, status)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching user applications:", error);
      throw error;
    }
    
    return data as unknown as CandidateApplication[];
  } catch (error) {
    console.error("Error getting user applications:", error);
    toast.error("Failed to fetch your candidate applications");
    return [];
  }
};

/**
 * Update application status
 */
export const updateApplicationStatus = async (
  applicationId: string,
  status: 'approved' | 'rejected',
  feedback?: string
): Promise<void> => {
  try {
    const updateData: { status: string; feedback?: string } = { status };
    
    if (feedback) {
      updateData.feedback = feedback;
    }
    
    const { error } = await supabase
      .from('candidate_applications')
      .update(updateData)
      .eq('id', applicationId);
    
    if (error) {
      console.error("Error updating application status:", error);
      throw error;
    }
    
    // When approving, the trigger will handle creating the candidate record
  } catch (error) {
    console.error("Error updating application status:", error);
    toast.error("Failed to update application status");
    throw error;
  }
};
