
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface BioTextareaProps {
  bio: string;
  setBio: (bio: string) => void;
}

const BioTextarea = ({ bio, setBio }: BioTextareaProps) => {
  return (
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
  );
};

export default BioTextarea;
