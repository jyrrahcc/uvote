
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Shield, UserCheck, User, Info, Check, X, UserCog } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { UserProfile } from "./types";
import UserMenuDropdown from "./UserMenuDropdown";

interface UserListProps {
  users: UserProfile[];
  currentUserId: string | undefined;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  isProcessing: boolean;
  onSort: (column: string) => void;
  onViewProfile: (user: UserProfile) => void;
  onToggleMenu: (userId: string) => void;
}

const UserList = ({
  users,
  currentUserId,
  sortColumn,
  sortDirection,
  isProcessing,
  onSort,
  onViewProfile,
  onToggleMenu
}: UserListProps) => {

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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => onSort("name")} className="cursor-pointer">
              <div className="flex items-center space-x-1">
                <span>Name</span>
                {sortColumn === "name" && (
                  <ArrowUpDown className="h-3 w-3" />
                )}
              </div>
            </TableHead>
            <TableHead onClick={() => onSort("email")} className="cursor-pointer">
              <div className="flex items-center space-x-1">
                <span>Email</span>
                {sortColumn === "email" && (
                  <ArrowUpDown className="h-3 w-3" />
                )}
              </div>
            </TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Verification</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map(user => (
              <TableRow key={user.id} className={cn(
                user.id === currentUserId && "bg-muted/50"
              )}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getUserInitials(user.first_name, user.last_name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {user.first_name} {user.last_name}
                      </div>
                      {user.id === currentUserId && (
                        <Badge variant="outline" className="text-xs bg-primary/5 text-primary/80">
                          You
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex gap-1.5">
                    {user.roles.includes('admin') && (
                      <HoverCard>
                        <HoverCardTrigger>
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-48">
                          <p className="text-xs">Admin users can manage all aspects of the platform including elections and users.</p>
                        </HoverCardContent>
                      </HoverCard>
                    )}
                    {user.roles.includes('voter') && (
                      <HoverCard>
                        <HoverCardTrigger>
                          <Badge variant="outline">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Voter
                          </Badge>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-48">
                          <p className="text-xs">Voters can participate in elections and view results.</p>
                        </HoverCardContent>
                      </HoverCard>
                    )}
                    {user.roles.length === 0 && (
                      <Badge variant="outline" className="text-muted-foreground">
                        No roles
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {user.is_verified ? (
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
                </TableCell>
                <TableCell className="text-right">
                  {user.id !== currentUserId ? (
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
                  ) : (
                    <Badge variant="outline" className="bg-primary-foreground/5">
                      Current User
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserList;
