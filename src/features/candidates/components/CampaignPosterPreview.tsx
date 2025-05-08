
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteFileFromStorage } from "@/utils/fileUploadUtils";

interface CampaignPosterPreviewProps {
  imageUrl: string;
  onRemove: () => void;
  bucketName: string;
  filePath?: string | null;
  className?: string;
}

const CampaignPosterPreview = ({
  imageUrl,
  onRemove,
  bucketName,
  filePath,
  className = ""
}: CampaignPosterPreviewProps) => {
  const [isRemoving, setIsRemoving] = useState(false);
  
  const handleRemove = async () => {
    setIsRemoving(true);
    
    try {
      // If we have the file path, we can delete it from storage
      if (filePath) {
        await deleteFileFromStorage(filePath, bucketName);
      }
      
      onRemove();
    } catch (error) {
      console.error("Error removing image:", error);
    } finally {
      setIsRemoving(false);
    }
  };
  
  return (
    <div className={`relative group rounded-md overflow-hidden border border-border ${className}`}>
      <div className="aspect-[16/9] w-full h-full relative">
        <img
          src={imageUrl}
          alt="Campaign poster preview"
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
        <Button
          variant="destructive"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleRemove}
          disabled={isRemoving}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CampaignPosterPreview;
