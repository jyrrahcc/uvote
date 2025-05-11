
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { UserProfile } from "./types";
import UserMenuDropdown from "./UserMenuDropdown";

interface UserActionsProps {
  user: UserProfile;
  isCurrentUser: boolean;
  isProcessing: boolean;
  onViewProfile: (user: UserProfile) => void;
}

const UserActions: React.FC<UserActionsProps> = ({
  user,
  isCurrentUser,
  isProcessing,
  onViewProfile
}) => {
  if (isCurrentUser) {
    return (
      <Badge variant="outline" className="bg-primary-foreground/5">
        Current User
      </Badge>
    );
  }

  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onViewProfile(user)}
        title="View Profile"
      >
        <User className="h-4 w-4" />
        <span className="sr-only">View Profile</span>
      </Button>
      
      <UserMenuDropdown 
        user={user}
        onVerify={(userId, isVerified) => {}}
        onRoleAction={(userId, role, action) => {}}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default UserActions;
