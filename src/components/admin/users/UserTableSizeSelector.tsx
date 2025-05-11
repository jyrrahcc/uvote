
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserTableSizeSelectorProps {
  value: number;
  onChange: (size: number) => void;
}

const UserTableSizeSelector: React.FC<UserTableSizeSelectorProps> = ({ value, onChange }) => {
  const handleValueChange = (value: string) => {
    onChange(parseInt(value));
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Rows per page:</span>
      <Select value={value.toString()} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder={value} />
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
