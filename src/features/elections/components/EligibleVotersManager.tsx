import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Search, User, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EligibleVotersManagerProps {
  electionId: string | null;
  isNewElection: boolean;
  restrictVoting: boolean;
  setRestrictVoting: (value: boolean) => void;
}

interface VoterEntry {
  id: string;
  email: string;
  name: string;
  isSelected?: boolean;
}

const EligibleVotersManager = forwardRef<any, EligibleVotersManagerProps>(({
  electionId,
  isNewElection,
  restrictVoting,
  setRestrictVoting
}, ref) => {
  const [voters, setVoters] = useState<VoterEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedVoters, setSelectedVoters] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Get the current user ID on component load
  useEffect(() => {
    const fetchUserId = async () => {
      const { data } = await supabase.auth.getSession();
      setUserId(data.session?.user?.id || null);
    };
    
    fetchUserId();
  }, []);
  
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getEligibleVotersForNewElection: () => selectedVoters
  }));
  
  // Fetch existing eligible voters if editing an election
  useEffect(() => {
    if (electionId && !isNewElection && restrictVoting) {
      fetchEligibleVoters();
    }
  }, [electionId, isNewElection, restrictVoting]);
  
  // Fetch users to select from
  useEffect(() => {
    if (restrictVoting) {
      fetchUsers();
    }
  }, [restrictVoting]);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch users from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .order('first_name', { ascending: true });
      
      if (error) throw error;
      
      // Transform data to voter entries
      const transformedData = data?.map(user => ({
        id: user.id,
        email: user.email || "",
        name: `${user.first_name} ${user.last_name}`.trim() || "Unnamed User",
        isSelected: selectedVoters.includes(user.id)
      })) || [];
      
      setVoters(transformedData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchEligibleVoters = async () => {
    try {
      if (!electionId) return;
      
      setLoading(true);
      
      // Get IDs of eligible voters
      const { data, error } = await supabase
        .from('eligible_voters')
        .select('user_id')
        .eq('election_id', electionId);
      
      if (error) throw error;
      
      // Set selected voters
      const eligibleVoterIds = data?.map(v => v.user_id) || [];
      setSelectedVoters(eligibleVoterIds);
      
    } catch (error) {
      console.error("Error fetching eligible voters:", error);
      toast.error("Failed to load eligible voters");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectVoter = (voterId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedVoters(prev => [...prev, voterId]);
    } else {
      setSelectedVoters(prev => prev.filter(id => id !== voterId));
    }
  };
  
  const handleSaveEligibleVoters = async () => {
    if (!electionId || isNewElection || !userId) return;
    
    try {
      setSaving(true);
      
      // Delete existing eligible voters
      const { error: deleteError } = await supabase
        .from('eligible_voters')
        .delete()
        .eq('election_id', electionId);
      
      if (deleteError) throw deleteError;
      
      if (selectedVoters.length > 0) {
        // Create an array of eligible voter objects
        const eligibleVoters = selectedVoters.map(voterId => ({
          election_id: electionId,
          user_id: voterId,
          added_by: userId
        }));
        
        const { error: insertError } = await supabase
          .from('eligible_voters')
          .insert(eligibleVoters);
        
        if (insertError) throw insertError;
      }
      
      toast.success("Eligible voters saved successfully");
    } catch (error) {
      console.error("Error saving eligible voters:", error);
      toast.error("Failed to save eligible voters");
    } finally {
      setSaving(false);
    }
  };
  
  const filteredVoters = voters.filter(voter => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      voter.name.toLowerCase().includes(searchTermLower) ||
      voter.email.toLowerCase().includes(searchTermLower)
    );
  });

  const handleToggleAllVoters = (checked: boolean) => {
    if (checked) {
      // Select all filtered voters
      const allFilteredVoterIds = filteredVoters.map(voter => voter.id);
      setSelectedVoters(allFilteredVoterIds);
    } else {
      // Deselect all filtered voters
      setSelectedVoters([]);
    }
  };
  
  // If voting is not restricted, don't show any eligible voters UI
  if (!restrictVoting) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Eligible Voters</CardTitle>
          <CardDescription>
            Voting is currently open to all users. Enable "Restrict Voting" in the Details tab to limit who can vote in this election.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Open to All Voters</h3>
            <p className="text-muted-foreground max-w-md">
              Anyone with access to this election will be able to vote. To restrict voting to specific users, 
              go back to the Details tab and enable the "Restrict Voting" option.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Eligible Voters</CardTitle>
        <CardDescription>
          Select which users are allowed to vote in this election. Only selected users will be able to cast a vote.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label htmlFor="search-voters" className="text-sm font-medium mb-2 block">
                Search Users
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="search-voters"
                  placeholder="Search by name or email"
                  className="pl-8" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="border rounded-md">
            {loading ? (
              <div className="py-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Loading users...</p>
              </div>
            ) : voters.length === 0 ? (
              <div className="py-8 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={
                            filteredVoters.length > 0 && 
                            filteredVoters.every(voter => selectedVoters.includes(voter.id))
                          } 
                          onCheckedChange={handleToggleAllVoters}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVoters.map(voter => (
                      <TableRow key={voter.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedVoters.includes(voter.id)}
                            onCheckedChange={(checked) => handleSelectVoter(voter.id, !!checked)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{voter.name}</TableCell>
                        <TableCell>{voter.email}</TableCell>
                      </TableRow>
                    ))}
                    
                    {filteredVoters.length === 0 && searchTerm && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8">
                          <p className="text-muted-foreground">No matching users found</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedVoters.length} {selectedVoters.length === 1 ? 'user' : 'users'} selected
            </p>
            
            {!isNewElection && (
              <Button 
                onClick={handleSaveEligibleVoters}
                disabled={saving}
                className="bg-[#008f50] hover:bg-[#007a45]"
              >
                {saving ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-white"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Save Eligible Voters
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

EligibleVotersManager.displayName = "EligibleVotersManager"; // Required for forwardRef components

export default EligibleVotersManager;
