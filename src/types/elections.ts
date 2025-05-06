
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
 * Supabase to App Schema Transformation Functions for Election
 */
export const mapDbElectionToElection = (dbElection: any): Election => ({
  id: dbElection.id,
  title: dbElection.title,
  description: dbElection.description,
  startDate: dbElection.start_date,
  endDate: dbElection.end_date,
  candidacyStartDate: dbElection.candidacy_start_date,
  candidacyEndDate: dbElection.candidacy_end_date,
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
  candidacy_start_date: election.candidacyStartDate,
  candidacy_end_date: election.candidacyEndDate,
  status: election.status,
  created_by: election.createdBy,
  created_at: election.createdAt,
  updated_at: election.updatedAt,
  is_private: election.isPrivate,
  access_code: election.accessCode,
  restrict_voting: election.restrictVoting,
  department: election.department
});
