
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserTableSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

const UserTableSizeSelector: React.FC<UserTableSizeSelectorProps> = ({ pageSize, onPageSizeChange }) => {
  const handleValueChange = (value: string) => {
    onPageSizeChange(parseInt(value));
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Rows per page:</span>
      <Select value={pageSize.toString()} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder={pageSize} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5">5</SelectItem>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="20">20</SelectItem>
          <SelectItem value="50">50</SelectItem>
          <SelectItem value="100">100</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default UserTableSizeSelector;
