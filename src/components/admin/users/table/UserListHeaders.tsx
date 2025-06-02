
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import SortableHeader from "./SortableHeader";
import { UserProfile } from "../types";

interface UserListHeadersProps {
  sortColumn: string;
  onSort: (column: string) => void;
  showSelection?: boolean;
  users?: UserProfile[];
  selectedUsers?: string[];
  onSelectionChange?: (userIds: string[]) => void;
}

const UserListHeaders = ({ 
  sortColumn, 
  onSort, 
  showSelection = false,
  users = [],
  selectedUsers = [],
  onSelectionChange 
}: UserListHeadersProps) => {
  const isAllSelected = selectedUsers.length === users.length && users.length > 0;
  const isPartiallySelected = selectedUsers.length > 0 && selectedUsers.length < users.length;

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(users.map(u => u.id));
    }
  };

  return (
    <TableHeader>
      <TableRow>
        {showSelection && (
          <TableHead className="w-12">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={handleSelectAll}
              className={isPartiallySelected ? "data-[state=checked]:bg-orange-500" : ""}
            />
          </TableHead>
        )}
        <SortableHeader
          column="name"
          currentSort={sortColumn}
          onSort={onSort}
          label="Name"
        />
        <SortableHeader
          column="email"
          currentSort={sortColumn}
          onSort={onSort}
          label="Email"
        />
        <TableHead className="hidden md:table-cell">Department</TableHead>
        <TableHead className="hidden lg:table-cell">Year Level</TableHead>
        <TableHead>Roles</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default UserListHeaders;
