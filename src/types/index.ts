
/**
 * Core types for the uVote application
 */

/**
 * User type representing registered users
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'voter';
  createdAt: string;
}

/**
 * Election type representing a voting event
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
 * Candidate type representing someone who can be voted for
 */
export interface Candidate {
  id: string;
  name: string;
  bio: string;
  imageUrl?: string;
  electionId: string;
  position: string;
  votes?: number;
}

/**
 * Vote type representing a cast vote
 */
export interface Vote {
  id: string;
  electionId: string;
  candidateId: string;
  userId: string;
  timestamp: string;
}

/**
 * ElectionResult type representing the outcome of an election
 */
export interface ElectionResult {
  electionId: string;
  candidates: Array<{
    id: string;
    name: string;
    votes: number;
    percentage: number;
  }>;
  totalVotes: number;
  winner?: {
    id: string;
    name: string;
    votes: number;
    percentage: number;
  };
}

/**
 * NotificationType for system messages
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * Notification interface for system messages
 */
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
}

/**
 * UserRole type for RBAC
 */
export type UserRole = 'admin' | 'voter';
