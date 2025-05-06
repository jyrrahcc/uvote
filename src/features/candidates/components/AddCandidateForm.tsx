
import { useState, ChangeEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Upload, Image } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  bio: z.string().min(10, { message: "Bio must be at least 10 characters" }),
  position: z.string().min(2, { message: "Position must be at least 2 characters" }),
  image_url: z.string().optional(),
});

// Define typescript-compatible interface that matches the candidate table structure
export interface CandidateInsert {
  name: string;
  bio: string;
  position: string;
  image_url: string | null;
  election_id: string;
  created_by: string;
}

interface AddCandidateFormProps {
  electionId: string;
  onCandidateAdded: (candidate: any) => void;
  onClose: () => void;
}

const AddCandidateForm = ({ electionId, onCandidateAdded, onClose }: AddCandidateFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewPoster, setPreviewPoster] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      bio: "",
      position: "",
      image_url: "",
    },
  });

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>, type: 'profile' | 'poster') => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${electionId}/${type === 'profile' ? 'profiles' : 'posters'}/${fileName}`;

    try {
      type === 'profile' ? setUploadingImage(true) : setUploadingPoster(true);
      
      // Check if candidates bucket exists, create if not
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.find(bucket => bucket.name === 'candidates')) {
        await supabase.storage.createBucket('candidates', { public: true });
      }
      
      // Upload the file to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('candidates')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: publicURL } = supabase.storage.from('candidates').getPublicUrl(filePath);
      
      if (!publicURL) {
        throw new Error('Could not generate public URL');
      }

      // Set the image URL and preview
      if (type === 'profile') {
        form.setValue('image_url', publicURL.publicUrl);
        setPreviewImage(publicURL.publicUrl);
      } else {
        // You could store the poster URL in another field if needed
        setPreviewPoster(publicURL.publicUrl);
      }
      
      toast.success(`${type === 'profile' ? 'Profile image' : 'Poster'} uploaded successfully`);
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(`Failed to upload ${type === 'profile' ? 'profile image' : 'poster'}`);
    } finally {
      type === 'profile' ? setUploadingImage(false) : setUploadingPoster(false);
    }
  };

  const handleAddCandidate = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      
      const newCandidate: CandidateInsert = {
        name: values.name,
        bio: values.bio,
        position: values.position,
        image_url: values.image_url || null,
        election_id: electionId,
        created_by: user?.id || ""
      };
      
      // Using generic syntax for Supabase to avoid type errors
      const { data, error } = await supabase
        .from('candidates')
        .insert(newCandidate)
        .select();
      
      if (error) throw error;
      
      toast.success("Candidate added successfully");
      form.reset();
      onClose();
      
      // Update parent component
      if (data) {
        // Type casting to match our Candidate[] type
        onCandidateAdded(data);
      }
    } catch (error) {
      console.error("Error adding candidate:", error);
      toast.error("Failed to add candidate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleAddCandidate)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Candidate name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Position</FormLabel>
              <FormControl>
                <Input placeholder="Position running for" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea placeholder="Candidate biography" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <FormLabel>Profile Image</FormLabel>
            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => document.getElementById('image-upload')?.click()}
                disabled={uploadingImage}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadingImage ? "Uploading..." : "Upload Image"}
              </Button>
              <Input 
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, 'profile')}
                disabled={uploadingImage}
              />
            </div>
            {previewImage && (
              <div className="mt-2 relative w-full h-48 border rounded-md overflow-hidden">
                <img 
                  src={previewImage} 
                  alt="Candidate preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <FormLabel>Campaign Poster</FormLabel>
            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => document.getElementById('poster-upload')?.click()}
                disabled={uploadingPoster}
                className="w-full"
              >
                <Image className="h-4 w-4 mr-2" />
                {uploadingPoster ? "Uploading..." : "Upload Poster"}
              </Button>
              <Input 
                id="poster-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, 'poster')}
                disabled={uploadingPoster}
              />
            </div>
            {previewPoster && (
              <div className="mt-2 relative w-full h-48 border rounded-md overflow-hidden">
                <img 
                  src={previewPoster} 
                  alt="Campaign poster preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            disabled={loading || uploadingImage || uploadingPoster}
          >
            {loading ? "Adding..." : "Add Candidate"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddCandidateForm;
