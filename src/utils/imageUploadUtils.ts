
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
 * Uploads a file to Supabase storage and returns the public URL
 */
export const uploadFile = async (
  bucketName: string,
  filePath: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string | null; error: Error | null }> => {
  try {
    // Ensure bucket exists
    const bucketReady = await ensureBucketExists(bucketName);
    
    if (!bucketReady) {
      return { 
        url: null, 
        error: new Error(`Storage bucket ${bucketName} could not be accessed`) 
      };
    }
    
    // Upload file
    const { error: uploadError, data } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (uploadError) {
      console.error("Upload error:", uploadError);
      return { url: null, error: uploadError };
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    if (!urlData || !urlData.publicUrl) {
      return { url: null, error: new Error('Could not get public URL') };
    }
    
    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    console.error("Error in uploadFile:", error);
    return { 
      url: null, 
      error: error instanceof Error ? error : new Error('Unknown error during file upload') 
    };
  }
};
