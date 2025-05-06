
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EligibleVoter {
  id: string;
  userId: string;
  email: string;
  name: string;
}

interface EligibleVotersManagerProps {
  electionId: string | null;
  isNewElection: boolean;
  restrictVoting: boolean;
  setRestrictVoting: (value: boolean) => void;
}

const EligibleVotersManager = ({ 
  electionId, 
  isNewElection, 
  restrictVoting,
  setRestrictVoting 
}: EligibleVotersManagerProps) => {
  const [eligibleVoters, setEligibleVoters] = useState<EligibleVoter[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<{ id: string; email: string; name: string }[]>([]);

  // Fetch existing eligible voters if this is an existing election
  useEffect(() => {
    if (electionId && !isNewElection && restrictVoting) {
      fetchEligibleVoters();
    }
  }, [electionId, isNewElection, restrictVoting]);

  const fetchEligibleVoters = async () => {
    if (!electionId) return;
    
    try {
      setLoading(true);
      // Join eligible_voters with profiles to get user details
      const { data, error } = await supabase
        .from("eligible_voters")
        .select(`
          id,
          user_id,
          profiles:user_id (
            email,
            first_name,
            last_name
          )
        `)
        .eq("election_id", electionId);

      if (error) throw error;

      // Transform data to match our interface
      const formattedVoters = data?.map(item => ({
        id: item.id,
        userId: item.user_id,
        email: item.profiles?.email || "Unknown",
        name: `${item.profiles?.first_name || ""} ${item.profiles?.last_name || ""}`.trim() || "Unknown User"
      })) || [];
      
      setEligibleVoters(formattedVoters);
    } catch (error) {
      console.error("Error fetching eligible voters:", error);
      toast.error("Failed to load eligible voters");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter an email to search");
      return;
    }

    try {
      setLoading(true);
      // Search for users by email
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name")
        .ilike("email", `%${searchQuery}%`)
        .limit(5);

      if (error) throw error;

      // Format the results
      const results = data.map(user => ({
        id: user.id,
        email: user.email,
        name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unknown User"
      }));

      setSearchResults(results);

      if (results.length === 0) {
        toast.info("No users found with that email");
      }
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  const addEligibleVoter = async (userId: string, email: string, name: string) => {
    // For new elections, we just add to the local state
    if (isNewElection || !electionId) {
      // Check if user is already added
      if (eligibleVoters.some(v => v.userId === userId)) {
        toast.error("This user is already added as an eligible voter");
        return;
      }
      
      const tempId = `temp-${Date.now()}`;
      setEligibleVoters(prev => [
        ...prev, 
        { 
          id: tempId,
          userId,
          email,
          name
        }
      ]);
      
      // Reset search
      setSearchQuery("");
      setSearchResults([]);
      return;
    }

    // For existing elections, add directly to the database
    try {
      // Check if user is already added
      const existingCheck = await supabase
        .from("eligible_voters")
        .select("id")
        .eq("election_id", electionId)
        .eq("user_id", userId);

      if (existingCheck.error) throw existingCheck.error;
      
      if (existingCheck.data && existingCheck.data.length > 0) {
        toast.error("This user is already added as an eligible voter");
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("eligible_voters")
        .insert({
          election_id: electionId,
          user_id: userId,
          added_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select();

      if (error) throw error;
      
      // Add the new voter to the list
      if (data && data.length > 0) {
        setEligibleVoters(prev => [...prev, {
          id: data[0].id,
          userId,
          email,
          name
        }]);
        toast.success("Voter added successfully");
      }
      
      // Reset search
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      console.error("Error adding eligible voter:", error);
      toast.error("Failed to add voter");
    } finally {
      setLoading(false);
    }
  };

  const removeEligibleVoter = async (voterId: string) => {
    // For new elections, just remove from local state
    if (isNewElection || voterId.startsWith('temp-')) {
      setEligibleVoters(prev => prev.filter(v => v.id !== voterId));
      toast.success("Voter removed");
      return;
    }

    // For existing elections, remove from database
    try {
      setLoading(true);
      const { error } = await supabase
        .from("eligible_voters")
        .delete()
        .eq("id", voterId);

      if (error) throw error;
      
      setEligibleVoters(prev => prev.filter(v => v.id !== voterId));
      toast.success("Voter removed successfully");
    } catch (error) {
      console.error("Error removing voter:", error);
      toast.error("Failed to remove voter");
    } finally {
      setLoading(false);
    }
  };

  // Prepare voters data to be saved with new election
  const getEligibleVotersForNewElection = () => {
    return eligibleVoters.map(v => v.userId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start space-x-2">
        <div>
          <Checkbox 
            id="restrictVoting"
            checked={restrictVoting}
            onCheckedChange={(checked) => setRestrictVoting(checked as boolean)}
          />
        </div>
        <div className="space-y-1 leading-none">
          <Label htmlFor="restrictVoting" className="text-base">Restrict Voting</Label>
          <p className="text-sm text-muted-foreground">
            Only allow specific users to vote in this election
          </p>
        </div>
      </div>
      
      {restrictVoting && (
        <>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <Label htmlFor="searchEmail">Search Users by Email</Label>
              <div className="flex gap-2 mt-1">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="searchEmail"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter email address..."
                    className="pl-9"
                  />
                </div>
                <Button 
                  type="button" 
                  onClick={handleSearchUsers}
                  disabled={loading || searchQuery.trim() === ""}
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
          
          {searchResults.length > 0 && (
            <div className="border rounded-md mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => addEligibleVoter(user.id, user.email, user.name)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          <h3 className="text-lg font-medium mt-6">Eligible Voters</h3>
          
          {eligibleVoters.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eligibleVoters.map((voter) => (
                    <TableRow key={voter.id}>
                      <TableCell>{voter.email}</TableCell>
                      <TableCell>{voter.name}</TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Voter?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {voter.email} from eligible voters?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => removeEligibleVoter(voter.id)}
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
              <p className="text-muted-foreground">No eligible voters added yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Search for users by email to add them as eligible voters
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export { EligibleVotersManager, type EligibleVotersManagerProps };
