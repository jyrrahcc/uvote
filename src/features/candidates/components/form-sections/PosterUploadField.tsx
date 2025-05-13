
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import type { CandidateFormData } from "../../schemas/candidateFormSchema";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Image, X } from "lucide-react";
import { Input } from "@/components/ui/input"; 
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface PosterUploadFieldProps {
  form: UseFormReturn<CandidateFormData>;
}

const PosterUploadField = ({ form }: PosterUploadFieldProps) => {
  const [uploading, setUploading] = useState(false);
  const imageUrl = form.watch("image_url");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `candidate-posters/${fileName}`;

    try {
      setUploading(true);
      
      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('candidates')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('candidates')
        .getPublicUrl(filePath);
      
      if (publicUrlData?.publicUrl) {
        form.setValue("image_url", publicUrlData.publicUrl);
        toast.success("Campaign poster uploaded successfully");
      } else {
        throw new Error("Could not get public URL");
      }
    } catch (error) {
      console.error("Error uploading poster:", error);
      toast.error("Failed to upload campaign poster");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    form.setValue("image_url", "");
  };

  return (
    <FormField
      control={form.control}
      name="image_url"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Campaign Poster</FormLabel>
          <FormControl>
            <div className="space-y-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => document.getElementById("poster-upload")?.click()}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? (
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                ) : (
                  <Image className="mr-2 h-4 w-4" />
                )}
                {uploading ? "Uploading..." : "Upload Campaign Poster"}
              </Button>
              
              <Input 
                id="poster-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
              
              {imageUrl && (
                <div className="mt-2 relative border rounded-md overflow-hidden">
                  <img 
                    src={imageUrl} 
                    alt="Campaign poster preview" 
                    className="w-full h-auto object-contain max-h-[300px]"
                  />
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={handleRemove}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              <input 
                type="hidden" 
                {...field} 
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PosterUploadField;
