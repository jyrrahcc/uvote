
import { supabase } from "@/integrations/supabase/client";

export interface UploadProgress {
  progress: number;
  bytesUploaded: number;
  totalBytes: number;
}

export interface UploadResult {
  url: string | null;
  error: Error | null;
  path?: string;
}

/**
 * Uploads a file to Supabase storage and returns the public URL
 */
export const uploadFileToStorage = async (
  file: File,
  bucketName: string,
  folderPath: string = '',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  try {
    // Generate a unique file name to avoid collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    // Create the full path including the folder if provided
    const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
    
    console.log(`Uploading ${file.name} to ${bucketName}/${filePath}`);

    // Upload file to storage without using the problematic onUploadProgress option
    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    // If there's a progress callback, simulate progress update when complete
    if (onProgress) {
      onProgress({
        progress: 100,
        bytesUploaded: file.size,
        totalBytes: file.size
      });
    }

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return { url: null, error: uploadError };
    }

    // Get the public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data?.path || filePath);

    if (!publicUrlData?.publicUrl) {
      const error = new Error('Failed to get public URL');
      console.error(error);
      return { url: null, error };
    }

    console.log(`File uploaded successfully. Public URL: ${publicUrlData.publicUrl}`);
    return { url: publicUrlData.publicUrl, error: null, path: data?.path || filePath };

  } catch (error) {
    console.error("Unexpected error during file upload:", error);
    return { 
      url: null, 
      error: error instanceof Error ? error : new Error('Unknown error during upload') 
    };
  }
};

/**
 * Deletes a file from Supabase storage
 */
export const deleteFileFromStorage = async (
  filePath: string,
  bucketName: string
): Promise<{ error: Error | null }> => {
  try {
    console.log(`Deleting file ${filePath} from ${bucketName}`);
    
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
    
    if (error) {
      console.error("Error deleting file:", error);
      return { error };
    }
    
    console.log(`File deleted successfully`);
    return { error: null };
  } catch (error) {
    console.error("Unexpected error during file deletion:", error);
    return { 
      error: error instanceof Error ? error : new Error('Unknown error during deletion') 
    };
  }
};
