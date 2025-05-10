
import { toast } from "sonner";

/**
 * Utility functions for handling roles and permissions
 */

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

/**
 * Check if a user can verify or revoke profile verification 
 * 
 * @param isAdmin Whether the user has admin role
 * @param showMessage Whether to show a toast message if not allowed
 * @returns Boolean indicating if user can verify profiles
 */
export const canVerifyProfiles = (isAdmin: boolean, showMessage: boolean = true): boolean => {
  if (!isAdmin && showMessage) {
    toast.error("You don't have permission to verify profiles", {
      description: "Only administrators can verify or revoke profile verification."
    });
  }
  return isAdmin;
};
