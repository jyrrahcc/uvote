import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileImage } from "lucide-react";
import {
  uploadImage,
} from "@/utils/imageUpload";
import { 
  submitCandidateApplication
} from "../services/candidateApplicationService";

interface CandidateApplicationFormProps {
  electionId: string;
  userId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CandidateApplicationForm = ({ electionId, userId, open, onClose, onSuccess }: CandidateApplicationFormProps) => {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    setImageUploading(true);

    try {
      const url = await uploadImage(file);
      setImageUrl(url);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image.");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Use submitCandidateApplication instead of createCandidateApplication
      await submitCandidateApplication({
        name,
        position,
        bio,
        image_url: imageUrl,
        election_id: electionId,
        user_id: userId
      });
      
      toast.success("Application submitted successfully");
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Candidate Application</DialogTitle>
          <DialogDescription>
            Apply to be a candidate for this election.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="position" className="text-right">
              Position
            </Label>
            <Input
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="bio" className="text-right mt-2">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="col-span-3"
              rows={3}
            />
          </div>
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
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <span className="animate-spin mr-2">
                  <FileImage className="h-4 w-4" />
                </span>
              ) : (
                <FileImage className="h-4 w-4 mr-2" />
              )}
              Submit Application
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CandidateApplicationForm;
