
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { Election, mapDbElectionToElection, mapElectionToDbElection } from "@/types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

/**
 * Form validation schema
 */
const electionFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isPrivate: z.boolean().default(false),
  accessCode: z.string().optional()
    .refine(val => {
      // Only validate access code if isPrivate is true
      if (val === undefined) return true;
      return true;
    })
});

type ElectionFormValues = z.infer<typeof electionFormSchema>;

/**
 * Admin page for managing elections
 */
const ElectionsManagement = () => {
  console.log("ElectionsManagement component rendering"); // Add rendering log
  
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingElectionId, setEditingElectionId] = useState<string | null>(null);
  
  // Initialize form
  const form = useForm<ElectionFormValues>({
    resolver: zodResolver(electionFormSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      isPrivate: false,
      accessCode: "",
    },
  });
  
  // Fetch elections on component mount
  useEffect(() => {
    console.log("ElectionsManagement useEffect triggered, user:", user?.id); // Debug user info
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
      
      let electionData: any = {
        title: values.title,
        description: values.description || "",
        start_date: values.startDate,
        end_date: values.endDate,
        created_by: user?.id,
        is_private: values.isPrivate,
        access_code: values.isPrivate ? values.accessCode : null,
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
        const { error } = await supabase
          .from('elections')
          .insert([electionData]);
        
        if (error) {
          console.error("Error creating election:", error);
          throw error;
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
      startDate: election.startDate,
      endDate: election.endDate,
      isPrivate: election.isPrivate,
      accessCode: election.accessCode || "",
    });
    setEditingElectionId(election.id);
    setIsDialogOpen(true);
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
      startDate: "",
      endDate: "",
      isPrivate: false,
      accessCode: "",
    });
    setEditingElectionId(null);
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

  console.log("Current elections state:", elections.length, "items"); // Debug current state
  console.log("Loading state:", loading);
  console.log("Dialog open state:", isDialogOpen);

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Manage Elections</h1>
      
      {/* Create/Edit Election Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mb-6" onClick={handleNewElection}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Election
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingElectionId ? "Edit Election" : "Create New Election"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details for your election. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title*</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Board Election 2023"
                          {...field} 
                        />
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
                        <Input 
                          placeholder="Provide a brief description"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date*</FormLabel>
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
                        <FormLabel>End Date*</FormLabel>
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
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Elections Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl mb-2">Loading elections...</p>
          <p className="text-sm text-muted-foreground">Please wait while we fetch election data.</p>
        </div>
      ) : elections.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Privacy</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {elections.map((election) => (
                <TableRow key={election.id}>
                  <TableCell className="font-medium">{election.title}</TableCell>
                  <TableCell className="capitalize">{election.status}</TableCell>
                  <TableCell>{new Date(election.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(election.endDate).toLocaleDateString()}</TableCell>
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
          <Button onClick={handleNewElection}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Election
          </Button>
        </div>
      )}
    </div>
  );
};

export default ElectionsManagement;
