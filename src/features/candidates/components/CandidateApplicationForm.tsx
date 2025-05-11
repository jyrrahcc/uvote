
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import {
  ApplicationFormActions,
  ProfileInfoFields,
  PositionSelector,
  BioTextarea,
  ImageUploader,
  useApplicationForm
} from "./application-form";

interface CandidateApplicationFormProps {
  electionId: string;
  userId?: string;
  open?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  onApplicationSubmitted?: () => void;
  onCancel?: () => void;
  isUserEligible?: boolean;
  eligibilityReason?: string | null;
}

const CandidateApplicationForm = ({ 
  electionId, 
  userId = '', 
  onClose, 
  onSuccess,
  onApplicationSubmitted,
  onCancel,
  isUserEligible: initialEligibility,
  eligibilityReason: initialEligibilityReason
}: CandidateApplicationFormProps) => {
  const {
    name,
    setName,
    position,
    setPosition,
    bio,
    setBio,
    image,
    setImage,
    imageUrl,
    setImageUrl,
    submitting,
    imageUploading,
    setImageUploading,
    availablePositions,
    userProfile,
    validationError,
    isEligible,
    eligibilityReason,
    handleSubmit
  } = useApplicationForm({
    electionId,
    userId,
    onSuccess,
    onApplicationSubmitted,
    onClose,
    initialEligibility,
    initialEligibilityReason
  });

  // If user is not eligible, show eligibility message instead of the form
  if (!isEligible) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Not Eligible</AlertTitle>
        <AlertDescription>
          {eligibilityReason || validationError || "You are not eligible to apply for candidacy in this election."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <ProfileInfoFields
        name={name}
        setName={setName}
        userProfile={userProfile}
      />
      
      <PositionSelector
        position={position}
        setPosition={setPosition}
        availablePositions={availablePositions}
      />
      
      <BioTextarea
        bio={bio}
        setBio={setBio}
        validationError={validationError || undefined}
      />
      
      <ImageUploader
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        setImage={setImage}
        imageUploading={imageUploading}
        setImageUploading={setImageUploading}
        electionId={electionId}
      />
      
      <ApplicationFormActions
        submitting={submitting}
        imageUploading={imageUploading}
        onCancel={onCancel}
      />
    </form>
  );
};

export default CandidateApplicationForm;
