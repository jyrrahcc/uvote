import { useState, ChangeEvent, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context/AuthContext";
import { uploadFile } from "@/utils/imageUploadUtils";
import UploadButton from "./UploadButton";
import ImageThumbnail from "./ImageThumbnail";
import ImagePreviewModal from "@/components/ui/image-preview-modal";
import { supabase } from "@/integrations/supabase/client";

interface CandidateImageUploadProps {
  electionId: string;
  type: 'profile' | 'poster';
  imageUrl: string | null;
  onImageUploaded: (url: string) => void;
  disabled?: boolean;
}

const CandidateImageUpload = ({ 
  electionId, 
  type, 
  imageUrl, 
  onImageUploaded, 
  disabled = false 
}: CandidateImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(imageUrl);
  const [showPreview, setShowPreview] = useState(false);
  const { user } = useAuth();

  // Initialize preview from imageUrl prop when it changes
  useEffect(() => {
    if (imageUrl && imageUrl !== preview) {
      setPreview(imageUrl);
    }
  }, [imageUrl]);

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${electionId}/${type === 'profile' ? 'profiles' : 'posters'}/${fileName}`;

    try {
      setUploading(true);
      
      // Create a temporary preview URL for immediate feedback
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      
      // Check if candidates bucket exists, create if not
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.find(bucket => bucket.name === 'candidates')) {
        await supabase.storage.createBucket('candidates', { 
          public: true,
          fileSizeLimit: 1024 * 1024 * 5 // 5MB limit
        });
      }
      
      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('candidates')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error("Upload error:", error);
        toast.warning(`Using preview image - ${error.message}`);
        // Keep the preview but notify user of upload issue
        onImageUploaded(objectUrl);
      } else {
        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from('candidates')
          .getPublicUrl(filePath);
        
        if (publicUrlData?.publicUrl) {
          setPreview(publicUrlData.publicUrl);
          onImageUploaded(publicUrlData.publicUrl);
          toast.success(`Campaign poster uploaded successfully`);
        } else {
          console.error("Failed to get public URL");
          // Keep the preview but notify user
          onImageUploaded(objectUrl);
          toast.warning("Using preview image - Unable to get permanent URL");
        }
      }
    } catch (error) {
      console.error("Error in handleImageUpload:", error);
      // Keep local preview mode even if upload fails
      onImageUploaded(preview || "");
      toast.warning("Using preview image - Upload issue occurred");
    } finally {
      setUploading(false);
    }
  };
  
  const handleRemoveImage = () => {
    setPreview(null);
    onImageUploaded("");
  };

  const handlePreviewImage = () => {
    if (preview) {
      setShowPreview(true);
    }
  };

  const uploadButtonId = `${type}-upload-${electionId}`;

  return (
    <div className="space-y-2">
      <UploadButton
        id={uploadButtonId}
        type={type}
        uploading={uploading}
        disabled={disabled}
        hasPreview={!!preview}
        onUpload={handleImageUpload}
        onPreview={handlePreviewImage}
      />
      
      {preview && (
        <ImageThumbnail 
          imageUrl={preview}
          disabled={disabled}
          onRemove={handleRemoveImage}
        />
      )}
      
      <ImagePreviewModal
        imageUrl={preview || ''}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
};

export default CandidateImageUpload;
