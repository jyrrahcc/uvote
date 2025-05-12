
/**
 * Utility functions for handling profile data from Supabase responses
 */

// Define a generic type for profile data that can handle both successful responses and errors
export type ProfileData = {
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
} | null | { [key: string]: any };

export interface Author {
  first_name: string;
  last_name: string;
  image_url: string | null;
}

/**
 * Safely extracts author information from profile data
 * Handles both regular profile objects and Supabase error responses
 */
export const extractAuthor = (profileData: ProfileData): Author => {
  // Check if profileData exists, is an object, and has the expected properties
  const isValidProfileData = 
    profileData && 
    typeof profileData === 'object' &&
    !('code' in profileData) && // Not an error object
    !('message' in profileData) && // Not an error object
    ('first_name' in profileData || 'last_name' in profileData || 'image_url' in profileData);

  return {
    first_name: isValidProfileData && 'first_name' in profileData ? 
      String(profileData.first_name || '') : '',
    last_name: isValidProfileData && 'last_name' in profileData ? 
      String(profileData.last_name || '') : '',
    image_url: isValidProfileData && 'image_url' in profileData ? 
      profileData.image_url : null
  };
};
