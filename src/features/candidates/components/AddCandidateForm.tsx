
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
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Candidate, Election } from "@/types";
import CampaignPosterUpload from "./CampaignPosterUpload";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface AddCandidateFormProps {
  electionId: string;
  onCandidateAdded: (candidate: Candidate | Candidate[]) => void;
  onCancel: () => void;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  position: z.string().min(2, { message: "Position must be at least 2 characters" }),
  bio: z.string().min(10, { message: "Bio must be at least 10 characters" }).max(500, { message: "Bio must not exceed 500 characters" }),
  image_url: z.string().optional(),
  student_id: z.string().optional(),
  department: z.string().optional(),
  year_level: z.string().optional(),
});

const AddCandidateForm = ({ electionId, onCandidateAdded, onCancel }: AddCandidateFormProps) => {
  const [loading, setLoading] = useState(false);
  const [availablePositions, setAvailablePositions] = useState<string[]>([]);

  useEffect(() => {
    // Fetch election details to get positions
    const fetchElectionDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('elections')
          .select('positions')
          .eq('id', electionId)
          .single();
          
        if (error) {
          console.error("Error fetching election positions:", error);
          return;
        }
        
        if (data && Array.isArray(data.positions)) {
          setAvailablePositions(data.positions);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchElectionDetails();
  }, [electionId]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      position: "",
      bio: "",
      image_url: "",
      student_id: "",
      department: "",
      year_level: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      const newCandidate = {
        name: values.name,
        position: values.position,
        bio: values.bio,
        image_url: values.image_url || null,
        election_id: electionId,
        student_id: values.student_id || null,
        department: values.department || null,
        year_level: values.year_level || null,
      };

      const { data, error } = await supabase
        .from('candidates')
        .insert(newCandidate)
        .select();

      if (error) throw error;

      toast.success("Candidate added successfully");
      form.reset();
      onCancel();

      if (data) {
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
    <ScrollArea className="h-full max-h-[calc(80vh-100px)]">
      <div className="px-4 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Candidate's full name" {...field} />
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
                    {availablePositions.length > 0 ? (
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a position" />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePositions.map((position) => (
                            <SelectItem key={position} value={position}>
                              {position}
                            </SelectItem>
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
                    <Input placeholder="Candidate's student ID (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department/College</FormLabel>
                    <FormControl>
                      <Input placeholder="Candidate's department (optional)" {...field} />
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
                      <Input placeholder="Candidate's year level (optional)" {...field} />
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
                      placeholder="Tell voters about the candidate, their qualifications, and why they're running"
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

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Add Candidate"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </ScrollArea>
  );
};

export default AddCandidateForm;
