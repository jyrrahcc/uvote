
import { toast } from "sonner";

/**
 * Check if user has permission to verify profiles
 * @param isAdmin Boolean indicating if the user has admin role
 * @returns Boolean indicating if the user can verify profiles
 */
export const canVerifyProfiles = (isAdmin: boolean): boolean => {
  return isAdmin;
};

/**
 * Check if a user can register as a candidate
 * 
 * @param isVoter Whether the user has voter role
 * @param showMessage Whether to show a toast message if not allowed
 * @returns Boolean indicating if user can register
 */
export const canRegisterAsCandidate = (isVoter: boolean, showMessage: boolean = true): boolean => {
  if (!isVoter && showMessage) {
    toast.error("You must verify your profile to register as a candidate", {
      description: "Only verified users with voter privileges can register as candidates."
    });
  }
  return isVoter;
};

/**
 * Check if a user can vote in an election
 * 
 * @param isVoter Whether the user has voter role
 * @param showMessage Whether to show a toast message if not allowed
 * @returns Boolean indicating if user can vote
 */
export const canVoteInElection = (isVoter: boolean, showMessage: boolean = true): boolean => {
  if (!isVoter && showMessage) {
    toast.error("You must verify your profile to vote in this election", {
      description: "Only verified users with voter privileges can cast votes in elections."
    });
  }
  return isVoter;
};

// Additional helper functions for role management
export const isValidRole = (role: string): boolean => {
  return ['admin', 'voter'].includes(role);
};
