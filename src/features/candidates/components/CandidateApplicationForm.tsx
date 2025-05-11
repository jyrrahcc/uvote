
import React from "react";
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
}

const CandidateApplicationForm = ({ 
  electionId, 
  userId = '', 
  onClose, 
  onSuccess,
  onApplicationSubmitted,
  onCancel
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
    handleSubmit
  } = useApplicationForm({
    electionId,
    userId,
    onSuccess,
    onApplicationSubmitted,
    onClose
  });

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
