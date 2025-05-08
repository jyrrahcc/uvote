
import { useState, useEffect } from "react";
import { UploadButton } from "@/components/ui/upload-button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import CampaignPosterPreview from "./CampaignPosterPreview";

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
  }, [value]);
  
  const handleUploadComplete = (url: string) => {
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
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-6">
        {previewUrl ? (
          <CampaignPosterPreview
            imageUrl={previewUrl}
            onRemove={handleRemovePoster}
            bucketName="campaign-posters"
            filePath={filePath}
            className="mt-4"
          />
        ) : (
          <div className="border border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
            <p className="text-sm text-muted-foreground mb-4">
              Upload your campaign poster or provide an image URL
            </p>
            <UploadButton
              bucketName="campaign-posters"
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
