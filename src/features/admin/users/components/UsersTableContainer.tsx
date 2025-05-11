
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import UserList from "@/components/admin/users/UserList";
import { UserProfile } from "@/components/admin/users/types";
import UserTablePagination from "@/components/admin/users/UserTablePagination";
import UserTableSizeSelector from "@/components/admin/users/UserTableSizeSelector";
import ExportDataButton from "@/components/admin/users/ExportDataButton";

interface UsersTableContainerProps {
  users: UserProfile[];
  currentUserId: string | undefined;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  isProcessing: boolean;
  loading: boolean;
  totalUsers: number;
  pageSize: number;
  currentPage: number;
  setPageSize: (size: number) => void;
  setCurrentPage: (page: number) => void;
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
  totalUsers,
  pageSize,
  currentPage,
  setPageSize,
  setCurrentPage,
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
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center border-t p-4 gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
          <UserTableSizeSelector 
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
          />
          
          <ExportDataButton users={users} />
        </div>
        
        <UserTablePagination 
          totalItems={totalUsers}
          pageSize={pageSize}
          currentPage={currentPage} 
          onPageChange={setCurrentPage}
        />
      </CardFooter>
    </Card>
  );
};
