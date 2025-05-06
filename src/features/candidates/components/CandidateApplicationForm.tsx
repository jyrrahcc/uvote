
import { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCandidateApplication } from "../services/candidateApplicationService";
import { supabase } from "@/integrations/supabase/client";
import CandidateImageUpload from "./CandidateImageUpload";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  bio: z.string().min(10, { message: "Bio must be at least 10 characters" }),
  position: z.string().min(2, { message: "Position must be at least 2 characters" }),
  image_url: z.string().optional(),
  student_id: z.string().optional(),
  department: z.string().optional(),
  year_level: z.string().optional(),
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
  const [positions, setPositions] = useState<string[]>([]);
  const { user } = useAuth();
  
  // Fetch available positions
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const { data, error } = await supabase
          .from('elections')
          .select('positions')
          .eq('id', electionId)
          .single();
        
        if (error) {
          console.error("Error fetching positions:", error);
          return;
        }
        
        if (data && Array.isArray(data.positions)) {
          setPositions(data.positions);
        } else {
          // Default positions if none are defined
          setPositions([
            "President",
            "Vice President",
            "Secretary",
            "Treasurer",
            "Public Relations Officer"
          ]);
        }
      } catch (error) {
        console.error("Error fetching positions:", error);
      }
    };
    
    fetchPositions();
    
    // Fetch user profile data if available
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error("Error fetching user profile:", error);
          return;
        }
        
        if (data) {
          form.setValue('name', `${data.first_name} ${data.last_name}`);
          form.setValue('student_id', data.student_id || '');
          form.setValue('department', data.department || '');
          form.setValue('year_level', data.year_level || '');
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    
    fetchUserProfile();
  }, [electionId, user?.id]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.user_metadata?.full_name || "",
      bio: "",
      position: "",
      image_url: user?.user_metadata?.avatar_url || "",
      student_id: "",
      department: "",
      year_level: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("You must be logged in to apply as a candidate");
      return;
    }
    
    try {
      setLoading(true);
      
      const application = {
        election_id: electionId,
        user_id: user.id,
        name: values.name,
        position: values.position,
        bio: values.bio,
        image_url: values.image_url || null,
        student_id: values.student_id || null,
        department: values.department || null,
        year_level: values.year_level || null,
      };
      
      await supabase.from('candidate_applications').insert([application]);
      
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
        
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
