
import { supabase } from "@/integrations/supabase/client";
import { Candidate, DbCandidate, mapDbCandidateToCandidate } from "@/types";
import { toast } from "sonner";

/**
 * Fetches candidates for a specific election
 */
export const fetchCandidatesForElection = async (electionId: string): Promise<Candidate[]> => {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('election_id', electionId)
      .order('position', { ascending: true });
    
    if (error) throw error;
    
    // Transform data to match our Candidate interface
    return data.map((candidate) => mapDbCandidateToCandidate(candidate as DbCandidate));
  } catch (error) {
    console.error("Error fetching candidates:", error);
    throw error;
  }
};

// Adding an alias for backward compatibility
export const fetchCandidates = fetchCandidatesForElection;

/**
 * Creates a new candidate
 */
export const createCandidate = async (candidateData: Partial<Candidate>): Promise<Candidate> => {
  try {
    // Make sure required fields are present
    if (!candidateData.name || !candidateData.position) {
      throw new Error("Candidate name and position are required");
    }
    
    // Convert Partial<Candidate> to a compatible type for Supabase insert
    // by explicitly creating an object with the expected properties
    const candidateToInsert = {
      name: candidateData.name,
      position: candidateData.position,
      bio: candidateData.bio || null,
      image_url: candidateData.image_url || null,
      election_id: candidateData.election_id || null,
      created_by: candidateData.created_by || null,
      student_id: candidateData.student_id || null,
      department: candidateData.department || null,
      year_level: candidateData.year_level || null
    };
    
    const { data, error } = await supabase
      .from('candidates')
      .insert(candidateToInsert)
      .select()
      .single();
    
    if (error) throw error;
    
    return mapDbCandidateToCandidate(data as DbCandidate);
  } catch (error) {
    console.error("Error creating candidate:", error);
    throw error;
  }
};

/**
 * Updates an existing candidate
 */
export const updateCandidate = async (
  candidateId: string, 
  candidateData: Partial<Candidate>
): Promise<Candidate> => {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .update(candidateData)
      .eq('id', candidateId)
      .select()
      .single();
    
    if (error) throw error;
    
    return mapDbCandidateToCandidate(data as DbCandidate);
  } catch (error) {
    console.error("Error updating candidate:", error);
    throw error;
  }
};

/**
 * Deletes a candidate
 */
export const deleteCandidate = async (candidateId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('candidates')
      .delete()
      .eq('id', candidateId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error deleting candidate:", error);
    throw error;
  }
};
