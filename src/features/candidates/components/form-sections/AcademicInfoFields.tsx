
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import type { CandidateFormData } from "../../schemas/candidateFormSchema";

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
            <FormLabel>Department/College</FormLabel>
            <FormControl>
              <Input placeholder="Your department (optional)" {...field} />
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
            <FormLabel>Year Level</FormLabel>
            <FormControl>
              <Input placeholder="Your year level (optional)" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default AcademicInfoFields;
