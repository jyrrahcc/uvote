
import { ImageIcon } from "lucide-react";
import { FormField, FormControl, FormItem, FormMessage } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import ElectionBannerUpload from "../../ElectionBannerUpload";
import { ElectionFormValues } from "../../../types/electionFormTypes";

const ElectionBannersTab = () => {
  const form = useFormContext<ElectionFormValues>();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        <ImageIcon className="h-5 w-5 mr-2 text-[#008f50]" />
        Election Banners
      </h3>
      <p className="text-sm text-muted-foreground">
        Upload banner images for your election. These will be displayed on the election details page.
      </p>
      
      <FormField
        control={form.control}
        name="banner_urls"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <ElectionBannerUpload 
                banners={field.value} 
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ElectionBannersTab;
