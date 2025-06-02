
import { Table, TableBody } from "@/components/ui/table";
import { UserProfile } from "./types";
import UserListHeaders from "./table/UserListHeaders";
import UserListRow from "./table/UserListRow";
import EmptyUserList from "./table/EmptyUserList";

interface UserListProps {
  users: UserProfile[];
  currentUserId: string | undefined;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  isProcessing: boolean;
  onSort: (column: string) => void;
  onViewProfile: (user: UserProfile) => void;
  onVerify: (userId: string, isVerified: boolean) => Promise<void>;
  onRoleAction: (userId: string, role: string, action: 'add' | 'remove') => Promise<void>;
  selectedUsers?: string[];
  onSelectionChange?: (userIds: string[]) => void;
  processingUserIds?: Set<string>;
}

const UserList = ({
  users,
  currentUserId,
  sortColumn,
  sortDirection,
  isProcessing,
  onSort,
  onViewProfile,
  onVerify,
  onRoleAction,
  selectedUsers = [],
  onSelectionChange,
  processingUserIds = new Set()
}: UserListProps) => {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <UserListHeaders 
          sortColumn={sortColumn} 
          onSort={onSort}
          showSelection={!!onSelectionChange}
          users={users}
          selectedUsers={selectedUsers}
          onSelectionChange={onSelectionChange}
        />
        <TableBody>
          {users.length > 0 ? (
            users.map(user => (
              <UserListRow
                key={user.id}
                user={user}
                isCurrentUser={user.id === currentUserId}
                isProcessing={processingUserIds.has(user.id)}
                onViewProfile={() => onViewProfile(user)}
                onVerify={onVerify}
                onRoleAction={onRoleAction}
                isSelected={selectedUsers.includes(user.id)}
                onSelectionChange={onSelectionChange}
                showSelection={!!onSelectionChange}
              />
            ))
          ) : (
            <EmptyUserList />
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserList;
