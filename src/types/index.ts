
// Export types from candidates.ts
export { 
  CandidateApplication,
  mapDbApplicationToApplication, 
  mapApplicationToDbApplication,
  DbCandidateApplication
} from './candidates';

// Export types from users.ts
export { 
  DlsudProfile, 
  mapDbProfileToProfile 
} from './users';

// Export types from discussions.ts
export {
  Poll,
  PollOption,
  PollVote,
  DbPoll,
  DbPollVote,
  mapDbPollToPoll,
  mapDbPollVoteToPollVote
} from './discussions';

// Election type definition
export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isPrivate: boolean;
  accessCode?: string;
  candidacyStartDate: string;
  candidacyEndDate: string;
  status: 'upcoming' | 'active' | 'completed';
  department?: string;
  colleges?: string[];
  eligibleYearLevels?: string[];
  positions: string[];
  bannerUrls?: string[];
  totalEligibleVoters?: number;
  allowFaculty: boolean;
  restrictVoting?: boolean;
}

// Candidate type definition
export interface Candidate {
  id: string;
  name: string;
  position: string;
  bio?: string;
  imageUrl?: string;
  electionId?: string;
  createdAt?: string;
  createdBy?: string;
  department?: string;
  yearLevel?: string;
  isFaculty?: boolean;
  facultyPosition?: string;
  studentId?: string;
}

/**
 * Maps database election data to app election object
 */
export const mapDbElectionToElection = (dbElection: any): Election => ({
  id: dbElection.id,
  title: dbElection.title,
  description: dbElection.description || '',
  startDate: dbElection.start_date,
  endDate: dbElection.end_date,
  createdBy: dbElection.created_by || '',
  createdAt: dbElection.created_at || '',
  updatedAt: dbElection.updated_at || '',
  isPrivate: dbElection.is_private || false,
  accessCode: dbElection.access_code,
  candidacyStartDate: dbElection.candidacy_start_date || '',
  candidacyEndDate: dbElection.candidacy_end_date || '',
  status: dbElection.status as 'upcoming' | 'active' | 'completed',
  department: dbElection.department || '',
  colleges: Array.isArray(dbElection.departments) 
    ? dbElection.departments 
    : dbElection.department 
      ? [dbElection.department] 
      : [],
  eligibleYearLevels: Array.isArray(dbElection.eligible_year_levels) 
    ? dbElection.eligible_year_levels 
    : [],
  positions: Array.isArray(dbElection.positions) ? dbElection.positions : [],
  bannerUrls: Array.isArray(dbElection.banner_urls) ? dbElection.banner_urls : [],
  totalEligibleVoters: dbElection.total_eligible_voters,
  allowFaculty: dbElection.allow_faculty || false,
  restrictVoting: dbElection.restrict_voting || false
});

// Vote type definition
export interface Vote {
  id: string;
  electionId: string;
  userId: string;
  timestamp: string;
}

/**
 * Maps database vote data to app vote object
 */
export const mapDbVoteToVote = (dbVote: any): Vote => ({
  id: dbVote.id,
  electionId: dbVote.election_id,
  userId: dbVote.user_id,
  timestamp: dbVote.timestamp
});

// Vote candidates type definition
export interface VoteCandidate {
  id: string;
  voteId: string;
  candidateId: string;
  position: string;
  timestamp: string;
}

/**
 * Maps database vote candidate data to app vote candidate object
 */
export const mapDbVoteCandidateToVoteCandidate = (dbVoteCandidate: any): VoteCandidate => ({
  id: dbVoteCandidate.id,
  voteId: dbVoteCandidate.vote_id,
  candidateId: dbVoteCandidate.candidate_id,
  position: dbVoteCandidate.position,
  timestamp: dbVoteCandidate.timestamp
});

/**
 * Maps database candidate data to app candidate object
 */
export const mapDbCandidateToCandidate = (dbCandidate: any): Candidate => ({
  id: dbCandidate.id,
  name: dbCandidate.name,
  position: dbCandidate.position,
  bio: dbCandidate.bio || '',
  imageUrl: dbCandidate.image_url,
  electionId: dbCandidate.election_id,
  createdAt: dbCandidate.created_at,
  createdBy: dbCandidate.created_by,
  department: dbCandidate.department,
  yearLevel: dbCandidate.year_level,
  isFaculty: dbCandidate.is_faculty || false,
  facultyPosition: dbCandidate.faculty_position,
  studentId: dbCandidate.student_id
});
