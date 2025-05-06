
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
import CandidateImageUpload from "./CandidateImageUpload";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  bio: z.string().min(10, { message: "Bio must be at least 10 characters" }),
  position: z.string().min(2, { message: "Position must be at least 2 characters" }),
  image_url: z.string().optional(),
  poster_url: z.string().optional(),
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
  poster_url: string | null;
  election_id: string;
  created_by: string;
  student_id?: string | null;
  department?: string | null;
  year_level?: string | null;
}

interface AddCandidateFormProps {
  electionId: string;
  onCandidateAdded: (candidate: any) => void;
  onCancel: () => void;
}

const AddCandidateForm = ({ electionId, onCandidateAdded, onCancel }: AddCandidateFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [positions, setPositions] = useState<string[]>([]);
  
  // Fetch available positions for this election
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
      poster_url: "",
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
      
      const newCandidate: CandidateInsert = {
        name: values.name,
        bio: values.bio,
        position: values.position,
        image_url: values.image_url || null,
        poster_url: values.poster_url || null,
        election_id: electionId,
        created_by: user?.id || "",
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
