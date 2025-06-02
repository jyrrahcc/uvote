
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UploadButton } from "@/components/ui/upload-button";
import { DeveloperForm } from "../../types/developerTypes";

interface DeveloperImageUploadSectionProps {
  form: DeveloperForm;
  setForm: (form: DeveloperForm) => void;
  isSubmitting: boolean;
  onImageUpload: (url: string) => void;
  onImageUploadError: (error: string) => void;
}

const DeveloperImageUploadSection = ({ 
  form, 
  setForm, 
  isSubmitting, 
  onImageUpload, 
  onImageUploadError 
}: DeveloperImageUploadSectionProps) => {
  return (
    <div>
      <Label>Profile Image</Label>
      <div className="space-y-4">
        {form.image_url && (
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={form.image_url} alt="Preview" />
              <AvatarFallback>Preview</AvatarFallback>
            </Avatar>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => setForm({ ...form, image_url: '' })}
              disabled={isSubmitting}
            >
              Remove Image
            </Button>
          </div>
        )}
        <UploadButton
          bucketName="developers"
          folderPath="profile-images"
          onUploadComplete={onImageUpload}
          onUploadError={onImageUploadError}
          accept="image/*"
          maxSizeMB={2}
          buttonText="Upload Profile Image"
          variant="outline"
        />
      </div>
    </div>
  );
};

export default DeveloperImageUploadSection;
