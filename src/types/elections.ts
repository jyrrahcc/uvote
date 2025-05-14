
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
  colleges: string[]; // Array of college names (renamed from departments)
  positions?: string[]; // Added positions array
  banner_urls?: string[]; // Added banner_urls array to store election banner images
  eligibleYearLevels?: string[]; // Added eligibleYearLevels array
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
    position?: string;
    votes: number;
    percentage: number;
  }[];
  totalVotes: number;
  winner: {
    id: string;
    name: string;
    position?: string;
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
  department?: string | null; // Legacy field
  departments?: string[] | null; // Will be mapped to colleges in the UI
  positions?: string[] | null; // Added positions array
  total_eligible_voters?: number | null; // Added total_eligible_voters field
  banner_urls?: string[] | null; // Added banner_urls field
  eligible_year_levels?: string[] | null; // Added eligible_year_levels field
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
    colleges: dbElection.departments || [], // Map departments to colleges in the UI
    positions: dbElection.positions || [],
    banner_urls: dbElection.banner_urls || [],
    eligibleYearLevels: dbElection.eligible_year_levels || []
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
  departments: election.colleges || [], // Map colleges back to departments for DB
  positions: election.positions || [],
  banner_urls: election.banner_urls || [],
  eligible_year_levels: election.eligibleYearLevels || []
});
