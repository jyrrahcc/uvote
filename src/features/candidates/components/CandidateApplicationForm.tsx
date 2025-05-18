
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import {
  ApplicationFormActions,
  ProfileInfoFields,
  PositionSelector,
  BioTextarea,
  ImageUploader,
  AcademicInfoFields,
  useApplicationForm
} from "./application-form";

interface CandidateApplicationFormProps {
  electionId: string;
  userId?: string;
  open?: boolean;
  onClose?: () => void;
  onSuccess?: (candidate?: any) => void;
  onApplicationSubmitted?: () => void;
  onCancel?: () => void;
  initialEligibility?: boolean;
  initialEligibilityReason?: string | null;
}

const CandidateApplicationForm = ({ 
  electionId, 
  userId = '', 
  onClose, 
  onSuccess,
  onApplicationSubmitted,
  onCancel,
  initialEligibility,
  initialEligibilityReason
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
    department,
    setDepartment,
    yearLevel,
    setYearLevel,
    departments,
    yearLevels,
    submitting,
    imageUploading,
    setImageUploading,
    availablePositions,
    userProfile,
    validationError,
    isEligible,
    eligibilityReason,
    handleSubmit,
    profileLoading
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

  // Show loading state while profile is being fetched
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading profile information...</p>
        </div>
      </div>
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
      
      <AcademicInfoFields
        department={department}
        setDepartment={setDepartment}
        yearLevel={yearLevel}
        setYearLevel={setYearLevel}
        departments={departments}
        yearLevels={yearLevels}
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
