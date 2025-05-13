
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
