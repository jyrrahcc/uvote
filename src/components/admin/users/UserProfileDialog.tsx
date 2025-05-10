import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "./types";
// We just need to correct the import of Info icon from Lucide
import { Check, AlertCircle, User2, UserCheck, Info } from "lucide-react";

interface UserProfileDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: UserProfile | null;
  onProfileUpdate?: () => void;
}

const UserProfileDialog = ({
  open,
  setOpen,
  user,
  onProfileUpdate,
}: UserProfileDialogProps) => {
  const [isVerified, setIsVerified] = useState(user?.is_verified || false);
  const [roles, setRoles] = useState<string[]>(user?.roles || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsVerified(user?.is_verified || false);
    setRoles(user?.roles || []);
  }, [user]);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_verified: !isVerified })
        .eq("id", user?.id);

      if (error) {
        throw error;
      }

      setIsVerified(!isVerified);
      toast.success(
        `User ${isVerified ? "unverified" : "verified"} successfully.`
      );
      onProfileUpdate?.();
    } catch (error: any) {
      console.error("Error updating user verification:", error);
      toast.error("Failed to update user verification.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (role: string, action: "add" | "remove") => {
    setLoading(true);
    try {
      let newRoles = [...roles];
      if (action === "add") {
        newRoles.push(role);
      } else {
        newRoles = newRoles.filter((r) => r !== role);
      }

      const { error } = await supabase
        .from("profiles")
        .update({ roles: newRoles })
        .eq("id", user?.id);

      if (error) {
        throw error;
      }

      setRoles(newRoles);
      toast.success(`Role ${action === "add" ? "added" : "removed"} successfully.`);
      onProfileUpdate?.();
    } catch (error: any) {
      console.error("Error updating user roles:", error);
      toast.error("Failed to update user roles.");
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = roles.includes("admin");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>
            Manage user profile and roles.
          </DialogDescription>
        </DialogHeader>

        {user ? (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                value={user.email}
                readOnly
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="first_name" className="text-right">
                First Name
              </Label>
              <Input
                type="text"
                id="first_name"
                value={user.first_name}
                readOnly
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="last_name" className="text-right">
                Last Name
              </Label>
              <Input
                type="text"
                id="last_name"
                value={user.last_name}
                readOnly
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="student_id" className="text-right">
                Student ID
              </Label>
              <Input
                type="text"
                id="student_id"
                value={user.student_id || "N/A"}
                readOnly
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">
                Department
              </Label>
              <Input
                type="text"
                id="department"
                value={user.department || "N/A"}
                readOnly
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="year_level" className="text-right">
                Year Level
              </Label>
              <Input
                type="text"
                id="year_level"
                value={user.year_level || "N/A"}
                readOnly
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_verified" className="text-right">
                Verified
              </Label>
              <div className="col-span-3">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" disabled={loading}>
                      {isVerified ? (
                        <>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Verified
                        </>
                      ) : (
                        <>
                          <User2 className="mr-2 h-4 w-4" />
                          Unverified
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {isVerified ? "Unverify User?" : "Verify User?"}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to{" "}
                        {isVerified ? "unverify" : "verify"} this user?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleVerify} disabled={loading}>
                        {loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                        ) : (
                          <>
                            {isVerified ? "Unverify" : "Verify"}
                          </>
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="roles" className="text-right">
                Roles
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleRoleChange("admin", isAdmin ? "remove" : "add")}
                  disabled={loading}
                >
                  {isAdmin ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Admin
                    </>
                  ) : (
                    "Make Admin"
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span>No user selected.</span>
          </div>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="submit" disabled={loading}>
              Save changes
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Are you sure you want to update
                this user?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction disabled={loading}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileDialog;
