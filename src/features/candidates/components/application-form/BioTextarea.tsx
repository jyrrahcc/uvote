
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormMessage } from "@/components/ui/form";

interface BioTextareaProps {
  bio: string;
  setBio: (bio: string) => void;
  validationError?: string;
  placeholder?: string;
  rows?: number;
}

const BioTextarea = ({ 
  bio, 
  setBio, 
  validationError,
  placeholder = "Write a short description about yourself and your platform (minimum 10 characters)",
  rows = 4
}: BioTextareaProps) => {
  return (
    <div className="grid grid-cols-4 items-start gap-4">
      <Label htmlFor="bio" className="text-right mt-2">
        Bio <span className="text-destructive">*</span>
      </Label>
      <div className="col-span-3 space-y-1">
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className={validationError ? "border-red-500" : ""}
          placeholder={placeholder}
          rows={rows}
          required
        />
        {validationError && (
          <FormMessage className="text-sm text-red-500">{validationError}</FormMessage>
        )}
      </div>
    </div>
  );
};

export default BioTextarea;
