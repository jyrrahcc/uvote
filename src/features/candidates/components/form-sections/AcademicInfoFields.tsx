
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import type { CandidateFormData } from "../../schemas/candidateFormSchema";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { DLSU_DEPARTMENTS, YEAR_LEVELS } from "@/features/elections/components/candidate-manager/constants";

interface AcademicInfoFieldsProps {
  form: UseFormReturn<CandidateFormData>;
}

const AcademicInfoFields = ({ form }: AcademicInfoFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="department"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Department/College <span className="text-destructive">*</span></FormLabel>
            <FormControl>
              <Select
                value={field.value || ""}
                onValueChange={field.onChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DLSU_DEPARTMENTS.map((dept) => (
                    <SelectItem 
                      key={dept} 
                      value={dept || "unknown-department"}
                    >
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="year_level"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Year Level <span className="text-destructive">*</span></FormLabel>
            <FormControl>
              <Select
                value={field.value || ""}
                onValueChange={field.onChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year level" />
                </SelectTrigger>
                <SelectContent>
                  {YEAR_LEVELS.map((year) => (
                    <SelectItem 
                      key={year} 
                      value={year || "unknown-year"}
                    >
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default AcademicInfoFields;
