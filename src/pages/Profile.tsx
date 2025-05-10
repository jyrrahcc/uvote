
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
          // If the profile doesn't exist yet, create it
          if (error.code === 'PGRST116') {
            await createNewProfile();
            return;
          }
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

  // Helper function to create a new profile if it doesn't exist
  const createNewProfile = async () => {
    try {
      if (!user) return;
      
      // Extract user metadata
      const firstName = user.user_metadata?.first_name || '';
      const lastName = user.user_metadata?.last_name || '';
      
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          first_name: firstName,
          last_name: lastName,
          email: user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_verified: false
        })
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        setProfile(data);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        toast.success("Profile created successfully");
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      toast.error("Failed to create profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto py-12 px-4">
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
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
