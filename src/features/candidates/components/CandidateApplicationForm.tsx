
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/features/auth/context/AuthContext";
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
import { createCandidateApplication, CandidateApplicationInsert } from "../services/candidateApplicationService";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  bio: z.string().min(10, { message: "Bio must be at least 10 characters" }),
  position: z.string().min(2, { message: "Position must be at least 2 characters" }),
  image_url: z.string().optional(),
});

interface CandidateApplicationFormProps {
  electionId: string;
  onApplicationSubmitted: () => void;
  onCancel: () => void;
}

const CandidateApplicationForm = ({
  electionId,
  onApplicationSubmitted,
  onCancel
}: CandidateApplicationFormProps) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.user_metadata?.first_name && user?.user_metadata?.last_name 
        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
        : "",
      bio: "",
      position: "",
      image_url: user?.user_metadata?.avatar_url || "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("You must be logged in to apply as a candidate");
      return;
    }
    
    try {
      setLoading(true);
      
      const application: CandidateApplicationInsert = {
        election_id: electionId,
        user_id: user.id,
        name: values.name,
        position: values.position,
        bio: values.bio,
        image_url: values.image_url || null,
      };
      
      await createCandidateApplication(application);
      
      toast.success("Your candidate application has been submitted for review");
      form.reset();
      onApplicationSubmitted();
    } catch (error) {
      console.error("Error submitting candidate application:", error);
      toast.error("Failed to submit candidate application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} />
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
                <Textarea 
                  placeholder="Tell voters about yourself, your qualifications, and why you're running" 
                  className="min-h-[120px]"
                  {...field} 
                />
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
              <FormLabel>Profile Image URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="URL to your profile image" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CandidateApplicationForm;
