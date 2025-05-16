
/**
 * Database Candidate Application type for mapping
 */
export interface DbCandidateApplication {
  id: string;
  name: string;
  bio?: string | null;
  position: string;
  image_url?: string | null;
  election_id: string;
  user_id: string;
  created_at?: string | null;
  updated_at?: string | null;
  status: string;
  feedback?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  department?: string | null;
  year_level?: string | null;
  student_id?: string | null;
}
