
import React from "react";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AcademicInfoFieldsProps {
  department: string;
  setDepartment: (value: string) => void;
  yearLevel: string;
  setYearLevel: (value: string) => void;
  departments: string[];
  yearLevels: string[];
}

const AcademicInfoFields: React.FC<AcademicInfoFieldsProps> = ({
  department,
  setDepartment,
  yearLevel,
  setYearLevel,
  departments,
  yearLevels
}) => {
  return (
    <>
      <FormField>
        <FormItem>
          <FormLabel className="text-base">Department/College</FormLabel>
          <Select value={department} onValueChange={setDepartment} required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your department/college" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      </FormField>

      <FormField>
        <FormItem>
          <FormLabel className="text-base">Year Level</FormLabel>
          <Select value={yearLevel} onValueChange={setYearLevel} required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your year level" />
            </SelectTrigger>
            <SelectContent>
              {yearLevels.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      </FormField>
    </>
  );
};

export default AcademicInfoFields;
