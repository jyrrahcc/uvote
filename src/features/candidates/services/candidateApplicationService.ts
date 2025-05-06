
import { supabase } from "@/integrations/supabase/client";
import { CandidateApplication } from "@/types";

export interface UpdateCandidateApplicationData {
  status?: "approved" | "rejected";
  feedback?: string;
}

export interface CreateCandidateApplicationData {
  election_id: string;
  name: string;
  position: string;
  bio?: string;
  image_url?: string;
  student_id?: string;
  department?: string;
  year_level?: string;
}

// Fetch all candidate applications for an election
export async function fetchCandidateApplicationsForElection(electionId: string): Promise<CandidateApplication[]> {
  try {
    const { data, error } = await supabase
      .from("candidate_applications")
      .select("*")
      .eq("election_id", electionId);

    if (error) {
      throw new Error(`Failed to fetch applications: ${error.message}`);
    }

    return data as unknown as CandidateApplication[];
  } catch (error) {
    console.error("Error fetching candidate applications:", error);
    throw error;
  }
}

// Fetch all candidate applications for current user
export async function fetchCandidateApplicationsByUser(): Promise<CandidateApplication[]> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) {
      throw new Error("User is not authenticated");
    }
    
    const { data, error } = await supabase
      .from("candidate_applications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    
    if (error) {
      throw new Error(`Failed to fetch user applications: ${error.message}`);
    }
    
    return data as unknown as CandidateApplication[];
  } catch (error) {
    console.error("Error fetching user applications:", error);
    throw error;
  }
}

// Update a candidate application (approve or reject)
export async function updateCandidateApplication(
  applicationId: string, 
  updateData: UpdateCandidateApplicationData
): Promise<void> {
  try {
    const { error } = await supabase
      .from("candidate_applications")
      .update({
        status: updateData.status,
        feedback: updateData.feedback,
        updated_at: new Date().toISOString()
      })
      .eq("id", applicationId);
    
    if (error) {
      throw new Error(`Failed to update application: ${error.message}`);
    }
  } catch (error) {
    console.error("Error updating application:", error);
    throw error;
  }
}

// Create a new candidate application
export async function createCandidateApplication(
  applicationData: CreateCandidateApplicationData
): Promise<CandidateApplication> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) {
      throw new Error("User is not authenticated");
    }
    
    const { data, error } = await supabase
      .from("candidate_applications")
      .insert([{
        ...applicationData,
        user_id: userId,
        status: "pending"
      }])
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create application: ${error.message}`);
    }
    
    return data as unknown as CandidateApplication;
  } catch (error) {
    console.error("Error creating application:", error);
    throw error;
  }
}

// Delete a candidate application
export async function deleteCandidateApplication(applicationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("candidate_applications")
      .delete()
      .eq("id", applicationId);
    
    if (error) {
      throw new Error(`Failed to delete application: ${error.message}`);
    }
  } catch (error) {
    console.error("Error deleting application:", error);
    throw error;
  }
}
