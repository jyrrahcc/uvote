
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
  onRoleAction
}: UserListProps) => {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <UserListHeaders 
          sortColumn={sortColumn} 
          onSort={onSort} 
        />
        <TableBody>
          {users.length > 0 ? (
            users.map(user => (
              <UserListRow
                key={user.id}
                user={user}
                isCurrentUser={user.id === currentUserId}
                isProcessing={isProcessing}
                onViewProfile={() => onViewProfile(user)}
                onVerify={onVerify}
                onRoleAction={onRoleAction}
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
