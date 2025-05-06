
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g., 2018-00123-ST-0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your DLSU-D Student ID Number
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">College/Department</Label>
                  <Select
                    value={department}
                    onValueChange={setDepartment}
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select your college" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-specified">Not specified</SelectItem>
                      {DLSU_DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearLevel">Year Level</Label>
                  <Select
                    value={yearLevel}
                    onValueChange={setYearLevel}
                  >
                    <SelectTrigger id="yearLevel">
                      <SelectValue placeholder="Select your year level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-specified">Not specified</SelectItem>
                      {YEAR_LEVELS.map((year) => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full bg-[#008f50] hover:bg-[#007a45]" 
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
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
