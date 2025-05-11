
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UserProfile } from "../types";
import UserActions from "../UserActions";
import UserInitials from "../UserInitials";
import RoleBadges from "../badges/RoleBadges";
import VerificationBadge from "../badges/VerificationBadge";

interface UserListRowProps {
  user: UserProfile;
  isCurrentUser: boolean;
  isProcessing: boolean;
  onViewProfile: (user: UserProfile) => void;
}

const UserListRow: React.FC<UserListRowProps> = ({
  user,
  isCurrentUser,
  isProcessing,
  onViewProfile
}) => {
  return (
    <TableRow className={cn(
      isCurrentUser && "bg-muted/50"
    )}>
      <TableCell>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              <UserInitials 
                firstName={user.first_name} 
                lastName={user.last_name} 
                email={user.email} 
              />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {user.first_name} {user.last_name}
            </div>
            {isCurrentUser && (
              <Badge variant="outline" className="text-xs bg-primary/5 text-primary/80">
                You
              </Badge>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell className="hidden md:table-cell">
        {user.department || "-"}
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        {user.year_level || "-"}
      </TableCell>
      <TableCell>
        <RoleBadges roles={user.roles} />
      </TableCell>
      <TableCell>
        <VerificationBadge isVerified={user.is_verified || false} />
      </TableCell>
      <TableCell className="text-right">
        <UserActions 
          user={user} 
          isCurrentUser={isCurrentUser}
          isProcessing={isProcessing}
          onViewProfile={onViewProfile}
        />
      </TableCell>
    </TableRow>
  );
};

export default UserListRow;
