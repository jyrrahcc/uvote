
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import PageLayout from "@/components/layout/PageLayout";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import { supabase } from "@/integrations/supabase/client";
import { DlsudProfile } from "@/types";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileForm from "@/components/profile/ProfileForm";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { userRole } = useRole();
  const [profile, setProfile] = useState<DlsudProfile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isPendingVerification, setIsPendingVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setProfile(data);
          setFirstName(data.first_name || "");
          setLastName(data.last_name || "");
          setStudentId(data.student_id || "");
          setDepartment(data.department || "");
          setYearLevel(data.year_level || "");
          setIsVerified(data.is_verified || false);
          setIsPendingVerification(!!data.student_id && !!data.department && !!data.year_level && !data.is_verified);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile information");
      } finally {
        setIsLoading(false);
      }
    };

    getProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto py-12 px-4">
          <div className="flex justify-center">
            <p>Loading profile...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-md mx-auto">
          <ProfileHeader 
            isVerified={isVerified} 
            isPendingVerification={isPendingVerification} 
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your DLSU-D student details</CardDescription>
            </CardHeader>
            
            <ProfileForm
              profile={profile}
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              studentId={studentId}
              setStudentId={setStudentId}
              department={department}
              setDepartment={setDepartment}
              yearLevel={yearLevel}
              setYearLevel={setYearLevel}
              isVerified={isVerified}
              isPendingVerification={isPendingVerification}
              setIsPendingVerification={setIsPendingVerification}
              onSignOut={handleSignOut}
            />
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Profile;
