
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Plus, University } from "lucide-react";
import { Election, mapDbElectionToElection } from "@/types";
import ElectionTable from "@/components/admin/ElectionTable";
import ElectionForm from "@/components/admin/ElectionForm";

/**
 * Admin page for managing elections
 */
const ElectionsManagement = () => {
  const { user } = useAuth();
  
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingElectionId, setEditingElectionId] = useState<string | null>(null);
  
  // Fetch elections on component mount
  useEffect(() => {
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
      
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Transform the data to match our Election interface
      const transformedElections = data?.map(mapDbElectionToElection) || [];
      setElections(transformedElections);
    } catch (error) {
      console.error("Error in fetchElections function:", error);
      toast.error("Failed to load elections");
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Load election data into form for editing
   */
  const handleEditElection = (election: Election) => {
    setEditingElectionId(election.id);
    setIsDialogOpen(true);
  };

  /**
   * Handle dialog close event
   */
  const handleDialogClose = () => {
    setEditingElectionId(null);
    setIsDialogOpen(false);
  };
  
  /**
   * Open dialog for creating a new election
   */
  const handleNewElection = () => {
    setEditingElectionId(null);
    setIsDialogOpen(true);
  };

  /**
   * Handle successful form submission
   */
  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setEditingElectionId(null);
    fetchElections();
  };

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
        <DialogContent className="sm:max-w-[800px] p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>
              {editingElectionId ? "Edit Election" : "Create New Election"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details for your DLSU-D election. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <ElectionForm
            editingElectionId={editingElectionId}
            onSuccess={handleFormSuccess}
            onCancel={handleDialogClose}
          />
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
        <ElectionTable 
          elections={elections} 
          onEditElection={handleEditElection}
          onElectionDeleted={fetchElections}
        />
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
