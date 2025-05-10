
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ImagePreviewModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

const ImagePreviewModal = ({ imageUrl, onClose }: ImagePreviewModalProps) => {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-2 rounded-lg max-w-3xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="absolute top-2 right-2 z-10"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <img 
          src={imageUrl} 
          alt="Preview" 
          className="max-w-full max-h-[85vh] object-contain"
        />
      </div>
    </div>
  );
};

export default ImagePreviewModal;
