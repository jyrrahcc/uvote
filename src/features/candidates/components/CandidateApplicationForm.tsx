
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, FileImage } from "lucide-react";
import { uploadFileToStorage } from "@/utils/fileUploadUtils";
import { supabase } from "@/integrations/supabase/client";

interface CandidateApplicationFormProps {
  electionId: string;
  userId?: string;
  open?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  onApplicationSubmitted?: () => void;
  onCancel?: () => void;
}

const CandidateApplicationForm = ({ 
  electionId, 
  userId = '', 
  open, 
  onClose, 
  onSuccess,
  onApplicationSubmitted,
  onCancel
}: CandidateApplicationFormProps) => {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [availablePositions, setAvailablePositions] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<{
    first_name?: string;
    last_name?: string;
    department?: string;
    year_level?: string;
    student_id?: string;
  }>({});

  // Fetch election positions and user profile on mount
  useEffect(() => {
    if (!electionId || !userId) return;
    
    const fetchData = async () => {
      try {
        // Fetch election positions
        const { data: electionData, error: electionError } = await supabase
          .from('elections')
          .select('positions')
          .eq('id', electionId)
          .single();
          
        if (electionError) throw electionError;
        if (electionData?.positions) {
          setAvailablePositions(electionData.positions);
        }
        
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, department, year_level, student_id')
          .eq('id', userId)
          .single();
          
        if (profileError) throw profileError;
        if (profileData) {
          setUserProfile(profileData);
          // Pre-fill name from profile
          if (profileData.first_name && profileData.last_name) {
            setName(`${profileData.first_name} ${profileData.last_name}`);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    fetchData();
  }, [electionId, userId]);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error("You must be logged in to submit an application");
      return;
    }
    
    if (!position) {
      toast.error("Please select a position");
      return;
    }
    
    if (!bio || bio.length < 10) {
      toast.error("Please provide a bio (minimum 10 characters)");
      return;
    }
    
    try {
      setSubmitting(true);
      
      const applicationData = {
        name,
        position,
        bio,
        image_url: imageUrl,
        election_id: electionId,
        user_id: userId,
        status: 'pending',
        // Include additional profile info
        student_id: userProfile.student_id,
        department: userProfile.department,
        year_level: userProfile.year_level
      };
      
      const { data, error } = await supabase
        .from('candidate_applications')
        .insert(applicationData)
        .select();
      
      if (error) throw error;
      
      toast.success("Application submitted successfully");
      
      // Call all success callbacks
      if (onSuccess) onSuccess();
      if (onApplicationSubmitted) onApplicationSubmitted();
      
      // Handle closing
      if (onClose) onClose();
      if (onCancel) onCancel();
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose || onCancel}>
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
          
          {userProfile.student_id && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="student_id" className="text-right">
                Student ID
              </Label>
              <Input
                id="student_id"
                value={userProfile.student_id}
                readOnly
                className="col-span-3 bg-muted"
              />
            </div>
          )}
          
          {userProfile.department && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">
                Department
              </Label>
              <Input
                id="department"
                value={userProfile.department}
                readOnly
                className="col-span-3 bg-muted"
              />
            </div>
          )}
          
          {userProfile.year_level && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="year_level" className="text-right">
                Year Level
              </Label>
              <Input
                id="year_level"
                value={userProfile.year_level}
                readOnly
                className="col-span-3 bg-muted"
              />
            </div>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="position" className="text-right">
              Position
            </Label>
            {availablePositions.length > 0 ? (
              <div className="col-span-3">
                <Select
                  value={position}
                  onValueChange={setPosition}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a position" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePositions.map((pos) => (
                      <SelectItem key={pos} value={pos}>
                        {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <Input
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="col-span-3"
                placeholder="Enter position"
                required
              />
            )}
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
              placeholder="Write a short description about yourself and your platform (minimum 10 characters)"
              rows={4}
              required
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
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
