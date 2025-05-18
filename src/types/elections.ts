
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
