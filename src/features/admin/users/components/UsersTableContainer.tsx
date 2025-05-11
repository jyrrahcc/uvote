
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import UserList from "@/components/admin/users/UserList";
import { UserProfile } from "@/components/admin/users/types";

interface UsersTableContainerProps {
  users: UserProfile[];
  currentUserId: string | undefined;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  isProcessing: boolean;
  loading: boolean;
  onSort: (column: string) => void;
  onViewProfile: (user: UserProfile) => void;
  onToggleMenu: (userId: string) => void;
}

export const UsersTableContainer: React.FC<UsersTableContainerProps> = ({
  users,
  currentUserId,
  sortColumn,
  sortDirection,
  isProcessing,
  loading,
  onSort,
  onViewProfile,
  onToggleMenu
}) => {
  return (
    <Card>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Loading users...</p>
            </div>
          </div>
        ) : (
          <UserList 
            users={users}
            currentUserId={currentUserId}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            isProcessing={isProcessing}
            onSort={onSort}
            onViewProfile={onViewProfile}
            onToggleMenu={onToggleMenu}
          />
        )}
      </CardContent>
    </Card>
  );
};
