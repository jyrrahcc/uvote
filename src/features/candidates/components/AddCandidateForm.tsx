
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
}

interface AddCandidateFormProps {
  electionId: string;
  onCandidateAdded: (candidate: any) => void;
  onClose: () => void;
}

const AddCandidateForm = ({ electionId, onCandidateAdded, onClose }: AddCandidateFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      bio: "",
      position: "",
      image_url: "",
    },
  });

  const handleAddCandidate = async (values: z.infer<typeof formSchema>) => {
    try {
      const newCandidate: CandidateInsert = {
        name: values.name,
        bio: values.bio,
        position: values.position,
        image_url: values.image_url || null,
        election_id: electionId,
      };
      
      // Using generic syntax for Supabase to avoid type errors
      const { data, error } = await supabase
        .from('candidates')
        .insert(newCandidate as any)
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
        
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="URL to candidate's image" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">Add Candidate</Button>
      </form>
    </Form>
  );
};

export default AddCandidateForm;
