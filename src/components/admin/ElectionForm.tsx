
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { Election, mapDbElectionToElection } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import DateTimeInput from "@/components/ui/date-time-input";
import { MultiSelector, Option } from "@/components/ui/multi-selector";

// Define the form schema using Zod
const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().optional(),
  startDate: z.string().refine((date) => {
    try {
      new Date(date);
      return true;
    } catch (error) {
      return false;
    }
  }, {
    message: "Invalid start date",
  }),
  endDate: z.string().refine((date) => {
    try {
      new Date(date);
      return true;
    } catch (error) {
      return false;
    }
  }, {
    message: "Invalid end date",
  }),
  candidacyStartDate: z.string().refine((date) => {
    try {
      new Date(date);
      return true;
    } catch (error) {
      return false;
    }
  }, {
    message: "Invalid candidacy start date",
  }),
  candidacyEndDate: z.string().refine((date) => {
    try {
      new Date(date);
      return true;
    } catch (error) {
      return false;
    }
  }, {
    message: "Invalid candidacy end date",
  }),
  isPrivate: z.boolean().default(false),
  accessCode: z.string().optional(),
  department: z.string().optional(),
  colleges: z.array(z.string()).optional(),
  eligibleYearLevels: z.array(z.string()).optional(),
  positions: z.array(z.string()).optional(),
  bannerUrls: z.array(z.string()).optional(),
  totalEligibleVoters: z.number().optional(),
  allowFaculty: z.boolean().default(false),
  restrictVoting: z.boolean().default(false)
});

interface ElectionFormProps {
  electionData?: Election;
}

const ElectionForm: React.FC<ElectionFormProps> = ({ electionData }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  const [collegesOptions, setCollegesOptions] = useState<Option[]>([]);
  const [yearLevelsOptions, setYearLevelsOptions] = useState<Option[]>([]);
  const [positionsOptions, setPositionsOptions] = useState<Option[]>([]);

  // Initialize form with default values or election data
  const initialFormData = {
    title: electionData?.title || '',
    description: electionData?.description || '',
    startDate: electionData?.startDate || '',
    endDate: electionData?.endDate || '',
    candidacyStartDate: electionData?.candidacyStartDate || '',
    candidacyEndDate: electionData?.candidacyEndDate || '',
    isPrivate: electionData?.isPrivate || false,
    accessCode: electionData?.accessCode || '',
    department: electionData?.department || '',
    colleges: electionData?.colleges || [],
    eligibleYearLevels: electionData?.eligibleYearLevels || [],
    positions: electionData?.positions || [],
    bannerUrls: electionData?.bannerUrls || [],
    totalEligibleVoters: electionData?.totalEligibleVoters || 0,
    allowFaculty: electionData?.allowFaculty || false,
    restrictVoting: electionData?.restrictVoting || false
  };

  // Initialize react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialFormData,
    mode: "onChange"
  });

  useEffect(() => {
    const fetchStaticData = async () => {
      // Colleges options
      const colleges = [
        "College of Science (COS)",
        "College of Liberal Arts (CLA)",
        "College of Engineering and Architecture (CEA)",
        "College of Education (COE)",
        "College of Business Administration (CBA)",
        "College of Criminal Justice (CJUS)",
        "College of Tourism and Hospitality Management (CTHM)",
        "College of International Hospitality Management (CIHM)"
      ];
      setCollegesOptions(colleges.map(college => ({ value: college, label: college })));

      // Year levels options
      const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Graduate Student"];
      setYearLevelsOptions(yearLevels.map(yearLevel => ({ value: yearLevel, label: yearLevel })));

      // Positions options (example)
      const defaultPositions = ["President", "Vice President", "Secretary", "Treasurer", "Auditor", "PRO"];
      setPositionsOptions(defaultPositions.map(position => ({ value: position, label: position })));
    };

    fetchStaticData();
  }, []);

  // Function to handle form submission
  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const startDate = new Date(formData.startDate).toISOString();
      const endDate = new Date(formData.endDate).toISOString();
      const candidacyStartDate = new Date(formData.candidacyStartDate).toISOString();
      const candidacyEndDate = new Date(formData.candidacyEndDate).toISOString();

      // Determine the status based on dates
      let status = 'upcoming';
      const now = new Date();
      if (now >= new Date(startDate) && now <= new Date(endDate)) {
        status = 'active';
      } else if (now > new Date(endDate)) {
        status = 'completed';
      }

      const dbElection = {
        title: formData.title,
        description: formData.description,
        start_date: startDate,
        end_date: endDate,
        candidacy_start_date: candidacyStartDate,
        candidacy_end_date: candidacyEndDate,
        is_private: formData.isPrivate,
        access_code: formData.accessCode,
        department: formData.department,
        departments: formData.colleges,
        eligible_year_levels: formData.eligibleYearLevels,
        positions: formData.positions,
        banner_urls: formData.bannerUrls,
        total_eligible_voters: formData.totalEligibleVoters,
        allow_faculty: formData.allowFaculty,
        restrict_voting: formData.restrictVoting,
        status: status // Add the calculated status
      };

      if (isEditMode && id) {
        // Update existing election
        const { error } = await supabase
          .from('elections')
          .update(dbElection)
          .eq('id', id);

        if (error) {
          console.error("Error updating election:", error);
          toast.error("Failed to update election.");
        } else {
          toast.success("Election updated successfully!");
          navigate('/admin/elections');
        }
      } else {
        // Create new election
        const { data, error } = await supabase
          .from('elections')
          .insert({
            ...dbElection,
            created_by: 'admin-user', // Replace with actual user ID
          })
          .select();

        if (error) {
          console.error("Error creating election:", error);
          toast.error("Failed to create election.");
        } else if (data && data.length > 0) {
          toast.success("Election created successfully!");
          navigate('/admin/elections');
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? "Edit Election" : "Create Election"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Election Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Election Description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <DateTimeInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <DateTimeInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="candidacyStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Candidacy Start Date</FormLabel>
                    <FormControl>
                      <DateTimeInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="candidacyEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Candidacy End Date</FormLabel>
                    <FormControl>
                      <DateTimeInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="isPrivate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Private Election</FormLabel>
                      <FormDescription>
                        Set this election as private.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.getValues("isPrivate") && (
                <FormField
                  control={form.control}
                  name="accessCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Access Code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="Department" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="colleges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Colleges</FormLabel>
                    <MultiSelector
                      options={collegesOptions}
                      value={
                        collegesOptions.filter(option => field.value.includes(option.value))
                      }
                      onChange={(selectedOptions: Option[]) => {
                        field.onChange(selectedOptions.map(option => option.value));
                      }}
                      placeholder="Select colleges..."
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="eligibleYearLevels"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Eligible Year Levels</FormLabel>
                    <MultiSelector
                      options={yearLevelsOptions}
                      value={
                        yearLevelsOptions.filter(option => field.value.includes(option.value))
                      }
                      onChange={(selectedOptions: Option[]) => {
                        field.onChange(selectedOptions.map(option => option.value));
                      }}
                      placeholder="Select year levels..."
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="positions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Positions</FormLabel>
                    <MultiSelector
                      options={positionsOptions}
                      value={
                        positionsOptions.filter(option => field.value.includes(option.value))
                      }
                      onChange={(selectedOptions: Option[]) => {
                        field.onChange(selectedOptions.map(option => option.value));
                      }}
                      placeholder="Select positions..."
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bannerUrls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner URLs</FormLabel>
                    <FormControl>
                      <Input placeholder="Banner URLs (comma-separated)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalEligibleVoters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Eligible Voters</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Total Eligible Voters"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="allowFaculty"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Allow Faculty</FormLabel>
                      <FormDescription>
                        Allow faculty members to participate in this election.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="restrictVoting"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Restrict Voting</FormLabel>
                      <FormDescription>
                        Restrict voting to eligible users only.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ElectionForm;
