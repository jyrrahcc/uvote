import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DlsudProfile } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Clock, InfoIcon, LockIcon } from "lucide-react";
import { DLSU_DEPARTMENTS, YEAR_LEVELS } from "@/types/constants";

interface ProfileFormProps {
  profile: DlsudProfile | null;
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  studentId: string;
  setStudentId: (value: string) => void;
  department: string;
  setDepartment: (value: string) => void;
  yearLevel: string;
  setYearLevel: (value: string) => void;
  isVerified: boolean;
  isPendingVerification: boolean;
  setIsPendingVerification: (value: boolean) => void;
  onSignOut: () => void;
}

const ProfileForm = ({
  profile,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  studentId,
  setStudentId,
  department,
  setDepartment,
  yearLevel,
  setYearLevel,
  isVerified,
  isPendingVerification,
  setIsPendingVerification,
  onSignOut
}: ProfileFormProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isProfileComplete = !!firstName && !!lastName && !!studentId && !!department && !!yearLevel;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent updates if the profile is verified
    if (isVerified) {
      toast.info("Profile is verified and cannot be edited", {
        description: "Contact an administrator if you need to update your information."
      });
      return;
    }

    if (!profile) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          student_id: studentId,
          department: department,
          year_level: yearLevel,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;
      
      // Check if profile is now complete but not verified
      if (isProfileComplete && !isVerified) {
        setIsPendingVerification(true);
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile information");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitForVerification = async () => {
    if (!isProfileComplete) {
      toast.warning("Please complete your profile before submitting for verification");
      return;
    }

    setIsSubmitting(true);
    try {
      // We're not actually updating anything in the database here
      // We're just using this as a flag to indicate that the user has submitted their profile for verification
      setIsPendingVerification(true);
      
      toast.success("Your profile has been submitted for verification!", {
        description: "An administrator will review and verify your profile shortly."
      });
    } catch (error) {
      console.error("Error submitting for verification:", error);
      toast.error("Failed to submit profile for verification");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleUpdateProfile}>
      <CardContent className="space-y-4">
        {isVerified && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <div className="flex items-center space-x-2">
              <LockIcon className="h-4 w-4 text-blue-500" />
              <span className="text-blue-700 font-medium">Profile is verified and locked</span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              Your profile has been verified and cannot be edited. Contact an administrator if you need to make changes.
            </p>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={profile?.email || ""}
            disabled
          />
          <p className="text-xs text-muted-foreground">
            Email cannot be changed
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={isVerified}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={isVerified}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="studentId">Student ID*</Label>
          <Input
            id="studentId"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="e.g., 2018-00123-ST-0"
            disabled={isVerified}
            required
          />
          <p className="text-xs text-muted-foreground">
            Your DLSU-D Student ID Number (required for verification)
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">College/Department*</Label>
          <Select
            value={department}
            onValueChange={setDepartment}
            disabled={isVerified}
            required
          >
            <SelectTrigger id="department">
              <SelectValue placeholder="Select your college" />
            </SelectTrigger>
            <SelectContent>
              {DLSU_DEPARTMENTS.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Required for verification and college-specific elections
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="yearLevel">Year Level*</Label>
          <Select
            value={yearLevel}
            onValueChange={setYearLevel}
            disabled={isVerified}
            required
          >
            <SelectTrigger id="yearLevel">
              <SelectValue placeholder="Select your year level" />
            </SelectTrigger>
            <SelectContent>
              {YEAR_LEVELS.map((year) => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Required for verification and year-specific elections
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="joined">Joined</Label>
          <Input
            id="joined"
            value={profile?.created_at 
              ? new Date(profile.created_at).toLocaleDateString() 
              : ""
            }
            disabled
          />
        </div>
        
        <div className="pt-2 flex flex-col space-y-2">
          <Label className="font-semibold">Verification Status</Label>
          <div className={`px-3 py-2 rounded-md text-center ${
            isVerified 
              ? 'bg-green-100 text-green-800' 
              : isPendingVerification 
                ? 'bg-amber-100 text-amber-800'
                : 'bg-gray-100 text-gray-800'
          }`}>
            {isVerified ? (
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Verified</span>
              </div>
            ) : isPendingVerification ? (
              <div className="flex items-center justify-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Pending Verification</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <InfoIcon className="h-4 w-4" />
                <span>Not Submitted</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button 
          type="submit" 
          className="w-full bg-[#008f50] hover:bg-[#007a45]" 
          disabled={isSaving || isVerified}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
        
        {isProfileComplete && !isVerified && !isPendingVerification && (
          <Button 
            type="button"
            onClick={handleSubmitForVerification}
            className="w-full bg-blue-600 hover:bg-blue-700" 
            disabled={isSubmitting || !isProfileComplete}
          >
            {isSubmitting ? "Submitting..." : "Submit for Verification"}
          </Button>
        )}
        
        <Button 
          type="button" 
          variant="outline" 
          className="w-full"
          onClick={onSignOut}
        >
          Sign Out
        </Button>
      </CardFooter>
    </form>
  );
};

export default ProfileForm;
