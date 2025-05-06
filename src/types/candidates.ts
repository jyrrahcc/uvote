
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
