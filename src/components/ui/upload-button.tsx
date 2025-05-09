
import { useState, useRef } from "react";
import { Button } from "./button";
import { Progress } from "./progress";
import { toast } from "sonner";
import { UploadProgress, uploadFileToStorage } from "@/utils/fileUploadUtils";
import { Loader2, Upload, X } from "lucide-react";

export interface UploadButtonProps {
  bucketName: string;
  folderPath?: string;
  onUploadComplete: (url: string) => void;
  onUploadError?: (error: string) => void;
  accept?: string;
  maxSizeMB?: number;
  buttonText?: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const UploadButton = ({
  bucketName,
  folderPath = "",
  onUploadComplete,
  onUploadError,
  accept = "image/*",
  maxSizeMB = 5, // Default to 5MB
  buttonText = "Upload File",
  className,
  variant = "outline",
  size = "default"
}: UploadButtonProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  
  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    console.log(`Selected file: ${file.name} (${file.size} bytes)`);
    
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const errorMessage = `File size exceeds ${maxSizeMB}MB limit.`;
      console.error(errorMessage);
      toast.error(errorMessage);
      if (onUploadError) onUploadError(errorMessage);
      return;
    }
    
    setIsUploading(true);
    console.log(`Starting upload to bucket: ${bucketName}`);
    
    try {
      const result = await uploadFileToStorage(
        file, 
        bucketName, 
        folderPath,
        (progress) => {
          console.log(`Upload progress: ${progress.progress}%`);
          setUploadProgress(progress);
        }
      );
      
      if (result.error || !result.url) {
        const errorMessage = result.error || "Upload failed";
        console.error(errorMessage);
        toast.error(errorMessage);
        if (onUploadError) onUploadError(errorMessage);
      } else {
        console.log(`File uploaded successfully. URL: ${result.url}`);
        toast.success("File uploaded successfully");
        onUploadComplete(result.url);
      }
    } catch (error) {
      console.error("Error in upload:", error);
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      toast.error(errorMessage);
      if (onUploadError) onUploadError(errorMessage);
    } finally {
      setIsUploading(false);
      // Reset the input value to allow uploading the same file again
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };
  
  const cancelUpload = () => {
    // There's no direct way to cancel an in-progress Supabase upload
    // But we can reset the state
    if (isUploading) {
      toast.info("Upload cancelled");
      setIsUploading(false);
      setUploadProgress(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };
  
  return (
    <div className="w-full space-y-2">
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      
      {isUploading ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Uploading... {uploadProgress?.progress || 0}%
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={cancelUpload}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cancel</span>
            </Button>
          </div>
          <Progress value={uploadProgress?.progress || 0} />
        </div>
      ) : (
        <Button 
          type="button" 
          onClick={handleClick} 
          className={className}
          variant={variant}
          size={size}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {buttonText}
        </Button>
      )}
    </div>
  );
};
