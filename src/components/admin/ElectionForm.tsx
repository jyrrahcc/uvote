import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Plus, ImageIcon } from "lucide-react";
import CandidateManager from "@/features/elections/components/CandidateManager";
import EligibleVotersManager from "@/features/elections/components/EligibleVotersManager";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Election, mapElectionToDbElection } from "@/types";
import ElectionBannerUpload from "@/features/elections/components/ElectionBannerUpload";

// College departments for DLSU-D
const DLSU_DEPARTMENTS = [
  "College of Business Administration and Accountancy",
  "College of Education",
  "College of Engineering, Architecture and Technology",
  "College of Humanities, Arts and Social Sciences",
  "College of Science and Computer Studies",
  "College of Criminal Justice Education",
  "College of Tourism and Hospitality Management",
  "University-wide"
];

// Default positions available for elections
const DEFAULT_POSITIONS = [
  "President",
  "Vice President",
  "Secretary",
  "Treasurer",
  "Public Relations Officer",
  "Senator",
  "Governor",
  "Department Representative"
];

/**
 * Form validation schema with date validations
 */
const electionFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  departments: z.array(z.string()).min(1, "At least one department must be selected"),
  candidacyStartDate: z.string().min(1, "Candidacy start date is required"),
  candidacyEndDate: z.string().min(1, "Candidacy end date is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isPrivate: z.boolean().default(false),
  accessCode: z.string().optional()
    .refine(val => {
      // Only validate access code if isPrivate is true
      if (val === undefined) return true;
      return true;
    }),
  restrictVoting: z.boolean().default(false),
  positions: z.array(z.string()).default([]),
  banner_urls: z.array(z.string()).default([]),
}).refine((data) => {
  // Candidacy period should come before voting period
  const candidacyStart = new Date(data.candidacyStartDate);
  const candidacyEnd = new Date(data.candidacyEndDate); 
  const votingStart = new Date(data.startDate);
  
  return candidacyEnd <= votingStart;
}, {
  message: "Candidacy period must end before the voting period starts",
  path: ["candidacyEndDate"],
}).refine((data) => {
  // Candidacy start should be before candidacy end
  const candidacyStart = new Date(data.candidacyStartDate);
  const candidacyEnd = new Date(data.candidacyEndDate);
  
  return candidacyStart < candidacyEnd;
}, {
  message: "Candidacy start date must be before candidacy end date",
  path: ["candidacyEndDate"],
}).refine((data) => {
  // Voting start should be before voting end
  const votingStart = new Date(data.startDate);
  const votingEnd = new Date(data.endDate);
  
  return votingStart < votingEnd;
}, {
  message: "Voting start date must be before voting end date",
  path: ["endDate"],
});

export type ElectionFormValues = z.infer<typeof electionFormSchema>;

interface ElectionFormProps {
  editingElectionId: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const ElectionForm = ({ editingElectionId, onSuccess, onCancel }: ElectionFormProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPosition, setNewPosition] = useState("");
  const candidateManagerRef = useRef<any>(null);
  const eligibleVotersManagerRef = useRef<any>(null);
  
  // Initialize form
  const form = useForm<ElectionFormValues>({
    resolver: zodResolver(electionFormSchema),
    defaultValues: {
      title: "",
      description: "",
      departments: [],
      candidacyStartDate: "",
      candidacyEndDate: "",
      startDate: "",
      endDate: "",
      isPrivate: false,
      accessCode: "",
      restrictVoting: false,
      positions: DEFAULT_POSITIONS,
      banner_urls: [],
    },
  });

  // Extract candidacy dates for the CandidateManager
  const candidacyStartDate = form.watch("candidacyStartDate");
  const candidacyEndDate = form.watch("candidacyEndDate");
  const positions = form.watch("positions");
  const restrictVoting = form.watch("restrictVoting");
  const selectedDepartments = form.watch("departments");
  const banner_urls = form.watch("banner_urls");
  
  // Fetch election data if editing
  useEffect(() => {
    async function fetchElectionData() {
      if (!editingElectionId) return;
      
      try {
        const { data, error } = await supabase
          .from('elections')
          .select('*')
          .eq('id', editingElectionId)
          .single();
          
        if (error) throw error;
        
        // Safely handle potentially missing properties with type checking
        if (data) {
          console.log("Fetched election data:", data);
          // Convert DB format to form values with safe property access
          form.reset({
            title: data.title || "",
            description: data.description || "",
            departments: Array.isArray(data.departments) && data.departments.length > 0 
              ? data.departments 
              : data.department ? [data.department] : [],
            candidacyStartDate: data.candidacy_start_date || "",
            candidacyEndDate: data.candidacy_end_date || "",
            startDate: data.start_date || "",
            endDate: data.end_date || "",
            isPrivate: data.is_private || false,
            accessCode: data.access_code || "",
            restrictVoting: data.restrict_voting || false,
            positions: Array.isArray(data.positions) ? data.positions : DEFAULT_POSITIONS,
            banner_urls: Array.isArray(data.banner_urls) ? data.banner_urls : [],
          });
        }
      } catch (error) {
        console.error("Error fetching election:", error);
        toast.error("Failed to load election data");
      }
    }
    
    fetchElectionData();
  }, [editingElectionId, form]);

  const addPosition = () => {
    if (newPosition && newPosition.trim() !== "") {
      if (!positions.includes(newPosition.trim())) {
        form.setValue("positions", [...positions, newPosition.trim()]);
      }
      setNewPosition("");
    }
  };

  const removePosition = (position: string) => {
    form.setValue("positions", positions.filter(p => p !== position));
  };

  /**
   * Handle form submission for creating or updating an election
   */
  const onSubmit = async (values: ElectionFormValues) => {
    if (!user) {
      toast.error("You must be logged in to create or edit an election");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Validate form data
      if (values.isPrivate && (!values.accessCode || values.accessCode.trim() === "")) {
        toast.error("Access code is required for private elections");
        setIsSubmitting(false);
        return;
      }
      
      // Ensure candidacy period ends before voting period starts
      const candidacyEnd = new Date(values.candidacyEndDate);
      const votingStart = new Date(values.startDate);
      
      if (candidacyEnd > votingStart) {
        toast.error("Candidacy period must end before voting period starts");
        setIsSubmitting(false);
        return;
      }
      
      // Determine initial status based on dates
      const now = new Date();
      const startDate = new Date(values.startDate);
      const endDate = new Date(values.endDate);
      
      let status: 'upcoming' | 'active' | 'completed' = 'upcoming';
      if (now >= endDate) {
        status = 'completed';
      } else if (now >= startDate) {
        status = 'active';
      }
      
      // Map the form values to the database schema fields
      let electionData = {
        title: values.title,
        description: values.description || "",
        department: values.departments.includes("University-wide") ? "University-wide" : values.departments[0], // For backward compatibility
        departments: values.departments,
        candidacy_start_date: values.candidacyStartDate,
        candidacy_end_date: values.candidacyEndDate,
        start_date: values.startDate,
        end_date: values.endDate,
        created_by: user.id,
        is_private: values.isPrivate,
        access_code: values.isPrivate ? values.accessCode : null,
        restrict_voting: values.restrictVoting,
        status: status,
        positions: values.positions,
        banner_urls: values.banner_urls
      };
      
      let electionId: string;
      
      if (editingElectionId) {
        // Update existing election
        console.log("Updating election with ID:", editingElectionId);
        console.log("Update data:", electionData);
        
        const { error } = await supabase
          .from('elections')
          .update(electionData)
          .eq('id', editingElectionId);
        
        if (error) {
          console.error("Update error:", error);
          toast.error(`Failed to update election: ${error.message}`);
          throw error;
        }
        
        electionId = editingElectionId;
        
        // Handle updating candidates for existing election
        if (candidateManagerRef.current) {
          const candidatesData = candidateManagerRef.current.getCandidatesForNewElection?.();
          console.log("Candidates to update for existing election:", candidatesData);
          
          if (candidatesData && candidatesData.length > 0) {
            // First delete existing candidates
            const { error: deleteError } = await supabase
              .from('candidates')
              .delete()
              .eq('election_id', electionId);
              
            if (deleteError) {
              console.error("Error deleting existing candidates:", deleteError);
              toast.error(`Failed to update candidates: ${deleteError.message}`);
            } else {
              // Then insert new candidates
              const candidatesToInsert = candidatesData.map((candidate: any) => ({
                ...candidate,
                election_id: electionId,
              }));
              
              const { error: insertError } = await supabase
                .from('candidates')
                .insert(candidatesToInsert);
              
              if (insertError) {
                console.error("Error adding updated candidates:", insertError);
                toast.error(`Failed to update candidates: ${insertError.message}`);
              }
            }
          }
        }
        
        toast.success("Election updated successfully");
      } else {
        // Create new election
        const { data: newElection, error } = await supabase
          .from('elections')
          .insert([electionData])
          .select();
        
        if (error) {
          console.error("Insert error:", error);
          toast.error(`Failed to create election: ${error.message}`);
          throw error;
        }
        
        if (!newElection || newElection.length === 0) {
          throw new Error("Failed to create election: No data returned");
        }
        
        electionId = newElection[0].id;
        
        // If there are candidates to add, add them now
        if (candidateManagerRef.current && electionId) {
          const candidatesData = candidateManagerRef.current.getCandidatesForNewElection?.();
          console.log("Candidates to add for new election:", candidatesData);
          
          if (candidatesData && candidatesData.length > 0) {
            const candidatesToInsert = candidatesData.map((candidate: any) => ({
              ...candidate,
              election_id: electionId,
            }));
            
            const { error: candidatesError } = await supabase
              .from('candidates')
              .insert(candidatesToInsert);
            
            if (candidatesError) {
              console.error("Error adding candidates:", candidatesError);
              toast.error(`Failed to add candidates: ${candidatesError.message}`);
            } else {
              console.log("Successfully added candidates to new election");
            }
          }
        }
        
        // If we're restricting voting and there are eligible voters, add them
        if (values.restrictVoting && eligibleVotersManagerRef.current && electionId) {
          const eligibleVoters = eligibleVotersManagerRef.current.getEligibleVotersForNewElection?.();
          console.log("Voters to add:", eligibleVoters);
          
          if (eligibleVoters && eligibleVoters.length > 0) {
            const votersToInsert = eligibleVoters.map((userId: string) => ({
              election_id: electionId,
              user_id: userId,
              added_by: user.id,
            }));
            
            const { error: votersError } = await supabase
              .from('eligible_voters')
              .insert(votersToInsert);
            
            if (votersError) {
              console.error("Error adding eligible voters:", votersError);
              toast.error(`Failed to add eligible voters: ${votersError.message}`);
            }
          }
        }
        
        toast.success("Election created successfully");
      }
      
      onSuccess();
    } catch (error) {
      console.error("Error saving election:", error);
      toast.error("Failed to save election: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden max-h-[90vh]">
      <ScrollArea className="h-[calc(90vh-180px)] px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="banners">Banners</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="voters">Eligible Voters</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Election Title*</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Student Council Election 2023"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="departments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>College/Department*</FormLabel>
                        <div className="space-y-2">
                          {DLSU_DEPARTMENTS.map((dept) => (
                            <div key={dept} className="flex items-center space-x-2">
                              <Checkbox 
                                id={dept}
                                checked={field.value.includes(dept)}
                                onCheckedChange={(checked) => {
                                  const currentDepartments = [...field.value];
                                  if (checked) {
                                    // If University-wide is selected, clear other selections
                                    if (dept === "University-wide") {
                                      form.setValue("departments", ["University-wide"]);
                                    } else {
                                      // If another option is selected, remove University-wide
                                      const newDeps = currentDepartments.filter(d => d !== "University-wide");
                                      newDeps.push(dept);
                                      form.setValue("departments", newDeps);
                                    }
                                  } else {
                                    form.setValue("departments", 
                                      currentDepartments.filter(d => d !== dept)
                                    );
                                  }
                                }}
                              />
                              <Label 
                                htmlFor={dept}
                                className="text-sm font-normal"
                              >
                                {dept}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Select one or more departments for this election. 
                          Only students from selected departments will be eligible to vote or run as candidates.
                        </p>
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
                          <Input 
                            placeholder="Provide a brief description"
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Election Positions</h3>
                    <div className="flex items-end gap-2">
                      <div className="flex-grow">
                        <Label htmlFor="new-position">Add New Position</Label>
                        <Input 
                          id="new-position"
                          placeholder="Enter position name"
                          value={newPosition}
                          onChange={(e) => setNewPosition(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addPosition();
                            }
                          }}
                        />
                      </div>
                      <Button 
                        type="button" 
                        onClick={addPosition}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                    
                    <div className="border rounded-md p-3 space-y-2">
                      {positions.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {positions.map(position => (
                            <div 
                              key={position} 
                              className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-md"
                            >
                              <span>{position}</span>
                              <button
                                type="button"
                                onClick={() => removePosition(position)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-2">
                          No positions added. Add at least one position for candidates.
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold pt-2 flex items-center">
                    Candidacy Period
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="candidacyStartDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Candidacy Start Date*</FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local"
                              {...field} 
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
                          <FormLabel>Candidacy End Date*</FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <h3 className="text-lg font-semibold pt-2 flex items-center">
                    Voting Period
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Voting Start Date*</FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local"
                              {...field} 
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
                          <FormLabel>Voting End Date*</FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="isPrivate"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Make Election Private
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Private elections require an access code to view and participate
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {form.watch("isPrivate") && (
                    <FormField
                      control={form.control}
                      name="accessCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Access Code*</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Required access code for private elections"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="banners">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2 text-[#008f50]" />
                    Election Banners
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Upload banner images for your election. These will be displayed on the election details page.
                  </p>
                  
                  <FormField
                    control={form.control}
                    name="banner_urls"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ElectionBannerUpload 
                            banners={field.value} 
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="candidates">
                <CandidateManager
                  ref={candidateManagerRef}
                  electionId={editingElectionId}
                  isNewElection={!editingElectionId}
                  candidacyStartDate={candidacyStartDate}
                  candidacyEndDate={candidacyEndDate}
                  isAdmin={true}
                  positions={positions}
                />
              </TabsContent>
              
              <TabsContent value="voters">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="restrictVoting"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Restrict Voting
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Only selected users will be allowed to vote in this election
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <EligibleVotersManager
                    ref={eligibleVotersManagerRef}
                    electionId={editingElectionId}
                    isNewElection={!editingElectionId}
                    restrictVoting={restrictVoting}
                    setRestrictVoting={(value) => form.setValue("restrictVoting", value)}
                  />
                </div>
              </TabsContent>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-[#008f50] hover:bg-[#007a45]"
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-white"></span>
                      {editingElectionId ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>{editingElectionId ? "Update Election" : "Create Election"}</>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </ScrollArea>
    </div>
  );
};

export default ElectionForm;
