
/**
 * Election type definition
 */
export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isPrivate: boolean;
  accessCode?: string;
  restrictVoting?: boolean;
  department?: string; // Added department field for DLSU-D context
}

/**
 * Candidate type definition
 */
export interface Candidate {
  id: string;
  name: string;
  bio: string;
  position: string;
  imageUrl: string;
  electionId: string;
  createdAt: string;
  studentId?: string; // Added student ID field for DLSU-D context
  department?: string; // Added department field for DLSU-D context
  yearLevel?: string; // Added year level field for DLSU-D context
}

/**
 * Vote type definition
 */
export interface Vote {
  id: string;
  electionId: string;
  candidateId: string;
  userId: string;
  timestamp: string;
}

/**
 * Result type definition
 */
export interface Result {
  candidateId: string;
  candidateName: string;
  votes: number;
  percentage: number;
}

/**
 * Election Result type definition
 */
export interface ElectionResult {
  electionId: string;
  candidates: {
    id: string;
    name: string;
    votes: number;
    percentage: number;
  }[];
  totalVotes: number;
  winner: {
    id: string;
    name: string;
    votes: number;
    percentage: number;
  } | null;
}

/**
 * User type definition
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
  studentId?: string; // Added student ID field for DLSU-D context
  department?: string; // Added department field for DLSU-D context
  yearLevel?: string; // Added year level field for DLSU-D context
}

/**
 * DLSU-D Voter type definition
 */
export interface DlsudVoter {
  id: string;
  userId: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  yearLevel: string;
}

/**
 * Supabase Profile type definition for DLSU-D
 */
export interface DlsudProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
  student_id?: string;
  department?: string;
  year_level?: string;
}

/**
 * Supabase to App Schema Transformation Functions
 */
export const mapDbElectionToElection = (dbElection: any): Election => ({
  id: dbElection.id,
  title: dbElection.title,
  description: dbElection.description,
  startDate: dbElection.start_date,
  endDate: dbElection.end_date,
  status: dbElection.status,
  createdBy: dbElection.created_by,
  createdAt: dbElection.created_at,
  updatedAt: dbElection.updated_at,
  isPrivate: dbElection.is_private,
  accessCode: dbElection.access_code,
  restrictVoting: dbElection.restrict_voting,
  department: dbElection.department
});

export const mapElectionToDbElection = (election: Election): any => ({
  id: election.id,
  title: election.title,
  description: election.description,
  start_date: election.startDate,
  end_date: election.endDate,
  status: election.status,
  created_by: election.createdBy,
  created_at: election.createdAt,
  updated_at: election.updatedAt,
  is_private: election.isPrivate,
  access_code: election.accessCode,
  restrict_voting: election.restrictVoting,
  department: election.department
});

export const mapDbCandidateToCandidate = (dbCandidate: any): Candidate => ({
  id: dbCandidate.id,
  name: dbCandidate.name,
  bio: dbCandidate.bio || '',
  position: dbCandidate.position,
  imageUrl: dbCandidate.image_url || '',
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
  election_id: candidate.electionId,
  created_at: candidate.createdAt,
  student_id: candidate.studentId,
  department: candidate.department,
  year_level: candidate.yearLevel
});

/**
 * Maps database voter data to app voter object
 */
export const mapDbVoterToVoter = (dbVoter: any): DlsudVoter => ({
  id: dbVoter.id,
  userId: dbVoter.user_id,
  studentId: dbVoter.student_id,
  firstName: dbVoter.first_name,
  lastName: dbVoter.last_name,
  email: dbVoter.email,
  department: dbVoter.department,
  yearLevel: dbVoter.year_level
});

/**
 * Maps database profile to app profile object
 */
export const mapDbProfileToProfile = (profile: any): DlsudProfile => ({
  id: profile.id,
  email: profile.email,
  first_name: profile.first_name,
  last_name: profile.last_name,
  created_at: profile.created_at,
  updated_at: profile.updated_at,
  student_id: profile.student_id || '',
  department: profile.department || '',
  year_level: profile.year_level || ''
});
