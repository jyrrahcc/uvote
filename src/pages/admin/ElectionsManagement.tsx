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

/**
 * Admin page for managing elections
 */
const ElectionsManagement = () => {
  console.log("ElectionsManagement component rendering"); // Add rendering log
  
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [editingElectionId, setEditingElectionId] = useState<string | null>(null);
  
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !startDate || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      let electionData: any = {
        title,
        description,
        start_date: startDate,
        end_date: endDate,
        created_by: user?.id,
        is_private: isPrivate,
        access_code: isPrivate ? accessCode : null,
      };
      
      if (editingElectionId) {
        // Update existing election
        const { error } = await supabase
          .from('elections')
          .update(electionData)
          .eq('id', editingElectionId);
        
        if (error) throw error;
        
        toast.success("Election updated successfully");
      } else {
        // Create new election
        const { error } = await supabase
          .from('elections')
          .insert([electionData]);
        
        if (error) throw error;
        
        toast.success("Election created successfully");
      }
      
      // Reset form and refresh elections list
      resetForm();
      fetchElections();
    } catch (error) {
      console.error("Error saving election:", error);
      toast.error("Failed to save election");
    }
  };
  
  /**
   * Load election data into form for editing
   */
  const handleEditElection = (election: Election) => {
    setTitle(election.title);
    setDescription(election.description);
    setStartDate(election.startDate);
    setEndDate(election.endDate);
    setIsPrivate(election.isPrivate);
    setAccessCode(election.accessCode || "");
    setEditingElectionId(election.id);
  };
  
  /**
   * Delete an election and all related data
   */
  const handleDeleteElection = async (electionId: string) => {
    try {
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
    setTitle("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setIsPrivate(false);
    setAccessCode("");
    setEditingElectionId(null);
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

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Manage Elections</h1>
      
      {/* Create/Edit Election Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-6">
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
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title*</Label>
                <Input 
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Board Election 2023"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input 
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a brief description"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date*</Label>
                  <Input 
                    id="startDate"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date*</Label>
                  <Input 
                    id="endDate"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="isPrivate" 
                  checked={isPrivate}
                  onCheckedChange={(checked) => setIsPrivate(checked === true)}
                />
                <Label htmlFor="isPrivate">Private Election</Label>
              </div>
              
              {isPrivate && (
                <div className="space-y-2">
                  <Label htmlFor="accessCode">Access Code*</Label>
                  <Input 
                    id="accessCode"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Create a code for voters to access this election"
                    required={isPrivate}
                  />
                  <p className="text-sm text-muted-foreground">
                    You will need to share this code with voters.
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Elections Table */}
      {loading ? (
        <div className="text-center py-12">
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
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditElection(election)}
                          >
                            <Pencil className="h-4 w-4" />
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
                          
                          <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="grid grid-cols-1 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-title">Title*</Label>
                                <Input 
                                  id="edit-title"
                                  value={title}
                                  onChange={(e) => setTitle(e.target.value)}
                                  placeholder="e.g., Board Election 2023"
                                  required
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Input 
                                  id="edit-description"
                                  value={description}
                                  onChange={(e) => setDescription(e.target.value)}
                                  placeholder="Provide a brief description"
                                />
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-startDate">Start Date*</Label>
                                  <Input 
                                    id="edit-startDate"
                                    type="datetime-local"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="edit-endDate">End Date*</Label>
                                  <Input 
                                    id="edit-endDate"
                                    type="datetime-local"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    required
                                  />
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 pt-2">
                                <Checkbox 
                                  id="edit-isPrivate" 
                                  checked={isPrivate}
                                  onCheckedChange={(checked) => setIsPrivate(checked === true)}
                                />
                                <Label htmlFor="edit-isPrivate">Private Election</Label>
                              </div>
                              
                              {isPrivate && (
                                <div className="space-y-2">
                                  <Label htmlFor="edit-accessCode">Access Code*</Label>
                                  <Input 
                                    id="edit-accessCode"
                                    value={accessCode}
                                    onChange={(e) => setAccessCode(e.target.value)}
                                    placeholder="Create a code for voters to access this election"
                                    required={isPrivate}
                                  />
                                  <p className="text-sm text-muted-foreground">
                                    You will need to share this code with voters.
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button type="button" variant="outline" onClick={resetForm}>
                                  Cancel
                                </Button>
                              </DialogClose>
                              <Button type="submit">Save</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                      
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
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Election
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Election</DialogTitle>
                <DialogDescription>
                  Fill in the details for your election. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-title">Title*</Label>
                    <Input 
                      id="new-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Board Election 2023"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-description">Description</Label>
                    <Input 
                      id="new-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide a brief description"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-startDate">Start Date*</Label>
                      <Input 
                        id="new-startDate"
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-endDate">End Date*</Label>
                      <Input 
                        id="new-endDate"
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox 
                      id="new-isPrivate" 
                      checked={isPrivate}
                      onCheckedChange={(checked) => setIsPrivate(checked === true)}
                    />
                    <Label htmlFor="new-isPrivate">Private Election</Label>
                  </div>
                  
                  {isPrivate && (
                    <div className="space-y-2">
                      <Label htmlFor="new-accessCode">Access Code*</Label>
                      <Input 
                        id="new-accessCode"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                        placeholder="Create a code for voters to access this election"
                        required={isPrivate}
                      />
                      <p className="text-sm text-muted-foreground">
                        You will need to share this code with voters.
                      </p>
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit">Save</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default ElectionsManagement;
