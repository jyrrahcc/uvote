
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, User } from "lucide-react";
import { UserProfile } from "./types";

interface UserProfileDialogProps {
  open: boolean;
  onClose: () => void;
  selectedUser: UserProfile;
  onVerifyProfile: (userId: string, isVerified: boolean) => Promise<void>;
  isProcessing: boolean;
}

const UserProfileDialog = ({ 
  open, 
  onClose, 
  selectedUser,
  onVerifyProfile,
  isProcessing
}: UserProfileDialogProps) => {
  if (!selectedUser) {
    return null;
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (selectedUser.first_name && selectedUser.last_name) {
      return `${selectedUser.first_name.charAt(0)}${selectedUser.last_name.charAt(0)}`;
    }
    if (selectedUser.email) {
      return selectedUser.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Check if user has voter role
  const hasVoterRole = selectedUser.roles.includes('voter');

  const handleVerifyProfile = async () => {
    console.log("Verifying profile", selectedUser.id, "Current status:", hasVoterRole);
    await onVerifyProfile(selectedUser.id, hasVoterRole);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={selectedUser.image_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold">{selectedUser.first_name} {selectedUser.last_name}</h3>
            <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant={hasVoterRole ? "default" : "outline"}>
              {hasVoterRole ? "Verified" : "Not Verified"}
            </Badge>
            
            {selectedUser.roles.map((role) => (
              <Badge key={role} variant="secondary">{role}</Badge>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Student ID</p>
              <p className="text-sm text-muted-foreground">{selectedUser.student_id || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Department</p>
              <p className="text-sm text-muted-foreground">{selectedUser.department || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Year Level</p>
              <p className="text-sm text-muted-foreground">{selectedUser.year_level || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Created At</p>
              <p className="text-sm text-muted-foreground">
                {new Date(selectedUser.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between pt-4">
          {!hasVoterRole ? (
            <Button 
              onClick={handleVerifyProfile} 
              disabled={isProcessing}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Verify Profile
            </Button>
          ) : (
            <Button 
              onClick={handleVerifyProfile} 
              disabled={isProcessing}
              variant="destructive"
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Revoke Verification
            </Button>
          )}
          
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileDialog;
