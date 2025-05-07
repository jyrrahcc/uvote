
import { useState, ChangeEvent, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context/AuthContext";
import { uploadFile } from "@/utils/imageUploadUtils";
import UploadButton from "./UploadButton";
import ImageThumbnail from "./ImageThumbnail";
import ImagePreviewModal from "@/components/ui/image-preview-modal";

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
      
      // Set the preview immediately to improve user experience
      onImageUploaded(objectUrl);
      
      // Upload file to Supabase storage
      const { url, error } = await uploadFile('candidates', filePath, file);
      
      if (error) {
        console.error("Upload error:", error);
        toast.warning(`Using preview mode - ${error.message}`);
      } else if (url) {
        // Replace the object URL with the permanent one
        setPreview(url);
        onImageUploaded(url);
        toast.success(`Campaign poster uploaded successfully`);
      }
    } catch (error) {
      console.error("Error in handleImageUpload:", error);
      toast.warning("Using preview mode due to upload issue");
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
