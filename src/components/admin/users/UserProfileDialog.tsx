
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Shield, User, UserCheck, X } from "lucide-react";
import { UserProfile } from "./types";

interface UserProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: UserProfile | null;
  onVerifyProfile: (userId: string, isVerified: boolean) => void;
  isProcessing: boolean;
}

const UserProfileDialog = ({
  isOpen,
  onClose,
  selectedUser,
  onVerifyProfile,
  isProcessing
}: UserProfileDialogProps) => {
  // Get user initials
  const getUserInitials = (first_name?: string, last_name?: string, email?: string) => {
    if (first_name && last_name) {
      return `${first_name.charAt(0)}${last_name.charAt(0)}`;
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return "U";
  };

  if (!selectedUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> User Profile
          </DialogTitle>
          <DialogDescription>
            View detailed user profile information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {getUserInitials(selectedUser.first_name, selectedUser.last_name, selectedUser.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{selectedUser.first_name} {selectedUser.last_name}</h3>
              <p className="text-muted-foreground">{selectedUser.email}</p>
            </div>
          </div>
          
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center">
              <span className="text-sm font-medium">Student ID:</span>
              <span className="col-span-2">{selectedUser.student_id || "Not provided"}</span>
            </div>
            
            <div className="grid grid-cols-3 items-center">
              <span className="text-sm font-medium">Department:</span>
              <span className="col-span-2">{selectedUser.department || "Not provided"}</span>
            </div>
            
            <div className="grid grid-cols-3 items-center">
              <span className="text-sm font-medium">Year Level:</span>
              <span className="col-span-2">{selectedUser.year_level || "Not provided"}</span>
            </div>
            
            <div className="grid grid-cols-3 items-center">
              <span className="text-sm font-medium">Joined:</span>
              <span className="col-span-2">{new Date(selectedUser.created_at).toLocaleDateString()}</span>
            </div>
            
            <div className="grid grid-cols-3 items-center">
              <span className="text-sm font-medium">Roles:</span>
              <div className="col-span-2 flex flex-wrap gap-1.5">
                {selectedUser.roles.length > 0 ? (
                  selectedUser.roles.map(role => (
                    <Badge key={role} variant={role === 'admin' ? 'secondary' : 'outline'} className={role === 'admin' ? 'bg-primary/10 text-primary' : ''}>
                      {role === 'admin' ? <Shield className="h-3 w-3 mr-1" /> : <UserCheck className="h-3 w-3 mr-1" />}
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">No roles assigned</span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-3 items-center">
              <span className="text-sm font-medium">Verification:</span>
              <div className="col-span-2">
                {selectedUser.is_verified ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Check className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    <Info className="h-3 w-3 mr-1" />
                    Not Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Profile Management:</p>
            <div className="flex flex-wrap gap-2">
              {selectedUser.is_verified ? (
                <Button 
                  variant="outline" 
                  onClick={() => onVerifyProfile(selectedUser.id, true)}
                  disabled={isProcessing}
                  className="border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Revoke Verification
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  onClick={() => onVerifyProfile(selectedUser.id, false)}
                  disabled={isProcessing}
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Verify Profile
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileDialog;
