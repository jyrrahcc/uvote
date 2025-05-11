
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";

const EmptyUserList: React.FC = () => {
  return (
    <TableRow>
      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
        No users found
      </TableCell>
    </TableRow>
  );
};

export default EmptyUserList;
