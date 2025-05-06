
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Candidate } from "@/types";
import { supabase } from "@/integrations/supabase/client";

interface CandidateManagerProps {
  electionId: string | null;
  isNewElection: boolean;
}

const CandidateManager = ({ electionId, isNewElection }: CandidateManagerProps) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    position: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);

  // Fetch existing candidates if this is an existing election
  useEffect(() => {
    if (electionId && !isNewElection) {
      fetchCandidates();
    }
  }, [electionId, isNewElection]);

  const fetchCandidates = async () => {
    if (!electionId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .eq("election_id", electionId);

      if (error) throw error;
      
      setCandidates(data || []);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCandidate(prev => ({ ...prev, [name]: value }));
  };

  const addCandidate = async () => {
    // For new elections, we just add to the local state since the election doesn't exist yet
    if (isNewElection || !electionId) {
      if (!newCandidate.name || !newCandidate.position) {
        toast.error("Name and position are required");
        return;
      }
      
      const tempId = `temp-${Date.now()}`;
      setCandidates(prev => [
        ...prev, 
        { 
          id: tempId, 
          name: newCandidate.name, 
          position: newCandidate.position, 
          bio: newCandidate.bio,
          electionId: electionId || "",
          createdAt: new Date().toISOString(),
          imageUrl: ""
        }
      ]);
      
      // Reset form
      setNewCandidate({ name: "", position: "", bio: "" });
      return;
    }

    // For existing elections, add directly to the database
    try {
      if (!newCandidate.name || !newCandidate.position) {
        toast.error("Name and position are required");
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("candidates")
        .insert({
          name: newCandidate.name,
          position: newCandidate.position,
          bio: newCandidate.bio || null,
          election_id: electionId
        })
        .select();

      if (error) throw error;
      
      // Add the new candidate to the list
      if (data && data.length > 0) {
        setCandidates(prev => [...prev, data[0]]);
        toast.success("Candidate added successfully");
      }
      
      // Reset form
      setNewCandidate({ name: "", position: "", bio: "" });
    } catch (error) {
      console.error("Error adding candidate:", error);
      toast.error("Failed to add candidate");
    } finally {
      setLoading(false);
    }
  };

  const removeCandidate = async (candidateId: string) => {
    // For new elections, just remove from local state
    if (isNewElection || candidateId.startsWith('temp-')) {
      setCandidates(prev => prev.filter(c => c.id !== candidateId));
      toast.success("Candidate removed");
      return;
    }

    // For existing elections, remove from database
    try {
      setLoading(true);
      const { error } = await supabase
        .from("candidates")
        .delete()
        .eq("id", candidateId);

      if (error) throw error;
      
      setCandidates(prev => prev.filter(c => c.id !== candidateId));
      toast.success("Candidate removed successfully");
    } catch (error) {
      console.error("Error removing candidate:", error);
      toast.error("Failed to remove candidate");
    } finally {
      setLoading(false);
    }
  };

  // Prepare candidates data to be saved with new election
  const getCandidatesForNewElection = () => {
    return candidates.map(c => ({
      name: c.name,
      position: c.position,
      bio: c.bio || null
    }));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Add Candidates</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="name">Name*</Label>
          <Input
            id="name"
            name="name"
            value={newCandidate.name}
            onChange={handleInputChange}
            placeholder="Candidate name"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="position">Position*</Label>
          <Input
            id="position"
            name="position"
            value={newCandidate.position}
            onChange={handleInputChange}
            placeholder="e.g., President, Board Member"
            className="mt-1"
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            value={newCandidate.bio}
            onChange={handleInputChange}
            placeholder="Candidate biography"
            className="mt-1"
            rows={3}
          />
        </div>
      </div>
      
      <Button 
        type="button" 
        variant="outline" 
        onClick={addCandidate} 
        disabled={loading}
        className="mt-2"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Candidate
      </Button>

      {candidates.length > 0 ? (
        <div className="border rounded-md mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell className="font-medium">{candidate.name}</TableCell>
                  <TableCell>{candidate.position}</TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Candidate?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {candidate.name} from this election?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => removeCandidate(candidate.id)}
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-4 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">No candidates added yet</p>
        </div>
      )}
    </div>
  );
};

export { CandidateManager, type CandidateManagerProps };
