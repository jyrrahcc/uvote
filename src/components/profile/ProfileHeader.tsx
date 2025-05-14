
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface ProfileHeaderProps {
  isVerified: boolean;
  isPendingVerification: boolean;
  isVoter: boolean;
}

const ProfileHeader = ({ isVerified, isPendingVerification, isVoter }: ProfileHeaderProps) => {
  // Consider user verified if either the is_verified flag is true or they have voter role
  const isEffectivelyVerified = isVerified || isVoter;
  
  return (
    <>
      <h1 className="text-3xl font-bold text-center mb-8">Your DLSU-D Profile</h1>
      
      {isPendingVerification && !isEffectivelyVerified && (
        <Alert className="mb-6 border-amber-500 bg-amber-50 text-amber-800">
          <Clock className="h-4 w-4 text-amber-600" />
          <AlertTitle>Verification Pending</AlertTitle>
          <AlertDescription>
            Your profile has been submitted for verification. An administrator will review your information and verify your profile shortly.
          </AlertDescription>
        </Alert>
      )}
      
      {!isPendingVerification && !isEffectivelyVerified && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Profile Verification Needed</AlertTitle>
          <AlertDescription>
            Complete your profile information and submit it for verification. 
            You need to provide your student ID, department, and year level to be eligible for voter privileges.
          </AlertDescription>
        </Alert>
      )}

      {isEffectivelyVerified && (
        <Alert className="mb-6 border-green-500 bg-green-50 text-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Profile Verified</AlertTitle>
          <AlertDescription>
            Your profile has been verified. You now have voter privileges and can participate in elections.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default ProfileHeader;
