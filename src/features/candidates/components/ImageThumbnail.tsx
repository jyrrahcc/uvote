
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ImageThumbnailProps {
  imageUrl: string;
  disabled?: boolean;
  onRemove: () => void;
}

const ImageThumbnail = ({ imageUrl, disabled = false, onRemove }: ImageThumbnailProps) => {
  return (
    <div className="mt-2 relative w-full h-48 border rounded-md overflow-hidden">
      <img 
        src={imageUrl} 
        alt="Campaign poster preview" 
        className="w-full h-full object-cover"
        onError={(e) => {
          // If image fails to load, set a placeholder
          e.currentTarget.src = "/placeholder.svg";
          e.currentTarget.classList.add("p-4");
        }}
      />
      {!disabled && (
        <Button 
          variant="destructive" 
          size="icon" 
          className="absolute top-2 right-2 h-7 w-7"
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

export default ImageThumbnail;
