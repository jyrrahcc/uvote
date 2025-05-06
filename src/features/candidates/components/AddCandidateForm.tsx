
import { useState } from "react";
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
import CandidateImageUpload from "./CandidateImageUpload";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  bio: z.string().min(10, { message: "Bio must be at least 10 characters" }),
  position: z.string().min(2, { message: "Position must be at least 2 characters" }),
  image_url: z.string().optional(),
  poster_url: z.string().optional(),
});

// Define typescript-compatible interface that matches the candidate table structure
export interface CandidateInsert {
  name: string;
  bio: string;
  position: string;
  image_url: string | null;
  poster_url: string | null;
  election_id: string;
  created_by: string;
}

interface AddCandidateFormProps {
  electionId: string;
  onCandidateAdded: (candidate: any) => void;
  onCancel: () => void;
}

const AddCandidateForm = ({ electionId, onCandidateAdded, onCancel }: AddCandidateFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      bio: "",
      position: "",
      image_url: "",
      poster_url: "",
    },
  });

  const handleAddCandidate = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      
      const newCandidate: CandidateInsert = {
        name: values.name,
        bio: values.bio,
        position: values.position,
        image_url: values.image_url || null,
        poster_url: values.poster_url || null,
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
      onCancel();
      
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
          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profile Image</FormLabel>
                <CandidateImageUpload
                  electionId={electionId}
                  type="profile"
                  imageUrl={field.value || null}
                  onImageUploaded={(url) => form.setValue("image_url", url)}
                  disabled={loading}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="poster_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Campaign Poster</FormLabel>
                <CandidateImageUpload
                  electionId={electionId}
                  type="poster"
                  imageUrl={field.value || null}
                  onImageUploaded={(url) => form.setValue("poster_url", url)}
                  disabled={loading}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button 
            type="submit" 
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Candidate"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddCandidateForm;
