
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
 * User type definition
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
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
  accessCode: dbElection.access_code
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
  access_code: election.accessCode
});

export const mapDbCandidateToCandidate = (dbCandidate: any): Candidate => ({
  id: dbCandidate.id,
  name: dbCandidate.name,
  bio: dbCandidate.bio || '',
  position: dbCandidate.position,
  imageUrl: dbCandidate.image_url || '',
  electionId: dbCandidate.election_id,
  createdAt: dbCandidate.created_at
});

export const mapCandidateToDbCandidate = (candidate: Candidate): any => ({
  id: candidate.id,
  name: candidate.name,
  bio: candidate.bio,
  position: candidate.position,
  image_url: candidate.imageUrl,
  election_id: candidate.electionId,
  created_at: candidate.createdAt
});
