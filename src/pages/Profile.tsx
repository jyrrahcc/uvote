
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, CheckCircle2, AlertCircle } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import { useAuth } from "@/features/auth/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DlsudProfile } from "@/types";

const DLSU_DEPARTMENTS = [
  "College of Business Administration and Accountancy",
  "College of Education",
  "College of Engineering, Architecture and Technology",
  "College of Humanities, Arts and Social Sciences",
  "College of Science and Computer Studies",
  "College of Criminal Justice Education",
  "College of Tourism and Hospitality Management"
];

const YEAR_LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];

const Profile = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<DlsudProfile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  const isProfileComplete = !!studentId && !!department && !!yearLevel && !!firstName && !!lastName;

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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

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
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile information");
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerifyProfile = async () => {
    if (!isProfileComplete) {
      toast.warning("Please complete your profile before verifying");
      return;
    }

    setIsVerifying(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setIsVerified(true);
      toast.success("Your profile has been verified successfully!");
    } catch (error) {
      console.error("Error verifying profile:", error);
      toast.error("Failed to verify profile");
    } finally {
      setIsVerifying(false);
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
          <h1 className="text-3xl font-bold text-center mb-8">Your DLSU-D Profile</h1>
          
          {!isVerified && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Profile Verification Needed</AlertTitle>
              <AlertDescription>
                Complete your profile and verify it to participate in elections. 
                You need to provide your student ID, department, and year level.
              </AlertDescription>
            </Alert>
          )}

          {isVerified && (
            <Alert className="mb-6 border-green-500 bg-green-50 text-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Profile Verified</AlertTitle>
              <AlertDescription>
                Your profile is verified and you can now participate in elections.
              </AlertDescription>
            </Alert>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your DLSU-D student details</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-4">
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
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
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
                  <div className={`px-3 py-2 rounded-md text-center ${isVerified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    {isVerified ? (
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <InfoIcon className="h-4 w-4" />
                        <span>Not Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full bg-[#008f50] hover:bg-[#007a45]" 
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                
                {!isVerified && (
                  <Button 
                    type="button"
                    onClick={handleVerifyProfile}
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    disabled={isVerifying || !isProfileComplete}
                  >
                    {isVerifying ? "Verifying..." : "Verify My Profile"}
                  </Button>
                )}
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Profile;
