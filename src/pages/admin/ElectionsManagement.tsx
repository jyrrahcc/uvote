
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Eye, University, Calendar } from "lucide-react";
import { Election, mapDbElectionToElection, mapElectionToDbElection } from "@/types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CandidateManager from "@/features/elections/components/CandidateManager";
import EligibleVotersManager from "@/features/elections/components/EligibleVotersManager";
import { ScrollArea } from "@/components/ui/scroll-area";

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

/**
 * Form validation schema with date validations
 */
const electionFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  department: z.string().optional(),
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

type ElectionFormValues = z.infer<typeof electionFormSchema>;

/**
 * Admin page for managing elections
 */
const ElectionsManagement = () => {
  console.log("ElectionsManagement component rendering");
  
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingElectionId, setEditingElectionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const candidateManagerRef = useRef<any>(null);
  const eligibleVotersManagerRef = useRef<any>(null);
  
  // Initialize form
  const form = useForm<ElectionFormValues>({
    resolver: zodResolver(electionFormSchema),
    defaultValues: {
      title: "",
      description: "",
      department: "",
      candidacyStartDate: "",
      candidacyEndDate: "",
      startDate: "",
      endDate: "",
      isPrivate: false,
      accessCode: "",
      restrictVoting: false,
    },
  });

  // Extract candidacy dates for the CandidateManager
  const candidacyStartDate = form.watch("candidacyStartDate");
  const candidacyEndDate = form.watch("candidacyEndDate");
  
  // Fetch elections on component mount
  useEffect(() => {
    console.log("ElectionsManagement useEffect triggered, user:", user?.id);
    if (user) {
      fetchElections();
    }
  }, [user]);
  
  /**
   * Fetch all elections from the database
   */
  const fetchElections = async () => {
    try {
      setLoading(true);
      console.log("Fetching elections for admin...");
      
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching elections:", error);
        throw error;
      }
      
      console.log("Elections data retrieved:", data);
      
      // Transform the data to match our Election interface
      const transformedElections = data?.map(mapDbElectionToElection) || [];
      console.log("Transformed elections:", transformedElections);
      
      setElections(transformedElections);
    } catch (error) {
      console.error("Error in fetchElections function:", error);
      toast.error("Failed to load elections");
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Handle form submission for creating or updating an election
   */
  const onSubmit = async (values: ElectionFormValues) => {
    console.log("Form submission values:", values);
    
    try {
      // Validate form data
      if (values.isPrivate && (!values.accessCode || values.accessCode.trim() === "")) {
        toast.error("Access code is required for private elections");
        return;
      }
      
      // Ensure candidacy period ends before voting period starts
      const candidacyEnd = new Date(values.candidacyEndDate);
      const votingStart = new Date(values.startDate);
      
      if (candidacyEnd > votingStart) {
        toast.error("Candidacy period must end before voting period starts");
        return;
      }
      
      let electionData: any = {
        title: values.title,
        description: values.description || "",
        department: values.department || "",
        candidacy_start_date: values.candidacyStartDate,
        candidacy_end_date: values.candidacyEndDate,
        start_date: values.startDate,
        end_date: values.endDate,
        created_by: user?.id,
        is_private: values.isPrivate,
        access_code: values.isPrivate ? values.accessCode : null,
        restrict_voting: values.restrictVoting,
      };
      
      console.log("Election data to be saved:", electionData);
      
      if (editingElectionId) {
        // Update existing election
        console.log("Updating election with ID:", editingElectionId);
        const { error } = await supabase
          .from('elections')
          .update(electionData)
          .eq('id', editingElectionId);
        
        if (error) {
          console.error("Error updating election:", error);
          throw error;
        }
        
        toast.success("Election updated successfully");
      } else {
        // Create new election
        console.log("Creating new election");
        const { data: newElection, error } = await supabase
          .from('elections')
          .insert([electionData])
          .select();
        
        if (error) {
          console.error("Error creating election:", error);
          throw error;
        }
        
        if (newElection && newElection.length > 0) {
          // If there are candidates to add, add them now
          if (candidateManagerRef.current && newElection[0].id) {
            const candidatesData = candidateManagerRef.current.getCandidatesForNewElection?.();
            if (candidatesData && candidatesData.length > 0) {
              const candidatesToInsert = candidatesData.map((candidate: any) => ({
                ...candidate,
                election_id: newElection[0].id,
              }));
              
              const { error: candidatesError } = await supabase
                .from('candidates')
                .insert(candidatesToInsert);
              
              if (candidatesError) {
                console.error("Error adding candidates:", candidatesError);
                toast.error("Failed to add candidates");
              }
            }
          }
          
          // If we're restricting voting and there are eligible voters, add them
          if (values.restrictVoting && eligibleVotersManagerRef.current && newElection[0].id) {
            const eligibleVoters = eligibleVotersManagerRef.current.getEligibleVotersForNewElection?.();
            if (eligibleVoters && eligibleVoters.length > 0) {
              const votersToInsert = eligibleVoters.map((userId: string) => ({
                election_id: newElection[0].id,
                user_id: userId,
                added_by: user?.id,
              }));
              
              const { error: votersError } = await supabase
                .from('eligible_voters')
                .insert(votersToInsert);
              
              if (votersError) {
                console.error("Error adding eligible voters:", votersError);
                toast.error("Failed to add eligible voters");
              }
            }
          }
        }
        
        toast.success("Election created successfully");
      }
      
      // Reset form and refresh elections list
      resetForm();
      setIsDialogOpen(false); // Close dialog only after successful submission
      fetchElections();
    } catch (error) {
      console.error("Error saving election:", error);
      toast.error("Failed to save election");
      // Don't close the dialog on error
    }
  };
  
  /**
   * Load election data into form for editing
   */
  const handleEditElection = (election: Election) => {
    console.log("Loading election for editing:", election);
    form.reset({
      title: election.title,
      description: election.description,
      department: election.department || "",
      candidacyStartDate: election.candidacyStartDate || "",
      candidacyEndDate: election.candidacyEndDate || "",
      startDate: election.startDate,
      endDate: election.endDate,
      isPrivate: election.isPrivate,
      accessCode: election.accessCode || "",
      restrictVoting: election.restrictVoting || false,
    });
    setEditingElectionId(election.id);
    setIsDialogOpen(true);
    setActiveTab("details");
  };
  
  /**
   * Delete an election and all related data
   */
  const handleDeleteElection = async (electionId: string) => {
    try {
      console.log("Deleting election with ID:", electionId);
      const { error } = await supabase
        .from('elections')
        .delete()
        .eq('id', electionId);
      
      if (error) throw error;
      
      // Update the local state by filtering out the deleted election
      const updatedElections = elections.filter(election => election.id !== electionId);
      setElections(updatedElections);
      
      toast.success("Election deleted successfully");
    } catch (error) {
      console.error("Error deleting election:", error);
      toast.error("Failed to delete election");
    }
  };
  
  /**
   * Reset the form to its initial state
   */
  const resetForm = () => {
    form.reset({
      title: "",
      description: "",
      department: "",
      candidacyStartDate: "",
      candidacyEndDate: "",
      startDate: "",
      endDate: "",
      isPrivate: false,
      accessCode: "",
      restrictVoting: false,
    });
    setEditingElectionId(null);
    setActiveTab("details");
  };
  
  /**
   * Handle dialog close event
   */
  const handleDialogClose = () => {
    resetForm();
    setIsDialogOpen(false);
  };
  
  /**
   * Open dialog for creating a new election
   */
  const handleNewElection = () => {
    resetForm();
    setEditingElectionId(null);
    setIsDialogOpen(true);
  };

  // Add debounced re-fetch on error
  useEffect(() => {
    if (elections.length === 0 && !loading) {
      const timer = setTimeout(() => {
        console.log("No elections found, retrying fetch...");
        fetchElections();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [elections, loading]);

  console.log("Current elections state:", elections.length, "items");
  console.log("Loading state:", loading);
  console.log("Dialog open state:", isDialogOpen);

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex items-center mb-8">
        <University className="h-8 w-8 mr-3 text-[#008f50]" />
        <h1 className="text-3xl font-bold">Manage DLSU-D Elections</h1>
      </div>
      
      {/* Create/Edit Election Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) handleDialogClose();
        setIsDialogOpen(open);
      }}>
        <DialogTrigger asChild>
          <Button className="mb-6 bg-[#008f50] hover:bg-[#007a45]" onClick={handleNewElection}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Election
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] overflow-hidden max-h-[90vh]">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>
              {editingElectionId ? "Edit Election" : "Create New Election"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details for your DLSU-D election. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[calc(90vh-180px)] px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
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
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>College/Department</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="University-wide">University-wide</SelectItem>
                                {DLSU_DEPARTMENTS.filter(dept => dept !== "University-wide").map(dept => (
                                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground">
                              Select the department this election belongs to
                            </p>
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
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <h3 className="text-lg font-semibold pt-2 flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-[#008f50]" />
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
                        <Calendar className="h-5 w-5 mr-2 text-[#008f50]" />
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
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Private Election</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Require an access code to view and vote in this election
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
                                  placeholder="Create a code for voters to access this election"
                                  {...field} 
                                />
                              </FormControl>
                              <p className="text-sm text-muted-foreground">
                                You will need to share this code with voters.
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      <FormField
                        control={form.control}
                        name="restrictVoting"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Restrict Voting</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Only allow specific DLSU-D community members to vote in this election
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="candidates" className="space-y-4">
                    <CandidateManager
                      electionId={editingElectionId}
                      isNewElection={!editingElectionId}
                      candidacyStartDate={candidacyStartDate}
                      candidacyEndDate={candidacyEndDate}
                      ref={candidateManagerRef}
                    />
                  </TabsContent>
                  
                  <TabsContent value="voters" className="space-y-4">
                    <EligibleVotersManager
                      electionId={editingElectionId}
                      isNewElection={!editingElectionId}
                      restrictVoting={form.watch("restrictVoting")}
                      setRestrictVoting={(value) => form.setValue("restrictVoting", value)}
                      ref={eligibleVotersManagerRef}
                    />
                  </TabsContent>
                </form>
              </Form>
            </Tabs>
          </ScrollArea>
          
          <DialogFooter className="p-6 border-t">
            <Button type="button" variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button 
              type="button" 
              className="bg-[#008f50] hover:bg-[#007a45]" 
              onClick={form.handleSubmit(onSubmit)}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Elections Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-10 h-10 border-4 border-[#008f50] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl mb-2">Loading elections...</p>
          <p className="text-sm text-muted-foreground">Please wait while we fetch election data.</p>
        </div>
      ) : elections.length > 0 ? (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>College/Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Candidacy Period</TableHead>
                <TableHead>Voting Period</TableHead>
                <TableHead>Privacy</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {elections.map((election) => (
                <TableRow key={election.id}>
                  <TableCell className="font-medium">{election.title}</TableCell>
                  <TableCell>{election.department || "University-wide"}</TableCell>
                  <TableCell className="capitalize">{election.status}</TableCell>
                  <TableCell>
                    {election.candidacyStartDate && election.candidacyEndDate
                      ? `${new Date(election.candidacyStartDate).toLocaleDateString()} - ${new Date(election.candidacyEndDate).toLocaleDateString()}`
                      : "Not specified"}
                  </TableCell>
                  <TableCell>{`${new Date(election.startDate).toLocaleDateString()} - ${new Date(election.endDate).toLocaleDateString()}`}</TableCell>
                  <TableCell>{election.isPrivate ? "Private" : "Public"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/elections/${election.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditElection(election)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the election "{election.title}" and all associated data including
                              candidates and votes. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDeleteElection(election.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-10 border rounded-md">
          <p className="text-muted-foreground mb-4">No elections created yet</p>
          <Button onClick={handleNewElection} className="bg-[#008f50] hover:bg-[#007a45]">
            <Plus className="mr-2 h-4 w-4" />
            Create Your First DLSU-D Election
          </Button>
        </div>
      )}
    </div>
  );
};

export default ElectionsManagement;
