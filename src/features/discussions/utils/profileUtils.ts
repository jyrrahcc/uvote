
/**
 * Safely extracts author information from profile data
 */
export const extractAuthor = (profileData: any) => {
  if (!profileData) return undefined;
  
  return {
    first_name: profileData.first_name || '',
    last_name: profileData.last_name || '',
    image_url: profileData.image_url || null
  };
};

/**
 * Generates initials from a user's first and last name
 */
export const getInitials = (firstName: string = '', lastName: string = '') => {
  const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
  
  return firstInitial + lastInitial || 'U'; // Return 'U' for Unknown if no initials are available
};
