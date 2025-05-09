
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UploadProgress {
  progress: number;
  bytesUploaded?: number;
  totalBytes?: number;
}

/**
 * Ensures the specified bucket exists, creating it if necessary
 */
export const ensureBucketExists = async (bucketName: string, options = { 
  public: true, 
  fileSizeLimit: 5 * 1024 * 1024 // 5MB default
}): Promise<boolean> => {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error(`Error listing buckets:`, listError);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(bucketName, options);
      
      if (createError) {
        console.error(`Error creating bucket ${bucketName}:`, createError);
        return false;
      }
      console.log(`Successfully created bucket: ${bucketName}`);
    }
    
    return true;
  } catch (e) {
    console.error(`Error in ensureBucketExists for ${bucketName}:`, e);
    return false;
  }
};

/**
 * Uploads a file to storage and returns the public URL
 */
export const uploadFileToStorage = async (
  file: File,
  bucketName: string,
  folderPath: string = "",
  onProgress?: (progress: UploadProgress) => void
): Promise<{ url: string | null; error: string | null }> => {
  try {
    // Ensure bucket exists
    const bucketReady = await ensureBucketExists(bucketName);
    
    if (!bucketReady) {
      return { 
        url: null, 
        error: `Storage bucket ${bucketName} could not be accessed` 
      };
    }
    
    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    
    // Create the file path
    const filePath = folderPath 
      ? `${folderPath.replace(/^\/|\/$/g, '')}/${fileName}`
      : fileName;
    
    // Upload file
    const { error: uploadError, data } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        onUploadProgress: (progress) => {
          if (onProgress) {
            onProgress({
              progress: Math.round((progress.loaded / progress.total) * 100),
              bytesUploaded: progress.loaded,
              totalBytes: progress.total
            });
          }
        }
      });
      
    if (uploadError) {
      console.error("Upload error:", uploadError);
      return { url: null, error: uploadError.message };
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    if (!urlData || !urlData.publicUrl) {
      return { url: null, error: 'Could not get public URL' };
    }
    
    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    console.error("Error in uploadFileToStorage:", error);
    return { 
      url: null, 
      error: error instanceof Error ? error.message : 'Unknown error during file upload'
    };
  }
};

/**
 * Deletes a file from storage
 */
export const deleteFileFromStorage = async (
  filePath: string,
  bucketName: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
    
    if (error) {
      console.error("Delete error:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error in deleteFileFromStorage:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error during file deletion'
    };
  }
};
