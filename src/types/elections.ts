
/**
 * Election type definition
 */
export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  candidacyStartDate?: string;
  candidacyEndDate?: string;
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
 * Database Election type for mapping
 */
export interface DbElection {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  candidacy_start_date?: string | null;
  candidacy_end_date?: string | null;
  status: 'upcoming' | 'active' | 'completed';
  created_by: string;
  created_at: string;
  updated_at: string;
  is_private: boolean;
  access_code?: string | null;
  restrict_voting?: boolean;
  department?: string | null;
}

/**
 * Supabase to App Schema Transformation Functions for Election
 */
export const mapDbElectionToElection = (dbElection: DbElection): Election => ({
  id: dbElection.id,
  title: dbElection.title,
  description: dbElection.description || '',
  startDate: dbElection.start_date,
  endDate: dbElection.end_date,
  candidacyStartDate: dbElection.candidacy_start_date || undefined,
  candidacyEndDate: dbElection.candidacy_end_date || undefined,
  status: dbElection.status,
  createdBy: dbElection.created_by,
  createdAt: dbElection.created_at,
  updatedAt: dbElection.updated_at,
  isPrivate: dbElection.is_private,
  accessCode: dbElection.access_code || undefined,
  restrictVoting: dbElection.restrict_voting,
  department: dbElection.department || undefined
});

export const mapElectionToDbElection = (election: Election): DbElection => ({
  id: election.id,
  title: election.title,
  description: election.description,
  start_date: election.startDate,
  end_date: election.endDate,
  candidacy_start_date: election.candidacyStartDate || null,
  candidacy_end_date: election.candidacyEndDate || null,
  status: election.status,
  created_by: election.createdBy,
  created_at: election.createdAt,
  updated_at: election.updatedAt,
  is_private: election.isPrivate,
  access_code: election.accessCode || null,
  restrict_voting: election.restrictVoting || false,
  department: election.department || null
});
