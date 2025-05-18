import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ImageIcon, Upload } from "lucide-react";

interface ProfileImageUploadProps {
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl?: string;
    studentId?: string;
    department?: string;
    yearLevel?: string;
    isFaculty?: boolean;
    facultyPosition?: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  onUpdateProfile: (imageUrl: string) => void;
}

const ProfileImageUpload = ({ profile, onUpdateProfile }: ProfileImageUploadProps) => {
  const imageUrl = profile?.imageUrl;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUpdateProfile(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <Avatar className="h-32 w-32">
        {imageUrl ? (
          <AvatarImage src={imageUrl} alt="Profile Image" />
        ) : (
          <AvatarFallback>
            <ImageIcon className="h-6 w-6" />
          </AvatarFallback>
        )}
      </Avatar>
      <div className="mt-4">
        <input
          type="file"
          id="imageUpload"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <label htmlFor="imageUpload">
          <Button asChild variant="secondary">
            <Upload className="mr-2 h-4 w-4" />
            <span>Upload Image</span>
          </Button>
        </label>
      </div>
    </div>
  );
};

export default ProfileImageUpload;
