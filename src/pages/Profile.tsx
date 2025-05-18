
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
import ProfileImageUpload from "@/components/profile/ProfileImageUpload";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { userRole, isVoter, refreshUserRole } = useRole();
  const [profile, setProfile] = useState<DlsudProfile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isPendingVerification, setIsPendingVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Function to fetch and update the profile
  const getProfile = async () => {
    if (!user) return;
    
    try {
      // First check if the role has been updated
      await refreshUserRole();
      
      // Then fetch the profile data
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
        setImageUrl(data.image_url || null);
        
        // Important fix: Only consider it pending if not a voter already
        // This ensures that users with voter role don't see the "pending" status
        setIsPendingVerification(!!data.student_id && !!data.department && !!data.year_level && !isVoter);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile information");
    } finally {
      setIsLoading(false);
    }
  };

  // Set up subscription to profile changes
  useEffect(() => {
    if (!user) return;

    getProfile();

    // Set up subscription to listen for changes to the profile
    const channel = supabase
      .channel('profile-changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload) => {
          console.log('Profile updated:', payload);
          getProfile(); // Refresh the profile data
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isVoter]); // Add isVoter to dependency array to ensure profile is refreshed when role changes

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
          updated_at: new Date().toISOString()
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

  const handleImageUpdate = (url: string) => {
    setImageUrl(url);
    setProfile(prev => prev ? { ...prev, image_url: url } : null);
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

  // Determine if the profile is verified by checking voter role
  const effectivelyVerified = isVoter;

  return (
    <PageLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-md mx-auto">
          <ProfileHeader 
            isVerified={isVoter} 
            isPendingVerification={isPendingVerification}
            isVoter={isVoter}
          />
          
          <Card>
            <CardHeader>
              <ProfileImageUpload 
                profile={profile}
                onImageUpdate={handleImageUpdate}
                isVerified={effectivelyVerified}
              />
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                {effectivelyVerified 
                  ? "Your verified DLSU-D student details" 
                  : "Update your DLSU-D student details"}
              </CardDescription>
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
              isVerified={effectivelyVerified} // Consider verified if user has voter role
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
