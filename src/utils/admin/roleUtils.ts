/**
 * Check if user has permission to verify profiles
 * @param isAdmin Boolean indicating if the user has admin role
 * @returns Boolean indicating if the user can verify profiles
 */
export const canVerifyProfiles = (isAdmin: boolean): boolean => {
  return isAdmin;
};

// Additional helper functions for role management
export const isValidRole = (role: string): boolean => {
  return ['admin', 'voter'].includes(role);
};
