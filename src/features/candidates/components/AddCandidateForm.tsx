import { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Eye, Image, X } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  bio: z.string().min(10, { message: "Bio must be at least 10 characters" }),
  position: z.string().min(2, { message: "Position must be at least 2 characters" }),
  image_url: z.string().optional(),
  student_id: z.string().optional(),
  department: z.string().optional(),
  year_level: z.string().optional(),
});

// Define typescript-compatible interface that matches the candidate table structure
export interface CandidateInsert {
  name: string;
  bio: string;
  position: string;
  image_url: string | null;
  election_id: string;
  created_by: string;
  student_id?: string | null;
  department?: string | null;
  year_level?: string | null;
}

interface CandidateApplicationFormProps {
  electionId: string;
  onCandidateAdded: (candidate: any) => void;
  onCancel: () => void;
}

const AddCandidateForm = ({ 
  electionId,
  onCandidateAdded, 
  onCancel 
}: AddCandidateFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [positions, setPositions] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Fetch available positions for this election
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        console.log("Fetching positions for election ID:", electionId);
        const { data, error } = await supabase
          .from('elections')
          .select('positions')
          .eq('id', electionId)
          .single();
        
        if (error) {
          console.error("Error fetching positions:", error);
          return;
        }
        
        console.log("Positions data:", data);
        
        // If positions is defined and is an array, use it
        if (data && Array.isArray(data.positions)) {
          setPositions(data.positions);
        } else {
          // Default positions if none are defined
          setPositions([
            "President",
            "Vice President",
            "Secretary",
            "Treasurer",
            "Public Relations Officer",
            "Senator",
            "Governor",
            "Department Representative"
          ]);
        }
      } catch (error) {
        console.error("Error in fetchPositions:", error);
      }
    };
    
    fetchPositions();
  }, [electionId]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      bio: "",
      position: "",
      image_url: "",
      student_id: "",
      department: "",
      year_level: "",
    },
  });

  const handleAddCandidate = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      
      console.log("Adding candidate to election ID:", electionId);
      console.log("Candidate data:", values);
      
      if (!user) {
        throw new Error("User must be logged in to add a candidate");
      }
      
      const newCandidate: CandidateInsert = {
        name: values.name,
        bio: values.bio,
        position: values.position,
        image_url: values.image_url || null,
        election_id: electionId,
        created_by: user.id,
        student_id: values.student_id || null,
        department: values.department || null,
        year_level: values.year_level || null
      };
      
      console.log("Final candidate object:", newCandidate);
      
      // Using generic syntax for Supabase to avoid type errors
      const { data, error } = await supabase
        .from('candidates')
        .insert(newCandidate)
        .select();
      
      if (error) {
        console.error("Error response from Supabase:", error);
        throw error;
      }
      
      console.log("Supabase response:", data);
      
      toast.success("Candidate added successfully");
      form.reset();
      
      // Update parent component
      if (data) {
        // Type casting to match our Candidate[] type
        onCandidateAdded(data);
      }
      
      onCancel();
    } catch (error) {
      console.error("Error adding candidate:", error);
      toast.error("Failed to add candidate");
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload for campaign poster
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${electionId}/posters/${fileName}`;

    try {
      setUploading(true);
      
      // Create a temporary preview URL
      const objectUrl = URL.createObjectURL(file);
      form.setValue("image_url", objectUrl);
      
      // Check if candidates bucket exists, create if not
      const { data: buckets } = await supabase.storage.listBuckets();
      const candidatesBucketExists = buckets?.some(bucket => bucket.name === 'candidates');
      
      if (!candidatesBucketExists) {
        await supabase.storage.createBucket('candidates', { 
          public: true,
          fileSizeLimit: 1024 * 1024 * 5 // 5MB limit
        });
      }
      
      // Upload the file to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('candidates')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: publicURL } = supabase.storage.from('candidates').getPublicUrl(filePath);
      
      if (!publicURL) {
        throw new Error('Could not generate public URL');
      }

      // Update form with the URL
      form.setValue("image_url", publicURL.publicUrl);
      
      toast.success("Campaign poster uploaded successfully");
    } catch (error) {
      console.error("Error uploading poster:", error);
      toast.error("Failed to upload campaign poster");
    } finally {
      setUploading(false);
    }
  };

  // Preview image
  const handlePreviewImage = (url: string) => {
    setPreviewImage(url);
    setShowPreview(true);
  };

  const handleRemoveImage = () => {
    form.setValue("image_url", "");
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
                {positions.length > 0 ? (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((position) => (
                        <SelectItem key={position} value={position}>{position}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input placeholder="Position running for" {...field} />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="student_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student ID</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 20120001" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Computer Science" {...field} value={field.value || ''} />
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
                <Input placeholder="e.g., 3rd Year" {...field} value={field.value || ''} />
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
        
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign Poster</FormLabel>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => document.getElementById("poster-upload-input")?.click()}
                    disabled={uploading}
                    className="flex-1"
                  >
                    <Image className="h-4 w-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload Campaign Poster"}
                  </Button>

                  {field.value && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handlePreviewImage(field.value)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <Input 
                  id="poster-upload-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                
                {field.value && (
                  <div className="mt-2 relative w-full h-48 border rounded-md overflow-hidden">
                    <img 
                      src={field.value} 
                      alt="Campaign poster preview" 
                      className="w-full h-full object-cover"
                    />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={handleRemoveImage}
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button 
            type="submit" 
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Candidate"}
          </Button>
        </div>

        {/* Image Preview Modal */}
        {showPreview && previewImage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowPreview(false)}>
            <div className="bg-white p-2 rounded-lg max-w-3xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="absolute top-2 right-2 z-10"
                onClick={() => setShowPreview(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <img 
                src={previewImage} 
                alt="Preview" 
                className="max-w-full max-h-[85vh] object-contain"
              />
            </div>
          </div>
        )}
      </form>
    </Form>
  );
};

export default AddCandidateForm;
