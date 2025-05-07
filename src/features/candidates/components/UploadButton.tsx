
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Image, Upload } from "lucide-react";

interface UploadButtonProps {
  id: string;
  type: 'profile' | 'poster';
  uploading: boolean;
  disabled?: boolean;
  hasPreview: boolean;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPreview: () => void;
}

const UploadButton = ({ 
  id, 
  type, 
  uploading, 
  disabled = false, 
  hasPreview,
  onUpload, 
  onPreview 
}: UploadButtonProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => {
          const fileInput = document.getElementById(id) as HTMLInputElement;
          if (fileInput) fileInput.click();
        }}
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
      
      {hasPreview && (
        <Button
          type="button"
          variant="outline"
          onClick={onPreview}
          disabled={disabled}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}
      
      <Input 
        id={id}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onUpload}
        disabled={uploading || disabled}
      />
    </div>
  );
};

export default UploadButton;
