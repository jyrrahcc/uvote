
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
                onViewProfile={onViewProfile}
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
