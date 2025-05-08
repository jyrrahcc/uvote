
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export interface UploadProgress {
  progress: number;
  bytesUploaded: number;
  totalBytes: number;
}

export interface UploadResult {
  url: string | null;
  filePath: string | null;
  error: string | null;
}

/**
 * Uploads a file to Supabase storage
 * @param file The file to upload
 * @param bucketName The name of the storage bucket
 * @param folderPath Optional folder path within the bucket
 * @param onProgress Optional callback for upload progress
 * @returns UploadResult object with url, filePath, and error properties
 */
export const uploadFileToStorage = async (
  file: File,
  bucketName: string,
  folderPath: string = '',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  try {
    // Generate a unique file name to prevent collisions
    const fileExt = file.name.split('.').pop() || '';
    const fileName = `${uuidv4()}.${fileExt}`;
    
    // Create the full file path
    const filePath = folderPath 
      ? `${folderPath}/${fileName}`.replace(/\/+/g, '/') // Normalize path with single forward slashes
      : fileName;
    
    // Upload the file with progress tracking
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    // If there's an error during upload
    if (error) {
      console.error('Error uploading file:', error);
      return {
        url: null,
        filePath: null,
        error: error.message
      };
    }
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data?.path || '');
    
    return {
      url: publicUrl,
      filePath: data?.path || null,
      error: null
    };
    
  } catch (error) {
    console.error('Error in uploadFileToStorage:', error);
    return {
      url: null,
      filePath: null,
      error: error instanceof Error ? error.message : 'Unknown error during file upload'
    };
  }
};

/**
 * Deletes a file from Supabase storage
 * @param filePath The path of the file to delete
 * @param bucketName The name of the storage bucket
 * @returns boolean indicating success or failure
 */
export const deleteFileFromStorage = async (
  filePath: string,
  bucketName: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteFileFromStorage:', error);
    return false;
  }
};
