
import { useState, ChangeEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Image, X, Eye } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";

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
  
  const ensureCandidatesBucket = async () => {
    try {
      // First check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error("Error listing buckets:", listError);
        return false;
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === 'candidates');
      
      if (!bucketExists) {
        const { error: createError } = await supabase.storage.createBucket('candidates', {
          public: true,
          fileSizeLimit: 5 * 1024 * 1024 // 5MB
        });
        
        if (createError) {
          console.error("Error creating bucket:", createError);
          return false;
        }
      }
      
      return true;
    } catch (e) {
      console.error("Error in ensureCandidatesBucket:", e);
      return false;
    }
  };

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
      
      // Ensure the bucket exists
      const bucketReady = await ensureCandidatesBucket();
      
      if (!bucketReady) {
        toast.warning("Storage setup incomplete, using preview mode");
        return; // Still continue with the preview
      }
      
      // Upload the file
      const { error: uploadError, data } = await supabase.storage
        .from('candidates')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.warning(`Using preview mode - ${uploadError.message}`);
      } else {
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('candidates')
          .getPublicUrl(filePath);
        
        if (urlData && urlData.publicUrl) {
          // Replace the object URL with the permanent one
          setPreview(urlData.publicUrl);
          onImageUploaded(urlData.publicUrl);
          toast.success(`Campaign poster uploaded successfully`);
        }
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

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => document.getElementById(`${type}-upload-${electionId}`)?.click()}
          disabled={uploading || disabled}
          className="w-full"
        >
          {type === 'profile' ? (
            <Upload className="h-4 w-4 mr-2" />
          ) : (
            <Image className="h-4 w-4 mr-2" />
          )}
          {uploading ? "Uploading..." : `Upload Campaign Poster`}
        </Button>
        
        {preview && (
          <Button
            type="button"
            variant="outline"
            onClick={handlePreviewImage}
            disabled={disabled}
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
        
        <Input 
          id={`${type}-upload-${electionId}`}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
          disabled={uploading || disabled}
        />
      </div>
      
      {preview && (
        <div className="mt-2 relative w-full h-48 border rounded-md overflow-hidden">
          <img 
            src={preview} 
            alt="Campaign poster preview" 
            className="w-full h-full object-cover"
          />
          {!disabled && (
            <Button 
              variant="destructive" 
              size="icon" 
              className="absolute top-2 right-2 h-7 w-7"
              onClick={handleRemoveImage}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
      
      {/* Image Preview Modal */}
      {showPreview && preview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowPreview(false)}>
          <div className="bg-white p-2 rounded-lg max-w-3xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="absolute top-2 right-2 z-10"
              onClick={() => setShowPreview(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <img 
              src={preview} 
              alt="Preview" 
              className="max-w-full max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateImageUpload;
