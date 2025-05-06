
import { supabase } from "@/integrations/supabase/client";
import { Candidate } from "@/types";
import { CandidateInsert } from "../components/AddCandidateForm";

/**
 * Fetches all candidates for a specific election
 */
export const fetchCandidates = async (electionId: string): Promise<Candidate[]> => {
  try {
    console.log("Fetching candidates for election:", electionId);
    // Using generic syntax for Supabase to avoid type errors
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('election_id', electionId);
    
    if (error) {
      console.error("Error in fetchCandidates:", error);
      throw error;
    }
    
    console.log("Candidates data:", data);
    
    // Type casting to match our Candidate[] type
    return data as unknown as Candidate[];
  } catch (error) {
    console.error("Error fetching candidates:", error);
    throw error;
  }
};

/**
 * Adds a new candidate to the specified election
 */
export const addCandidate = async (candidateData: CandidateInsert): Promise<Candidate[]> => {
  try {
    console.log("Adding candidate with data:", candidateData);
    // Using generic syntax for Supabase to avoid type errors
    const { data, error } = await supabase
      .from('candidates')
      .insert(candidateData)
      .select();
    
    if (error) {
      console.error("Error in addCandidate:", error);
      throw error;
    }
    
    console.log("Added candidate response:", data);
    
    // Type casting to match our Candidate[] type
    return data as unknown as Candidate[];
  } catch (error) {
    console.error("Error adding candidate:", error);
    throw error;
  }
};

/**
 * Deletes a candidate by ID
 */
export const deleteCandidate = async (id: string): Promise<void> => {
  try {
    console.log("Deleting candidate with ID:", id);
    // Using generic syntax for Supabase to avoid type errors
    const { error } = await supabase
      .from('candidates')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error in deleteCandidate:", error);
      throw error;
    }
    
    console.log("Candidate deleted successfully");
  } catch (error) {
    console.error("Error deleting candidate:", error);
    throw error;
  }
};

/**
 * Checks if a user has already registered as a candidate for an election
 */
export const hasUserRegisteredAsCandidate = async (electionId: string, userId: string): Promise<boolean> => {
  try {
    console.log("Checking if user is registered as candidate - election:", electionId, "user:", userId);
    const { data, error } = await supabase
      .from('candidates')
      .select('id')
      .eq('election_id', electionId)
      .eq('created_by', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows returned, which is expected if not registered
      console.error("Error in hasUserRegisteredAsCandidate:", error);
      throw error;
    }
    
    console.log("User registered as candidate check result:", !!data);
    return !!data;
  } catch (error) {
    console.error("Error checking candidate registration:", error);
    return false;
  }
};
