
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Trash2, Eye, RefreshCcw } from "lucide-react";
import { Election } from "@/types";

interface ElectionTableProps {
  elections: Election[];
  onEditElection: (election: Election) => void;
  onElectionDeleted: () => void;
}

const ElectionTable = ({ elections, onEditElection, onElectionDeleted }: ElectionTableProps) => {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  
  /**
   * Delete an election and all related data
   */
  const handleDeleteElection = async (electionId: string) => {
    try {
      setDeletingId(electionId);
      
      const { error } = await supabase
        .from('elections')
        .delete()
        .eq('id', electionId);
      
      if (error) throw error;
      
      toast.success("Election deleted successfully");
      onElectionDeleted();
    } catch (error) {
      console.error("Error deleting election:", error);
      toast.error("Failed to delete election");
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Reset all votes for an election
   */
  const handleResetVotes = async (electionId: string) => {
    try {
      setResettingId(electionId);
      
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('election_id', electionId);
      
      if (error) throw error;
      
      toast.success("Election votes have been reset successfully", {
        description: "All voters can now vote again in this election"
      });
      onElectionDeleted(); // Refresh the list
    } catch (error) {
      console.error("Error resetting election votes:", error);
      toast.error("Failed to reset election votes");
    } finally {
      setResettingId(null);
    }
  };

  return (
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
                    onClick={() => onEditElection(election)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-amber-600"
                      >
                        <RefreshCcw className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reset Election Votes?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all votes for the election "{election.title}". 
                          All voters will be able to vote again. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-amber-600 text-white hover:bg-amber-700"
                          onClick={() => handleResetVotes(election.id)}
                        >
                          {resettingId === election.id ? "Resetting..." : "Reset Votes"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
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
                          {deletingId === election.id ? "Deleting..." : "Delete"}
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
  );
};

export default ElectionTable;
