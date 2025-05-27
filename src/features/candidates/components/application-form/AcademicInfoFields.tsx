
import { DLSU_DEPARTMENTS, YEAR_LEVELS } from "@/types/constants";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AcademicInfoFieldsProps {
  department: string;
  setDepartment: (department: string) => void;
  yearLevel: string;
  setYearLevel: (yearLevel: string) => void;
  eligibleDepartments?: string[];
  eligibleYearLevels?: string[];
}

export const AcademicInfoFields = ({ 
  department, 
  setDepartment, 
  yearLevel, 
  setYearLevel,
  eligibleDepartments = DLSU_DEPARTMENTS,
  eligibleYearLevels = YEAR_LEVELS
}: AcademicInfoFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="department">Department/College *</Label>
        <Select value={department} onValueChange={setDepartment} required>
          <SelectTrigger id="department">
            <SelectValue placeholder="Select your department" />
          </SelectTrigger>
          <SelectContent>
            {eligibleDepartments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="yearLevel">Year Level *</Label>
        <Select value={yearLevel} onValueChange={setYearLevel} required>
          <SelectTrigger id="yearLevel">
            <SelectValue placeholder="Select your year level" />
          </SelectTrigger>
          <SelectContent>
            {eligibleYearLevels.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
