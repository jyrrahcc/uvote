
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

interface VoterBulkActionsProps {
  departmentFilter: string | null;
  yearFilter: string | null;
  handleSelectByDepartment: (department: string) => void;
  handleSelectByYear: (year: string) => void;
  clearSelection: () => void;
}

const VoterBulkActions = ({
  departmentFilter,
  yearFilter,
  handleSelectByDepartment,
  handleSelectByYear,
  clearSelection
}: VoterBulkActionsProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-2 items-center">
      <Button 
        type="button" 
        variant="outline" 
        size="sm"
        className="w-full md:w-auto"
        onClick={() => {
          if (departmentFilter) {
            handleSelectByDepartment(departmentFilter);
          } else {
            toast.error("Please select a department first");
          }
        }}
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Select All in Department
      </Button>
      
      <Button 
        type="button" 
        variant="outline" 
        size="sm"
        className="w-full md:w-auto"
        onClick={() => {
          if (yearFilter) {
            handleSelectByYear(yearFilter);
          } else {
            toast.error("Please select a year level first");
          }
        }}
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Select All in Year Level
      </Button>
      
      <Button 
        type="button" 
        variant="outline" 
        size="sm"
        className="w-full md:w-auto"
        onClick={clearSelection}
      >
        Clear All
      </Button>
    </div>
  );
};

export default VoterBulkActions;
