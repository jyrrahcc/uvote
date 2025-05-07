
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useEffect } from "react";

interface ImagePreviewModalProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

const ImagePreviewModal = ({ imageUrl, isOpen, onClose }: ImagePreviewModalProps) => {
  // Close on escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    // Prevent body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" 
      onClick={onClose}
    >
      <div 
        className="bg-white p-2 rounded-lg max-w-3xl max-h-[90vh] relative" 
        onClick={(e) => e.stopPropagation()}
      >
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
          onError={(e) => {
            // If image fails to load, set a placeholder
            e.currentTarget.src = "/placeholder.svg";
            e.currentTarget.classList.add("p-4");
          }}
        />
      </div>
    </div>
  );
};

export default ImagePreviewModal;
