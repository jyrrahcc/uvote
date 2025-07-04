
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  onVerify: (userId: string, isVerified: boolean) => Promise<void>;
  onRoleAction: (userId: string, role: string, action: 'add' | 'remove') => Promise<void>;
  isSelected?: boolean;
  onSelectionChange?: (userIds: string[]) => void;
  showSelection?: boolean;
}

const UserListRow: React.FC<UserListRowProps> = ({
  user,
  isCurrentUser,
  isProcessing,
  onViewProfile,
  onVerify,
  onRoleAction,
  isSelected = false,
  onSelectionChange,
  showSelection = false
}) => {
  const hasVoterRole = user.roles.includes('voter');

  const handleSelectionChange = (checked: boolean) => {
    if (!onSelectionChange) return;
    
    if (checked) {
      onSelectionChange([user.id]);
    } else {
      onSelectionChange([]);
    }
  };
  
  return (
    <TableRow className={cn(
      isCurrentUser && "bg-muted/50",
      isSelected && "bg-blue-50 dark:bg-blue-950/20",
      isProcessing && "opacity-50"
    )}>
      {showSelection && (
        <TableCell>
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleSelectionChange}
            disabled={isProcessing}
          />
        </TableCell>
      )}
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
        <VerificationBadge 
          isVerified={false}
          hasVoterRole={hasVoterRole}
        />
      </TableCell>
      <TableCell className="text-right">
        <UserActions 
          user={user} 
          isCurrentUser={isCurrentUser}
          isProcessing={isProcessing}
          onViewProfile={onViewProfile}
          onVerify={onVerify}
          onRoleAction={onRoleAction}
        />
      </TableCell>
    </TableRow>
  );
};

export default UserListRow;
