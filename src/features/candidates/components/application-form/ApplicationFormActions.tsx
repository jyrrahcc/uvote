
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, FileImage } from "lucide-react";

interface ApplicationFormActionsProps {
  submitting: boolean;
  imageUploading: boolean;
  onCancel?: () => void;
}

const ApplicationFormActions = ({ 
  submitting, 
  imageUploading, 
  onCancel 
}: ApplicationFormActionsProps) => {
  return (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={submitting || imageUploading}>
        {submitting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <FileImage className="h-4 w-4 mr-2" />
        )}
        Submit Application
      </Button>
    </div>
  );
};

export default ApplicationFormActions;
