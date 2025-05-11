
import React from "react";
import { TableHead, TableRow, TableHeader } from "@/components/ui/table";
import SortableHeader from "./SortableHeader";

interface UserListHeadersProps {
  sortColumn: string;
  onSort: (column: string) => void;
}

const UserListHeaders: React.FC<UserListHeadersProps> = ({
  sortColumn,
  onSort
}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="cursor-pointer">
          <SortableHeader column="name" label="Name" sortColumn={sortColumn} onSort={onSort} />
        </TableHead>
        <TableHead className="cursor-pointer">
          <SortableHeader column="email" label="Email" sortColumn={sortColumn} onSort={onSort} />
        </TableHead>
        <TableHead className="hidden md:table-cell cursor-pointer">
          <SortableHeader column="department" label="Department" sortColumn={sortColumn} onSort={onSort} />
        </TableHead>
        <TableHead className="hidden lg:table-cell cursor-pointer">
          <SortableHeader column="year_level" label="Year" sortColumn={sortColumn} onSort={onSort} />
        </TableHead>
        <TableHead>Roles</TableHead>
        <TableHead>Verification</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default UserListHeaders;
