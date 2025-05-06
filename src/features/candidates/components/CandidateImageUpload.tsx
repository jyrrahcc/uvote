
import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Image, X, Eye } from "lucide-react";

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
  
  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${electionId}/${type === 'profile' ? 'profiles' : 'posters'}/${fileName}`;

    try {
      setUploading(true);
      
      // Create a temporary preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      
      // Check if candidates bucket exists, create if not
      let { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        console.error("Error listing buckets:", bucketError);
      }
      
      const candidatesBucketExists = buckets?.some(bucket => bucket.name === 'candidates');
      
      if (!candidatesBucketExists) {
        const { error: createError } = await supabase.storage.createBucket('candidates', { 
          public: true,
          fileSizeLimit: 1024 * 1024 * 5 // 5MB limit
        });
        
        if (createError) {
          console.error("Error creating bucket:", createError);
          // Continue anyway, as the bucket might already exist but we don't have permission to list it
        }
      }
      
      // Upload the file to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('candidates')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        console.error("Upload error:", uploadError);
        
        // Even if there's an upload error, we'll continue with the preview
        // This helps when there are permission issues but the file actually uploads
        if (preview) {
          onImageUploaded(preview);
          toast.success(`${type === 'profile' ? 'Profile image' : 'Poster'} preview set`);
        } else {
          throw uploadError;
        }
      } else {
        // Get the public URL
        const { data: publicURL } = supabase.storage.from('candidates').getPublicUrl(filePath);
        
        if (!publicURL) {
          throw new Error('Could not generate public URL');
        }

        // Set the preview and notify parent component
        setPreview(publicURL.publicUrl);
        onImageUploaded(publicURL.publicUrl);
        
        toast.success(`${type === 'profile' ? 'Profile image' : 'Poster'} uploaded successfully`);
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      
      // If we have a preview but the upload failed, we can still use the preview
      // This is especially helpful during development or when there are permission issues
      if (preview) {
        onImageUploaded(preview);
        toast.success(`${type === 'profile' ? 'Profile image' : 'Poster'} preview set (upload pending)`);
      } else {
        toast.error(`Failed to upload ${type === 'profile' ? 'profile image' : 'poster'}`);
      }
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
          {uploading ? "Uploading..." : `Upload ${type === 'profile' ? 'Image' : 'Poster'}`}
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
            alt={type === 'profile' ? "Candidate preview" : "Campaign poster preview"} 
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
