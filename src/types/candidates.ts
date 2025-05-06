
/**
 * Candidate type definition
 */
export interface Candidate {
  id: string;
  name: string;
  bio: string;
  position: string;
  imageUrl: string;
  posterUrl?: string; // Added poster URL field
  electionId: string;
  createdAt: string;
  studentId?: string; // Added student ID field for DLSU-D context
  department?: string; // Added department field for DLSU-D context
  yearLevel?: string; // Added year level field for DLSU-D context
}

/**
 * Supabase to App Schema Transformation Functions for Candidate
 */
export const mapDbCandidateToCandidate = (dbCandidate: any): Candidate => ({
  id: dbCandidate.id,
  name: dbCandidate.name,
  bio: dbCandidate.bio || '',
  position: dbCandidate.position,
  imageUrl: dbCandidate.image_url || '',
  posterUrl: dbCandidate.poster_url || '',
  electionId: dbCandidate.election_id,
  createdAt: dbCandidate.created_at,
  studentId: dbCandidate.student_id,
  department: dbCandidate.department,
  yearLevel: dbCandidate.year_level
});

export const mapCandidateToDbCandidate = (candidate: Candidate): any => ({
  id: candidate.id,
  name: candidate.name,
  bio: candidate.bio,
  position: candidate.position,
  image_url: candidate.imageUrl,
  poster_url: candidate.posterUrl,
  election_id: candidate.electionId,
  created_at: candidate.createdAt,
  student_id: candidate.studentId,
  department: candidate.department,
  year_level: candidate.yearLevel
});
