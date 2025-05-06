
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CandidateApplication {
  id: string;
  electionId: string;
  userId: string;
  name: string;
  position: string;
  bio: string | null;
  imageUrl: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  feedback: string | null;
}

export interface CandidateApplicationInsert {
  election_id: string;
  user_id: string;
  name: string;
  position: string;
  bio?: string | null;
  image_url?: string | null;
}

// Map DB object to our application type
export const mapDbApplicationToApplication = (dbApp: any): CandidateApplication => ({
  id: dbApp.id,
  electionId: dbApp.election_id,
  userId: dbApp.user_id,
  name: dbApp.name,
  position: dbApp.position,
  bio: dbApp.bio || null,
  imageUrl: dbApp.image_url || null,
  status: dbApp.status,
  createdAt: dbApp.created_at,
  updatedAt: dbApp.updated_at,
  feedback: dbApp.feedback || null,
});

/**
 * Fetches all candidate applications for a specific election
 * Note: For admins only
 */
export const fetchCandidateApplications = async (electionId: string): Promise<CandidateApplication[]> => {
  try {
    console.log("Fetching candidate applications for election:", electionId);
    const { data, error } = await supabase
      .from('candidate_applications')
      .select('*')
      .eq('election_id', electionId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error in fetchCandidateApplications:", error);
      throw error;
    }
    
    return data.map(mapDbApplicationToApplication);
  } catch (error) {
    console.error("Error fetching candidate applications:", error);
    throw error;
  }
};

/**
 * Fetches candidate applications created by a specific user
 */
export const fetchUserCandidateApplications = async (userId: string): Promise<CandidateApplication[]> => {
  try {
    const { data, error } = await supabase
      .from('candidate_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error in fetchUserCandidateApplications:", error);
      throw error;
    }
    
    return data.map(mapDbApplicationToApplication);
  } catch (error) {
    console.error("Error fetching user's candidate applications:", error);
    throw error;
  }
};

/**
 * Checks if a user has already applied to be a candidate for a specific election
 */
export const hasUserAppliedForElection = async (electionId: string, userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('candidate_applications')
      .select('id')
      .eq('election_id', electionId)
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows returned, which is expected if not registered
      console.error("Error in hasUserAppliedForElection:", error);
      throw error;
    }
    
    return !!data;
  } catch (error) {
    console.error("Error checking if user has applied:", error);
    return false;
  }
};

/**
 * Creates a new candidate application
 */
export const createCandidateApplication = async (application: CandidateApplicationInsert): Promise<CandidateApplication> => {
  try {
    const { data, error } = await supabase
      .from('candidate_applications')
      .insert(application)
      .select()
      .single();
    
    if (error) {
      console.error("Error in createCandidateApplication:", error);
      throw error;
    }
    
    return mapDbApplicationToApplication(data);
  } catch (error) {
    console.error("Error creating candidate application:", error);
    throw error;
  }
};

/**
 * Updates the status of a candidate application (for admin use)
 */
export const updateApplicationStatus = async (
  applicationId: string,
  status: "approved" | "rejected",
  feedback?: string
): Promise<void> => {
  try {
    const updates = {
      status,
      updated_at: new Date().toISOString(),
      feedback: feedback || null
    };
    
    const { error } = await supabase
      .from('candidate_applications')
      .update(updates)
      .eq('id', applicationId);
    
    if (error) {
      console.error("Error in updateApplicationStatus:", error);
      throw error;
    }
    
    toast.success(`Application ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
  } catch (error) {
    console.error("Error updating application status:", error);
    toast.error("Failed to update application status");
    throw error;
  }
};

/**
 * Deletes a candidate application (only available for pending applications)
 */
export const deleteCandidateApplication = async (applicationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('candidate_applications')
      .delete()
      .eq('id', applicationId);
    
    if (error) {
      console.error("Error in deleteCandidateApplication:", error);
      throw error;
    }
    
    toast.success("Candidate application withdrawn successfully");
  } catch (error) {
    console.error("Error deleting candidate application:", error);
    toast.error("Failed to withdraw candidate application");
    throw error;
  }
};
