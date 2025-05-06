
/**
 * Utility functions for image upload
 */

/**
 * Uploads an image file and returns the URL
 * 
 * This is a simple implementation that converts the file to a base64 data URL.
 * In a production environment, you would typically upload to a storage service like Supabase Storage.
 */
export const uploadImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
