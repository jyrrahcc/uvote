
import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Image, X } from "lucide-react";

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
      
      // Check if candidates bucket exists, create if not
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.find(bucket => bucket.name === 'candidates')) {
        await supabase.storage.createBucket('candidates', { public: true });
      }
      
      // Upload the file to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('candidates')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: publicURL } = supabase.storage.from('candidates').getPublicUrl(filePath);
      
      if (!publicURL) {
        throw new Error('Could not generate public URL');
      }

      // Set the preview and notify parent component
      setPreview(publicURL.publicUrl);
      onImageUploaded(publicURL.publicUrl);
      
      toast.success(`${type === 'profile' ? 'Profile image' : 'Poster'} uploaded successfully`);
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(`Failed to upload ${type === 'profile' ? 'profile image' : 'poster'}`);
    } finally {
      setUploading(false);
    }
  };
  
  const handleRemoveImage = () => {
    setPreview(null);
    onImageUploaded("");
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
    </div>
  );
};

export default CandidateImageUpload;
