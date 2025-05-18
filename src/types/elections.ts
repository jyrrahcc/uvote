
/**
 * Election type definition
 */
export interface Election {
  id: string;
  title: string;
  description?: string;
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
  department?: string;
  colleges?: string[];
  eligibleYearLevels?: string[];
  positions: string[];
  allowFaculty: boolean;
  restrictVoting?: boolean;
  bannerUrls?: string[];
  totalEligibleVoters?: number;
}

/**
 * Database Election type definition
 */
export interface DbElection {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  candidacy_start_date?: string;
  candidacy_end_date?: string;
  status: 'upcoming' | 'active' | 'completed';
  created_by: string;
  created_at: string;
  updated_at: string;
  is_private: boolean;
  access_code?: string;
  department?: string;
  departments?: string[];
  eligible_year_levels?: string[];
  positions: string[];
  allow_faculty?: boolean;
  restrict_voting?: boolean;
  banner_urls?: string[];
}

/**
 * Function to map database election objects to application Election type
 */
export function mapDbElectionToElection(dbElection: DbElection): Election {
  return {
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
    department: dbElection.department,
    colleges: dbElection.departments,
    eligibleYearLevels: dbElection.eligible_year_levels,
    positions: dbElection.positions || [],
    allowFaculty: dbElection.allow_faculty || false,
    restrictVoting: dbElection.restrict_voting,
    bannerUrls: dbElection.banner_urls,
  };
}

/**
 * Election position type definition
 */
export interface ElectionPosition {
  id: string;
  electionId: string;
  name: string;
  description?: string;
  maxCandidates: number;
  maxSelectableCandidates: number;
  candidateIds?: string[];
}

/**
 * Election result type definition
 */
export interface ElectionResult {
  electionId: string;
  positionId: string;
  positionName: string;
  candidates: ElectionResultCandidate[];
  totalVotes: number;
  abstainCount: number;
  winner?: ElectionResultCandidate;
}

/**
 * Election result candidate type definition
 */
export interface ElectionResultCandidate {
  candidateId: string;
  name: string;
  imageUrl?: string;
  voteCount: number;
  percentage: number;
  position?: string;
  id?: string;
  votes?: number;
}

/**
 * Vote type definition
 */
export interface Vote {
  id: string;
  electionId: string;
  positionId: string;
  voterId: string;
  candidateId?: string; // null/undefined if abstained
  timestamp: string;
  isAbstain: boolean;
}

/**
 * Position with candidates type (used in voting form)
 */
export interface PositionWithCandidates {
  id: string;
  name: string;
  description?: string;
  maxSelectableCandidates: number;
  candidates: any[]; // Candidates for this position
}
