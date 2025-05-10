
/**
 * Election type definition
 */
export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  candidacyStartDate?: string | null;
  candidacyEndDate?: string | null;
  status: 'upcoming' | 'active' | 'completed';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isPrivate: boolean;
  accessCode?: string | null;
  restrictVoting?: boolean;
  department?: string; // For backward compatibility
  departments?: string[]; // Array of departments
  positions?: string[]; // Added positions array
  totalEligibleVoters?: number; // Add totalEligibleVoters field
  banner_urls?: string[]; // Added banner_urls array to store election banner images
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
  status: string; // Changed from enum to string to match raw database format
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_private: boolean | null;
  access_code?: string | null;
  restrict_voting?: boolean | null;
  department?: string | null;
  departments?: string[] | null; // Added departments array
  positions?: string[] | null; // Added positions array
  total_eligible_voters?: number | null; // Added total_eligible_voters field
  banner_urls?: string[] | null; // Added banner_urls field
}

/**
 * Supabase to App Schema Transformation Functions for Election
 */
export const mapDbElectionToElection = (dbElection: DbElection): Election => {
  // Cast the status to the appropriate type since we've validated it
  let typedStatus: 'upcoming' | 'active' | 'completed' = 'upcoming';
  if (dbElection.status === 'active') typedStatus = 'active';
  else if (dbElection.status === 'completed') typedStatus = 'completed';

  return {
    id: dbElection.id,
    title: dbElection.title,
    description: dbElection.description || '',
    startDate: dbElection.start_date,
    endDate: dbElection.end_date,
    candidacyStartDate: dbElection.candidacy_start_date || null,
    candidacyEndDate: dbElection.candidacy_end_date || null,
    status: typedStatus,
    createdBy: dbElection.created_by || '',
    createdAt: dbElection.created_at || '',
    updatedAt: dbElection.updated_at || '',
    isPrivate: dbElection.is_private || false,
    accessCode: dbElection.access_code || null,
    restrictVoting: dbElection.restrict_voting || false,
    department: dbElection.department || '',
    departments: dbElection.departments || [],
    positions: dbElection.positions || [],
    totalEligibleVoters: dbElection.total_eligible_voters || 0,
    banner_urls: dbElection.banner_urls || []
  };
};

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
  department: election.department || null,
  departments: election.departments || [],
  positions: election.positions || [],
  total_eligible_voters: election.totalEligibleVoters || 0,
  banner_urls: election.banner_urls || []
});
