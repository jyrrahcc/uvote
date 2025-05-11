
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { uploadFileToStorage } from "@/utils/fileUploadUtils";
import { toast } from "sonner";

interface ImageUploaderProps {
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
  setImage: (file: File | null) => void;
  imageUploading: boolean;
  setImageUploading: (uploading: boolean) => void;
  electionId: string;
}

const ImageUploader = ({
  imageUrl,
  setImageUrl,
  setImage,
  imageUploading,
  setImageUploading,
  electionId
}: ImageUploaderProps) => {
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    setImageUploading(true);

    try {
      const uploadResult = await uploadFileToStorage(file, "candidate-images", `applications/${electionId}`);
      if (uploadResult.url) {
        setImageUrl(uploadResult.url);
        toast.success("Image uploaded successfully!");
      } else {
        throw new Error("Failed to get image URL");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image.");
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="image" className="text-right">
        Image
      </Label>
      <Input
        type="file"
        id="image"
        accept="image/*"
        onChange={handleImageChange}
        className="col-span-3"
      />
      {imageUploading && <p className="col-span-4 text-center text-sm text-muted-foreground">Uploading image...</p>}
      {imageUrl && (
        <div className="col-span-3 col-start-2 mt-2">
          <img
            src={imageUrl}
            alt="Uploaded"
            className="w-full h-auto rounded-md"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
