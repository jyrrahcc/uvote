
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Interface for upload progress
 */
export interface UploadProgress {
  progress: number;
  isPending: boolean;
  isComplete: boolean;
  error: string | null;
}

/**
 * Interface for upload result
 */
export interface UploadResult {
  path: string | null;
  url: string | null;
  error: string | null;
}

/**
 * Upload a file to Supabase Storage
 */
export const uploadFileToStorage = async (
  file: File,
  bucketName: string,
  folderPath: string = "",
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  if (!file) {
    return { path: null, url: null, error: "No file provided" };
  }

  try {
    // Generate a unique file name to prevent collisions
    const uniquePrefix = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const filePath = folderPath 
      ? `${folderPath}/${uniquePrefix}_${file.name}` 
      : `${uniquePrefix}_${file.name}`;
    
    // Notify start
    if (onProgress) {
      onProgress({ progress: 0, isPending: true, isComplete: false, error: null });
    }

    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        onUploadProgress: (progress) => {
          if (onProgress) {
            const percent = progress.percent ? Math.round(progress.percent) : 0;
            onProgress({ 
              progress: percent, 
              isPending: percent < 100, 
              isComplete: percent === 100,
              error: null
            });
          }
        }
      });

    if (error) {
      console.error("Error uploading file:", error);
      if (onProgress) {
        onProgress({ progress: 0, isPending: false, isComplete: false, error: error.message });
      }
      return { path: null, url: null, error: error.message };
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    // Upload complete
    if (onProgress) {
      onProgress({ progress: 100, isPending: false, isComplete: true, error: null });
    }

    return { path: data.path, url: publicUrl, error: null };
  } catch (error) {
    console.error("Exception during file upload:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to upload file";
    if (onProgress) {
      onProgress({ progress: 0, isPending: false, isComplete: false, error: errorMessage });
    }
    return { path: null, url: null, error: errorMessage };
  }
};

/**
 * Delete a file from Supabase Storage
 */
export const deleteFileFromStorage = async (
  path: string,
  bucketName: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([path]);

    if (error) {
      console.error("Error deleting file:", error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Exception during file deletion:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete file";
    return { success: false, error: errorMessage };
  }
};

/**
 * Get a public URL for a file in Supabase Storage
 */
export const getPublicUrl = (path: string, bucketName: string): string => {
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(path);
  
  return data.publicUrl;
};

/**
 * Check if a file exists in Supabase Storage
 */
export const checkFileExists = async (
  path: string,
  bucketName: string
): Promise<boolean> => {
  try {
    // Try to get the file metadata
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(path, 60);
    
    // If there's no error and we got data, the file exists
    return !error && !!data;
  } catch {
    return false;
  }
};

/**
 * Helper function to format file size
 */
export const formatFileSize = (sizeInBytes: number): string => {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} bytes`;
  } else if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(2)} KB`;
  } else {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
  }
};
