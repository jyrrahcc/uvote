
import { useState, useEffect } from "react";
import { UploadButton } from "@/components/ui/upload-button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import ImagePreviewModal from "@/components/ui/image-preview-modal";
import { Button } from "@/components/ui/button";
import { X, Eye } from "lucide-react";

interface CampaignPosterUploadProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const CampaignPosterUpload = ({
  value,
  onChange,
  error
}: CampaignPosterUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [showPreview, setShowPreview] = useState(false);
  const [filePath, setFilePath] = useState<string | null>(null);
  
  // Extract file path from URL if it's a Supabase storage URL
  useEffect(() => {
    if (value && value.includes("bugjwqjetdptocipxede.supabase.co/storage/v1/object/public/")) {
      const pathRegex = /public\/([^\/]+\/.*)/;
      const match = value.match(pathRegex);
      if (match && match[1]) {
        setFilePath(match[1]);
      }
    }
    // Update preview URL when value changes
    setPreviewUrl(value || null);
  }, [value]);
  
  const handleUploadComplete = (url: string) => {
    console.log("Upload complete, received URL:", url);
    setPreviewUrl(url);
    onChange(url);
    
    // Extract file path from URL
    if (url.includes("bugjwqjetdptocipxede.supabase.co/storage/v1/object/public/")) {
      const pathRegex = /public\/([^\/]+\/.*)/;
      const match = url.match(pathRegex);
      if (match && match[1]) {
        setFilePath(match[1]);
      }
    }
  };
  
  const handleRemovePoster = () => {
    setPreviewUrl(null);
    setFilePath(null);
    onChange("");
  };
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setPreviewUrl(newUrl);
    onChange(newUrl);
  };
  
  const handlePreviewImage = () => {
    if (previewUrl) {
      setShowPreview(true);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-6">
        {previewUrl ? (
          <div className="relative group rounded-md overflow-hidden border border-border">
            <div className="aspect-[16/9] w-full h-full relative">
              <img
                src={previewUrl}
                alt="Campaign poster preview"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2">
              <Button
                variant="default"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handlePreviewImage}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleRemovePoster}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
            <p className="text-sm text-muted-foreground mb-4">
              Upload your campaign poster or provide an image URL
            </p>
            <UploadButton
              bucketName="posters"
              folderPath="candidate-posters"
              onUploadComplete={handleUploadComplete}
              buttonText="Upload Campaign Poster"
              accept="image/png,image/jpeg,image/jpg,image/gif"
              maxSizeMB={2}
              className="w-full sm:w-auto"
            />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="poster-url">Or enter image URL</Label>
          <Input
            id="poster-url"
            placeholder="https://example.com/your-image.jpg"
            value={previewUrl || ""}
            onChange={handleUrlChange}
          />
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        </div>
      </div>
      
      {/* Image preview modal */}
      <ImagePreviewModal
        imageUrl={previewUrl || ""}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
};

export default CampaignPosterUpload;

// FormField compatible version for react-hook-form
export const FormCampaignPosterUpload = ({ control, name }: any) => {
  return (
    <FormItem>
      <FormLabel>Campaign Poster</FormLabel>
      <FormControl>
        <CampaignPosterUpload
          value={control._formValues[name] || ""}
          onChange={(value) => control._setFieldValue(name, value)}
          error={control._formState.errors[name]?.message}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};
