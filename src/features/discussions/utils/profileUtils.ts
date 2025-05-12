
/**
 * Utility functions for handling profile data from Supabase responses
 */

type ProfileData = {
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
} | null;

export interface Author {
  first_name: string;
  last_name: string;
  image_url: string | null;
}

/**
 * Safely extracts author information from profile data
 */
export const extractAuthor = (profileData: ProfileData): Author => {
  return {
    first_name: profileData && 
      typeof profileData === 'object' && 
      'first_name' in profileData ? 
      String(profileData.first_name || '') : '',
    last_name: profileData && 
      typeof profileData === 'object' && 
      'last_name' in profileData ? 
      String(profileData.last_name || '') : '',
    image_url: profileData && 
      typeof profileData === 'object' && 
      'image_url' in profileData ? 
      profileData.image_url : null
  };
};
