
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import type { CandidateFormData } from "../../schemas/candidateFormSchema";
import CampaignPosterUpload from "../CampaignPosterUpload";

interface PosterUploadFieldProps {
  form: UseFormReturn<CandidateFormData>;
}

const PosterUploadField = ({ form }: PosterUploadFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="image_url"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Campaign Poster</FormLabel>
          <FormControl>
            <CampaignPosterUpload 
              value={field.value || ""} 
              onChange={field.onChange}
              error={form.formState.errors.image_url?.message}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PosterUploadField;
