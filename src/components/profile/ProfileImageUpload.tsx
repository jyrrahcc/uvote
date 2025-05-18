
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Camera, User } from "lucide-react";
import { DlsudProfile } from "@/types";

interface ProfileImageUploadProps {
  profile: DlsudProfile | null;
  onImageUpdate: (imageUrl: string) => void;
  isVerified?: boolean;
}

const ProfileImageUpload = ({ profile, onImageUpdate, isVerified = false }: ProfileImageUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      // Prevent upload if profile is verified
      if (isVerified) {
        toast.info("Profile is verified and image cannot be changed", {
          description: "Contact an administrator if you need to update your profile image."
        });
        return;
      }
      
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      if (!profile?.id) {
        toast.error("User profile not found");
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile.id}/profile-image.${fileExt}`;
      
      // Check file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image too large", {
          description: "Please select an image less than 2MB"
        });
        return;
      }
      
      // Check file type
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        toast.error("Invalid file type", {
          description: "Please select a JPEG, PNG or GIF image"
        });
        return;
      }

      // Upload the file to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
        
      if (!urlData?.publicUrl) {
        throw new Error("Could not get image URL");
      }
      
      // Update the user's profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          image_url: urlData.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);
        
      if (updateError) {
        throw updateError;
      }
      
      // Update local state
      onImageUpdate(urlData.publicUrl);
      
      toast.success("Profile image updated successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mb-6 space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24 border-2 border-border">
          <AvatarImage src={profile?.image_url || undefined} />
          <AvatarFallback className="bg-primary/10">
            <User className="h-12 w-12 text-primary/80" />
          </AvatarFallback>
        </Avatar>
        
        {!isVerified && (
          <label 
            htmlFor="profile-image-upload"
            className="absolute bottom-0 right-0 rounded-full bg-primary p-1 cursor-pointer shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Camera className="h-4 w-4 text-white" />
            <span className="sr-only">Upload profile picture</span>
          </label>
        )}
        
        <input 
          id="profile-image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={uploadImage}
          disabled={uploading || isVerified}
        />
      </div>
      
      {uploading && (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-t-transparent border-current"></div>
          <span>Uploading...</span>
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpload;
