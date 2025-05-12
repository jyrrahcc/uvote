
/**
 * Candidate type definition
 */
export interface Candidate {
  id: string;
  name: string;
  bio?: string;
  position: string;
  image_url?: string;
  election_id: string;
  created_by?: string;
  created_at?: string;
  student_id?: string;
  department?: string;
  year_level?: string;
}

/**
 * Candidate Application type definition
 */
export interface CandidateApplication {
  id: string;
  name: string;
  bio?: string; 
  position: string;
  image_url?: string;
  election_id: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

/**
 * Database Candidate type for mapping
 */
export interface DbCandidate {
  id: string;
  name: string;
  bio?: string | null;
  position: string;
  image_url?: string | null;
  election_id: string | null;
  created_by?: string | null;
  created_at?: string | null;
  student_id?: string | null;
  department?: string | null;
  year_level?: string | null;
}

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
}

/**
 * Supabase to App Schema Transformation Functions for Candidate
 */
export const mapDbCandidateToCandidate = (dbCandidate: DbCandidate): Candidate => {
  return {
    id: dbCandidate.id,
    name: dbCandidate.name,
    bio: dbCandidate.bio || undefined,
    position: dbCandidate.position,
    image_url: dbCandidate.image_url || undefined,
    election_id: dbCandidate.election_id || '',
    created_by: dbCandidate.created_by || undefined,
    created_at: dbCandidate.created_at || undefined,
    student_id: dbCandidate.student_id || undefined,
    department: dbCandidate.department || undefined,
    year_level: dbCandidate.year_level || undefined
  };
};

/**
 * Supabase to App Schema Transformation Functions for Candidate Application
 */
export const mapDbCandidateApplicationToCandidateApplication = (
  dbApplication: DbCandidateApplication
): CandidateApplication => {
  // Map the status value ensuring type safety
  let status: 'pending' | 'approved' | 'rejected' = 'pending';
  if (dbApplication.status === 'approved') status = 'approved';
  else if (dbApplication.status === 'rejected') status = 'rejected';

  return {
    id: dbApplication.id,
    name: dbApplication.name,
    bio: dbApplication.bio || undefined,
    position: dbApplication.position,
    image_url: dbApplication.image_url || undefined,
    election_id: dbApplication.election_id,
    user_id: dbApplication.user_id,
    created_at: dbApplication.created_at || undefined,
    updated_at: dbApplication.updated_at || undefined,
    status: status,
    feedback: dbApplication.feedback || undefined,
    reviewed_by: dbApplication.reviewed_by || undefined,
    reviewed_at: dbApplication.reviewed_at || undefined
  };
};
