export interface Candidate {
  id: string;
  name: string;
  position: string;
  bio?: string;
  image_url?: string;
  election_id: string;
  student_id?: string;
  department?: string;
  year_level?: string;
}

export interface CandidateApplication {
  id: string;
  name: string;
  position: string;
  bio: string | null;
  image_url: string | null;
  election_id: string;
  user_id: string;
  status: string;
  feedback: string | null;
  created_at: string;
  updated_at: string | null;
  student_id?: string | null;
  department?: string | null;
  year_level?: string | null;
}

export interface CandidateUI {
  id: string;
  name: string;
  position: string;
  bio?: string;
  image_url?: string;
  poster_url?: string;
  election_id: string;
  student_id?: string;
  department?: string;
  year_level?: string;
  created_at?: string;
}

export const mapDbCandidateToCandidate = (dbCandidate: any): Candidate => {
  return {
    id: dbCandidate.id,
    name: dbCandidate.name,
    position: dbCandidate.position,
    bio: dbCandidate.bio,
    image_url: dbCandidate.image_url,
    election_id: dbCandidate.election_id,
    student_id: dbCandidate.student_id,
    department: dbCandidate.department,
    year_level: dbCandidate.year_level
  };
};

export const hasUserAppliedForElection = async (electionId: string, userId: string): Promise<boolean> => {
  // This function will be implemented in the service, not here
  return false;
};
