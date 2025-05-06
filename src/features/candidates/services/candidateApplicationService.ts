import { supabase } from "@/integrations/supabase/client";
import { CandidateApplication } from "@/types/candidates";

// Submit a new candidate application
export const submitCandidateApplication = async (application: {
  name: string;
  position: string;
  bio: string | null;
  image_url: string | null;
  election_id: string;
  user_id: string;
  feedback?: string | null;
}): Promise<CandidateApplication> => {
  const { data, error } = await supabase
    .from('candidate_applications')
    .insert({
      name: application.name,
      position: application.position,
      bio: application.bio,
      image_url: application.image_url,
      election_id: application.election_id,
      user_id: application.user_id,
      status: 'pending',
      feedback: application.feedback || null,
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error submitting application:', error);
    throw error;
  }

  return data as CandidateApplication;
};

// Update an existing candidate application
export const updateCandidateApplication = async (
  id: string, 
  updates: {
    status: string;
    feedback?: string | null;
  }
): Promise<CandidateApplication> => {
  const { data, error } = await supabase
    .from('candidate_applications')
    .update({
      status: updates.status,
      feedback: updates.feedback || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating application:', error);
    throw error;
  }

  return data as CandidateApplication;
};

// Delete a candidate application
export const deleteCandidateApplication = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('candidate_applications')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting application:', error);
    throw error;
  }
};

// Check if a user has an application for a specific election
export const hasUserAppliedForElection = async (electionId: string, userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('candidate_applications')
    .select('id')
    .eq('election_id', electionId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error checking application status:', error);
    throw error;
  }

  return !!data;
};

// Get all applications for an election - Export renamed function
export const fetchCandidateApplicationsForElection = async (electionId: string): Promise<CandidateApplication[]> => {
  const { data, error } = await supabase
    .from('candidate_applications')
    .select('*')
    .eq('election_id', electionId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }

  return data as CandidateApplication[];
};

// Get applications by user - Export renamed function
export const fetchCandidateApplicationsByUser = async (): Promise<CandidateApplication[]> => {
  const { data: userSession } = await supabase.auth.getSession();
  const userId = userSession.session?.user.id;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('candidate_applications')
    .select('*, elections(title, status)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user applications:', error);
    throw error;
  }

  return data as CandidateApplication[];
};

// Keep legacy named functions for backward compatibility
export const getElectionApplications = fetchCandidateApplicationsForElection;
export const getUserApplications = fetchCandidateApplicationsByUser;
