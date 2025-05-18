
/**
 * Candidate type definition
 */
export interface Candidate {
  id: string;
  name: string;
  position: string;
  bio?: string;
  imageUrl?: string;
  electionId: string;
  createdBy: string;
  createdAt: string;
  department?: string;
  yearLevel?: string;
  studentId?: string;
}

/**
 * CandidateApplication type definition
 */
export interface CandidateApplication {
  id: string;
  user_id: string;
  election_id: string;
  name: string;
  position: string;
  bio?: string;
  image_url?: string;
  student_id?: string;
  department?: string;
  year_level?: string;
  status: "approved" | "rejected" | "disqualified" | "pending";
  feedback?: string | null;
  created_at: string;
  updated_at: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  profiles?: {
    first_name?: string;
    last_name?: string;
    department?: string;
    year_level?: string;
    student_id?: string;
  };
}

/**
 * CandidateApplicationUpdate type definition
 */
export interface CandidateApplicationUpdate {
  status: "approved" | "rejected" | "disqualified" | "pending";
  feedback: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

/**
 * Map database candidate to application Candidate type
 */
export function mapDbCandidateToCandidate(dbCandidate: any): Candidate {
  return {
    id: dbCandidate.id,
    name: dbCandidate.name,
    position: dbCandidate.position,
    bio: dbCandidate.bio,
    imageUrl: dbCandidate.image_url,
    electionId: dbCandidate.election_id,
    createdBy: dbCandidate.created_by,
    createdAt: dbCandidate.created_at,
    department: dbCandidate.department,
    yearLevel: dbCandidate.year_level,
    studentId: dbCandidate.student_id,
  };
}

