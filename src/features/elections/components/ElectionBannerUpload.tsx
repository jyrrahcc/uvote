
import { useState, useEffect } from "react";
import { UploadButton } from "@/components/ui/upload-button";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, Plus } from "lucide-react";
import ImagePreviewModal from "@/components/ui/image-preview-modal";

interface ElectionBannerUploadProps {
  banners: string[];
  onChange: (banners: string[]) => void;
  maxBanners?: number;
}

const ElectionBannerUpload = ({
  banners = [],
  onChange,
  maxBanners = 5
}: ElectionBannerUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleUploadComplete = (url: string) => {
    if (banners.length >= maxBanners) {
      toast.warning(`Maximum of ${maxBanners} banners allowed. Please remove some before adding more.`);
      return;
    }
    
    const newBanners = [...banners, url];
    onChange(newBanners);
    toast.success("Banner uploaded successfully");
  };

  const handleRemoveBanner = (index: number) => {
    const newBanners = [...banners];
    newBanners.splice(index, 1);
    onChange(newBanners);
    toast.success("Banner removed");
  };

  const handlePreviewBanner = (url: string) => {
    setPreviewUrl(url);
    setShowPreview(true);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map((banner, index) => (
          <div key={index} className="relative group rounded-md overflow-hidden border border-border">
            <div className="aspect-[16/9] w-full h-full relative">
              <img
                src={banner}
                alt={`Election banner ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                  e.currentTarget.classList.add("p-4");
                }}
              />
            </div>
            
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2">
              <Button
                variant="default"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handlePreviewBanner(banner)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveBanner(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        {banners.length < maxBanners && (
          <div className="border border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 aspect-[16/9]">
            <UploadButton
              bucketName="election-banners"
              folderPath="banners"
              onUploadComplete={handleUploadComplete}
              buttonText="Upload Banner"
              accept="image/png,image/jpeg,image/jpg"
              maxSizeMB={2}
              className="w-full sm:w-auto"
              variant="ghost"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Banner
            </UploadButton>
          </div>
        )}
      </div>
      
      {/* Banner limit information */}
      <p className="text-sm text-muted-foreground">
        {banners.length} of {maxBanners} banners used. Upload images with 16:9 aspect ratio for best results.
      </p>
      
      {/* Preview modal */}
      <ImagePreviewModal
        imageUrl={previewUrl || ""}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
};

export default ElectionBannerUpload;
