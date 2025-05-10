
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  UserCog, 
  Check, 
  X, 
  ShieldX, 
  ShieldCheck, 
  UserX, 
  UserCheck 
} from "lucide-react";
import { UserProfile } from "./types";

interface UserMenuDropdownProps {
  user: UserProfile;
  onVerify: (userId: string, isVerified: boolean) => void;
  onRoleAction: (userId: string, role: string, action: 'add' | 'remove') => void;
  isProcessing: boolean;
}

const UserMenuDropdown = ({
  user,
  onVerify,
  onRoleAction,
  isProcessing
}: UserMenuDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          disabled={isProcessing}
        >
          <UserCog className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>User Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {user.is_verified ? (
          <DropdownMenuItem
            onClick={() => onVerify(user.id, true)}
            disabled={isProcessing}
          >
            <X className="mr-2 h-4 w-4 text-amber-600" />
            Revoke Verification
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => onVerify(user.id, false)}
            disabled={isProcessing}
          >
            <Check className="mr-2 h-4 w-4 text-green-600" />
            Verify Profile
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        {user.roles.includes("admin") ? (
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onRoleAction(user.id, "admin", "remove")}
            disabled={isProcessing}
          >
            <ShieldX className="mr-2 h-4 w-4" />
            Remove Admin Role
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => onRoleAction(user.id, "admin", "add")}
            disabled={isProcessing}
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Make Admin
          </DropdownMenuItem>
        )}
        
        {user.roles.includes("voter") ? (
          <DropdownMenuItem
            onClick={() => onRoleAction(user.id, "voter", "remove")}
            disabled={isProcessing}
          >
            <UserX className="mr-2 h-4 w-4" />
            Remove Voter Role
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => onRoleAction(user.id, "voter", "add")}
            disabled={isProcessing}
          >
            <UserCheck className="mr-2 h-4 w-4" />
            Make Voter
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenuDropdown;
