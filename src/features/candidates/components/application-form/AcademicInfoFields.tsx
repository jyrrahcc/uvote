
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DLSU_DEPARTMENTS, YEAR_LEVELS } from "@/types/constants";

interface AcademicInfoFieldsProps {
  department: string;
  setDepartment: (value: string) => void;
  yearLevel: string;
  setYearLevel: (value: string) => void;
}

const AcademicInfoFields: React.FC<AcademicInfoFieldsProps> = ({
  department,
  setDepartment,
  yearLevel,
  setYearLevel
}) => {
  return (
    <>
      <div className="mb-4">
        <FormLabel className="text-base">Department/College</FormLabel>
        <Select value={department} onValueChange={setDepartment} required>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select your department/college" />
          </SelectTrigger>
          <SelectContent>
            {DLSU_DEPARTMENTS.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4">
        <FormLabel className="text-base">Year Level</FormLabel>
        <Select value={yearLevel} onValueChange={setYearLevel} required>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select your year level" />
          </SelectTrigger>
          <SelectContent>
            {YEAR_LEVELS.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default AcademicInfoFields;
