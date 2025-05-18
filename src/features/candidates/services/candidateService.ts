
import { supabase } from '@/integrations/supabase/client';
import { Candidate, mapDbCandidateToCandidate } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Define the database candidate interface
interface DbCandidate {
  id: string;
  name: string;
  position: string;
  bio?: string;
  image_url?: string;
  election_id?: string;
  created_at?: string;
  created_by?: string;
  department?: string;
  year_level?: string;
  is_faculty?: boolean;
  faculty_position?: string;
  student_id?: string;
}

export const fetchCandidates = async (electionId: string): Promise<Candidate[]> => {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('election_id', electionId);

    if (error) {
      throw error;
    }

    return data.map(mapDbCandidateToCandidate);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    throw error;
  }
};

// Add this function for CandidatesHook
export const fetchCandidatesForElection = async (electionId: string): Promise<Candidate[]> => {
  return fetchCandidates(electionId);
};

export const addCandidate = async (candidateData: Partial<Candidate>): Promise<Candidate> => {
  try {
    const id = uuidv4();

    // Map from camelCase to snake_case for the database
    const dbCandidate: DbCandidate = {
      id,
      name: candidateData.name || '',
      position: candidateData.position || '',
      bio: candidateData.bio,
      image_url: candidateData.imageUrl, // Fixed camelCase to snake_case
      election_id: candidateData.electionId, // Fixed camelCase to snake_case
      created_by: candidateData.createdBy, // Fixed camelCase to snake_case
      student_id: candidateData.studentId, // Fixed camelCase to snake_case
      department: candidateData.department,
      year_level: candidateData.yearLevel, // Fixed camelCase to snake_case
      is_faculty: candidateData.isFaculty,
      faculty_position: candidateData.facultyPosition,
    };

    const { data, error } = await supabase
      .from('candidates')
      .insert(dbCandidate)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return mapDbCandidateToCandidate(data);
  } catch (error) {
    console.error('Error adding candidate:', error);
    throw error;
  }
};

// Add this function for useCandidateRegistration hook
export const createCandidate = async (candidateData: any): Promise<Candidate> => {
  try {
    // Convert form data to candidate data structure if needed
    const candidateToCreate: Partial<Candidate> = {
      name: candidateData.name,
      position: candidateData.position,
      bio: candidateData.bio,
      imageUrl: candidateData.image_url, 
      electionId: candidateData.election_id,
      createdBy: candidateData.created_by,
      studentId: candidateData.student_id,
      department: candidateData.department,
      yearLevel: candidateData.year_level,
      isFaculty: candidateData.is_faculty || false,
      facultyPosition: candidateData.faculty_position
    };

    return addCandidate(candidateToCreate);
  } catch (error) {
    console.error('Error creating candidate:', error);
    throw error;
  }
};

export const deleteCandidate = async (candidateId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('candidates')
      .delete()
      .eq('id', candidateId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting candidate:', error);
    throw error;
  }
};
