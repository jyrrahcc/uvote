import { supabase } from "@/integrations/supabase/client";
import { Candidate, mapDbCandidateToCandidate } from "@/types";

// Add the createCandidate function
export const createCandidate = async (candidateData: Partial<Candidate>): Promise<Candidate | null> => {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .insert({
        name: candidateData.name,
        position: candidateData.position,
        bio: candidateData.bio,
        image_url: candidateData.imageUrl, // Updated from image_url to imageUrl
        election_id: candidateData.electionId, // Updated from election_id to electionId
        created_by: candidateData.createdBy, // Updated from created_by to createdBy
        student_id: candidateData.studentId, // Updated from student_id to studentId
        department: candidateData.department,
        year_level: candidateData.yearLevel, // Updated from year_level to yearLevel
        is_faculty: candidateData.isFaculty,
        faculty_position: candidateData.facultyPosition
      })
      .select("*")
      .single();

    if (error) throw error;

    return data ? mapDbCandidateToCandidate(data) : null;
  } catch (error) {
    console.error("Error creating candidate:", error);
    throw error;
  }
};

export const fetchCandidatesForElection = async (electionId: string): Promise<Candidate[]> => {
  try {
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .eq("election_id", electionId);

    if (error) throw error;

    return data.map(mapDbCandidateToCandidate);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    throw error;
  }
};
