
import React from "react";
import UserList from "@/components/admin/users/UserList";
import UserTablePagination from "@/components/admin/users/UserTablePagination";
import UserTableSizeSelector from "@/components/admin/users/UserTableSizeSelector";
import ExportDataButton from "@/components/admin/users/ExportDataButton";
import { UserProfile } from "@/components/admin/users/types";
import { Skeleton } from "@/components/ui/skeleton";

interface UsersTableContainerProps {
  users: UserProfile[];
  currentUserId?: string;
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
  onVerify: (userId: string, isVerified: boolean) => Promise<void>;
  onRoleAction: (userId: string, role: string, action: 'add' | 'remove') => Promise<void>;
  selectedUsers?: string[];
  onSelectionChange?: (userIds: string[]) => void;
  processingUserIds?: Set<string>;
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
  onVerify,
  onRoleAction,
  selectedUsers = [],
  onSelectionChange,
  processingUserIds = new Set()
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-2">
        <ExportDataButton users={users} />
      </div>
      
      <UserList
        users={users}
        currentUserId={currentUserId}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        isProcessing={isProcessing}
        onSort={onSort}
        onViewProfile={onViewProfile}
        onVerify={onVerify}
        onRoleAction={onRoleAction}
        selectedUsers={selectedUsers}
        onSelectionChange={onSelectionChange}
        processingUserIds={processingUserIds}
      />
      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <UserTableSizeSelector
          value={pageSize}
          onChange={setPageSize}
        />
        <UserTablePagination
          totalCount={totalUsers}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};
