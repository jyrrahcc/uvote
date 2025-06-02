
import React from "react";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableHeaderProps {
  column: string;
  label: string;
  currentSort: string;
  onSort: (column: string) => void;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({
  column,
  label,
  currentSort,
  onSort
}) => {
  return (
    <div 
      className="flex items-center space-x-1 cursor-pointer hover:text-primary transition-colors"
      onClick={() => onSort(column)}
    >
      <span>{label}</span>
      <ArrowUpDown className={cn(
        "h-3 w-3 transition-opacity",
        currentSort === column ? "opacity-100" : "opacity-40"
      )} />
    </div>
  );
};

export default SortableHeader;
